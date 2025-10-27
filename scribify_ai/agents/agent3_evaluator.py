# ============================================================
# Agent 3 — Evaluation Brain (RAG + Gemini Reasoning) v2.1
# ============================================================

import os, json, re, time, pickle, concurrent.futures
from pathlib import Path
from typing import List, Dict, Any, Tuple
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

os.environ["GOOGLE_API_KEY"] = "AIzaSyCXUQ-6FuRqBQQwc43IEq49dvoHv9usnZ8"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
GEMINI = genai.GenerativeModel("gemini-2.5-flash")

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
EMBED = SentenceTransformer(EMBED_MODEL_NAME)

TOP_K = 3
MAX_WORKERS = 6
INPUT_DIR = "agent2_outputs"
OUTPUT_DIR = "agent3_outputs"
FAISS_PATH = "vector_db.faiss"
CHUNKS_PATH = "chunks.pkl"

def load_chunks(chunks_path: str) -> Tuple[List[str], List[str]]:
    with open(chunks_path, "rb") as f:
        data = pickle.load(f)
    texts, labels = [], []
    if isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, str):
                texts.append(item)
                labels.append(f"Chunk {i+1}")
            elif isinstance(item, dict):
                t = item.get("text", "")
                m = item.get("meta", {})
                label = m.get("reference") or m.get("page") or m.get("section") or m.get("title") or f"Chunk {i+1}"
                texts.append(t)
                labels.append(str(label))
    else:
        texts = [str(data)]
        labels = ["Chunk 1"]
    return texts, labels

def load_faiss_index(path: str):
    return faiss.read_index(path)

def retrieve_context(query: str, index, texts: List[str], labels: List[str], k: int = TOP_K) -> Tuple[str, str]:
    qv = EMBED.encode([query]).astype(np.float32)
    D, I = index.search(qv, k)
    picked, refs = [], []
    for idx in I[0]:
        if 0 <= idx < len(texts):
            picked.append(texts[idx])
            refs.append(labels[idx])
    return "\n\n".join(picked), "; ".join(refs) if refs else ""

GRADE_SYSTEM_PROMPT = """
You are an expert teacher. Grade fairly and consistently.
Use the provided textbook context as the primary reference.
If the student's answer is blank or off-topic, award 0 and explain briefly.
Return STRICT JSON ONLY (no markdown).
JSON schema for each question:
{
  "score": <number>,
  "feedback": {
    "correct": "<what is right>",
    "wrong_or_missing": "<what is wrong or missing>",
    "improvement": "<short, actionable tip>",
    "reference": "<short source hint, e.g., page/section>"
  }
}
""".strip()

def call_gemini_grade(question: str, marks: int, answer: str, ctx: str, ref_hint: str) -> Dict[str, Any]:
    if not answer.strip():
        return {
            "score": 0.0,
            "feedback": {"correct": "", "wrong_or_missing": "Answer not provided.",
                         "improvement": "Attempt the question with definition, key points, and example.",
                         "reference": ref_hint or ""}
        }
    user_prompt = f"""
Question (max {marks} marks):
{question}

Student Answer:
{answer}

Textbook Context (RAG):
{ctx}

Instructions:
- Grade conceptually, not word-by-word.
- Award score out of {marks}.
- Provide feedback as per schema.
Return STRICT JSON only.
""".strip()
    resp = GEMINI.generate_content([GRADE_SYSTEM_PROMPT, user_prompt])
    raw = (resp.text or "").strip()
    raw = re.sub(r"^```(json)?", "", raw, flags=re.I).strip()
    raw = re.sub(r"```$", "", raw).strip()
    m = re.search(r"(\{[\s\S]*\})", raw)
    if m: raw = m.group(1)
    try:
        data = json.loads(raw)
    except Exception:
        m2 = re.search(r"(\d+(\.\d+)?)", raw)
        score = float(m2.group(1)) if m2 else 0.0
        data = {"score": score,
                "feedback": {"correct": "", "wrong_or_missing": "Could not parse feedback cleanly.",
                             "improvement": "Add definitions, steps, and one example.",
                             "reference": ref_hint or ""}}
    if "feedback" not in data:
        data["feedback"] = {"correct": data.get("correct", ""), "wrong_or_missing": data.get("wrong_or_missing", ""),
                            "improvement": data.get("improvement", ""), "reference": ref_hint or ""}
    sc = float(data.get("score", 0))
    sc = max(0.0, min(sc, float(marks)))
    data["score"] = sc
    if not data["feedback"].get("reference"):
        data["feedback"]["reference"] = ref_hint or ""
    return data

def grade_one(q: Dict[str, Any], index, texts, labels) -> Dict[str, Any]:
    part  = str(q.get("part", "")).upper()
    qno   = int(q.get("qno", 0))
    marks = int(q.get("marks", 0))
    question = q.get("question", "").strip()
    answer   = q.get("answer", "").strip()
    query = f"{question}\nStudent hint: {answer[:160]}"
    ctx, refs = retrieve_context(query, index, texts, labels, k=TOP_K)
    graded = call_gemini_grade(question, marks, answer, ctx, refs)
    return {"part": part, "qno": qno, "marks": marks, "question": question,
            "answer": answer, "score": graded["score"], "feedback": graded["feedback"]}

def run_agent3_for_student(agent2_path: str, index, texts, labels) -> str:
    with open(agent2_path, "r") as f:
        data = json.load(f)
    student_id = data.get("student_id", Path(agent2_path).stem.replace("_agent2", ""))
    questions = data.get("questions", [])
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = [ex.submit(grade_one, q, index, texts, labels) for q in questions]
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())
    results.sort(key=lambda x: (x["part"], x["qno"]))
    total_score = float(sum(r["score"] for r in results))
    out = {"student_id": student_id, "results": results, "total_score": total_score}
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = Path(OUTPUT_DIR) / f"{student_id}_agent3.json"
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"✅ {student_id} graded → {out_path}")
    return str(out_path)

def run_agent3(agent2_dir=INPUT_DIR, faiss_path=FAISS_PATH, chunks_path=CHUNKS_PATH):
    print("🔧 Loading FAISS + textbook chunks...")
    index = load_faiss_index(faiss_path)
    texts, labels = load_chunks(chunks_path)
    print(f"   -> Loaded {len(texts)} chunks")
    paths = list(Path(agent2_dir).glob("*_agent2.json"))
    if not paths:
        print("⚠️ No Agent 2 outputs found.")
        return
    print(f"🚀 Grading {len(paths)} students in parallel...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        list(ex.map(lambda p: run_agent3_for_student(str(p), index, texts, labels), paths))
    print("🏁 Agent 3 complete — results in agent3_outputs/")
