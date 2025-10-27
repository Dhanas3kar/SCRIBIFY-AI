# ============================================================
# Agent 2 — Question Paper Parser + Mapper (Parallel Optimized)
# ============================================================

import os, json, re, fitz, concurrent.futures
from pathlib import Path
import google.generativeai as genai

os.environ["GOOGLE_API_KEY"] = "AIzaSyCXUQ-6FuRqBQQwc43IEq49dvoHv9usnZ8"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
GEMINI_MODEL = genai.GenerativeModel("gemini-2.5-flash")

def parse_question_paper_to_json(qpaper_pdf: str):
    doc = fitz.open(qpaper_pdf)
    text = "\n".join([p.get_text("text") for p in doc])
    prompt = f"""
    You are an AI exam-structure parser.
    Parse the following question paper text and output JSON only.
    Each item must have:
    {{
      "part": "A/B/C/D",
      "qno": <int>,
      "marks": <int>,
      "question": "<text>"
    }}
    Rules:
    - Detect part headings like "Part A", "Part B".
    - Detect marks if written (e.g., "(5 X 2 = 10 Marks)").
    - Assign same marks to all questions under that part if no per-question mark.
    - If marks missing, set marks = 0.
    -----
    TEXT:
    {text}
    """
    try:
        resp = GEMINI_MODEL.generate_content(prompt)
        raw = re.sub(r"^```(json)?|```$", "", resp.text.strip(), flags=re.I)
        match = re.search(r"(\[.*\]|\{.*\})", raw, re.S)
        if not match:
            raise ValueError("No JSON found")
        data = json.loads(match.group(1))
        if isinstance(data, dict):
            data = [data]
        print(f"✅ Parsed {len(data)} questions from question paper.")
        return data
    except Exception as e:
        print("⚠️ Gemini parse error:", e)
        return []

def merge_question_and_answers(q_schema, student_json):
    merged = []
    lookup = {(a["part"].upper(), a["qno"]): a for a in student_json["answers"]}
    for q in q_schema:
        part = q.get("part", "").upper()
        qno = int(q.get("qno", 0))
        marks = int(q.get("marks", 0))
        question = q.get("question", "").strip()
        a = lookup.get((part, qno))
        merged.append({
            "part": part,
            "qno": qno,
            "marks": marks,
            "question": question,
            "answer": a["answer"] if a else "",
            "diagram": a["diagram"] if a else ""
        })
    return {"student_id": student_json["student_id"], "questions": merged}

def process_student_agent2(student_path: Path, q_schema):
    try:
        with open(student_path) as f:
            student_json = json.load(f)
        merged_json = merge_question_and_answers(q_schema, student_json)
        os.makedirs("agent2_outputs", exist_ok=True)
        out_path = Path("agent2_outputs") / f"{student_json['student_id']}_agent2.json"
        with open(out_path, "w") as f:
            json.dump(merged_json, f, indent=2)
        print(f"✅ {student_json['student_id']} → {out_path}")
        return student_json["student_id"]
    except Exception as e:
        print(f"⚠️ Error processing {student_path.name}: {e}")
        return None

def run_agent2(qpaper_pdf="data/question_paper.pdf", agent1_dir="agent1_outputs"):
    q_schema = parse_question_paper_to_json(qpaper_pdf)
    if not q_schema:
        print("⚠️ No questions parsed.")
        return
    pdfs = list(Path(agent1_dir).glob("*_agent1.json"))
    if not pdfs:
        print("⚠️ No Agent 1 outputs found.")
        return
    print(f"🚀 Mapping {len(pdfs)} student files in parallel...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        list(ex.map(lambda p: process_student_agent2(p, q_schema), pdfs))
    print("🏁 Agent 2 complete — outputs saved in agent2_outputs/")
