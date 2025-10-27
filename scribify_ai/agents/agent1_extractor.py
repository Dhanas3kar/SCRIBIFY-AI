# ============================================================
# Agent 1 — Document Intelligence v5.4 (Gemini 2.5 Flash)
# ============================================================

import os, json, fitz, concurrent.futures, re, time, shutil
from pathlib import Path
from PIL import Image
import google.generativeai as genai

# -------------------------------
# Gemini Configuration
# -------------------------------
os.environ["GOOGLE_API_KEY"] = "AIzaSyCXUQ-6FuRqBQQwc43IEq49dvoHv9usnZ8"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
GEMINI_MODEL = genai.GenerativeModel("gemini-2.5-flash")

# ============================================================
# PDF → Image
# ============================================================
def pdf_to_images(pdf_path: str, out_dir="data/tmp_pages", dpi=150):
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    paths = []
    for i, page in enumerate(doc, start=1):
        pix = page.get_pixmap(dpi=dpi)
        img_path = os.path.join(out_dir, f"{Path(pdf_path).stem}_page{i}.jpg")
        pix.save(img_path)
        paths.append((i, img_path))
    return paths

# ============================================================
# Gemini Extraction
# ============================================================
def extract_page_data(page_no: int, img_path: str):
    img = Image.open(img_path)
    prompt = """
    You are a precise exam document analyzer.

    Extract all handwritten or printed answers.
    Detect question numbers (Q1, Q2, etc.) and part labels (A/B/C/D).
    If a question number is NOT visible but text clearly continues,
    set "qno": 0 and "part": "".

    Output valid JSON:
    [
      {"part": "A/B/C/D or ''", "qno": <int or 0>,
       "answer": "<text>", "diagram": "<short desc or ''>"}
    ]
    """
    for _ in range(2):
        try:
            resp = GEMINI_MODEL.generate_content([prompt, img])
            text = re.sub(r"^```(json)?", "", resp.text.strip(), flags=re.I)
            text = re.sub(r"```$", "", text).strip()
            m = re.search(r"(\[.*\]|\{.*\})", text, re.S)
            if not m:
                continue
            data = json.loads(m.group(1))
            if isinstance(data, dict):
                data = [data]
            for d in data:
                d["page_no"] = page_no
                d["source_image"] = Path(img_path).name
            return data
        except Exception:
            time.sleep(0.5)
    return [{"part": "", "qno": 0, "answer": "[Failed extraction]", "diagram": "",
             "page_no": page_no, "source_image": Path(img_path).name}]

# ============================================================
# Student Processor
# ============================================================
def process_student(student_pdf: str):
    sid = Path(student_pdf).stem
    print(f"📄 Processing {sid}...")
    page_imgs = pdf_to_images(student_pdf)
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        futures = [ex.submit(extract_page_data, pno, img) for pno, img in page_imgs]
        for f in concurrent.futures.as_completed(futures):
            data = f.result()
            results.extend(data if isinstance(data, list) else [data])
    results = [r for r in results if isinstance(r, dict)]
    results.sort(key=lambda x: (x["page_no"], x.get("qno", 0)))
    merged = []
    for r in results:
        if merged:
            prev = merged[-1]
            same_part = (r["part"] == prev["part"])
            consecutive = (r["page_no"] == prev["page_no"] + 1)
            if r["qno"] == 0 or (r["qno"] == prev["qno"]) or (
                same_part and consecutive and not prev["answer"].strip().endswith(('.', '?'))
            ):
                prev["answer"] += " " + r["answer"]
                prev["diagram"] += " " + r["diagram"]
                continue
        merged.append(r)
    results = merged
    last_part = ""
    for r in results:
        if r["part"].strip().upper() in ["A","B","C","D"]:
            last_part = r["part"].strip().upper()
        elif not r["part"] and last_part:
            r["part"] = last_part
    os.makedirs("agent1_outputs", exist_ok=True)
    out_path = f"agent1_outputs/{sid}_agent1.json"
    with open(out_path, "w") as f:
        json.dump({"student_id": sid, "answers": results}, f, indent=2)
    print(f"✅ {sid} done → {out_path}")
    return sid

# ============================================================
# Run Agent 1
# ============================================================
def run_agent1(students_dir="data/students/*.pdf"):
    from glob import glob
    pdfs = glob(students_dir)
    if not pdfs:
        print("⚠️ No PDFs found in", students_dir)
        return
    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        list(ex.map(process_student, pdfs))
    tmp_dir = Path("data/tmp_pages")
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
    print(f"🏁 Agent 1 complete — {len(pdfs)} PDFs processed in {time.time() - start_time:.1f}s")
