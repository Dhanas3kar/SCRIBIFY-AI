# scribify_ai/brain.py
from langchain.tools import tool
from pathlib import Path
from typing import List

from config import *
from rag_vector_builder import build_vector_db
from agents.agent1_extractor import run_agent1
from agents.agent2_mapper import run_agent2
from agents.agent3_evaluator import run_agent3
from agents.agent4_reporter import run_agent4


# ===============================
# Define each Tool (Agent)
# ===============================

@tool("build_rag")
def build_rag() -> dict:
    """
    Build VectorDB from subject book PDF.
    Returns paths to FAISS index + chunks.
    """
    index, chunks = build_vector_db(str(SUBJECT_BOOK), FAISS_PATH, CHUNKS_PATH)
    return {"faiss_path": FAISS_PATH, "chunks_path": CHUNKS_PATH, "total_chunks": len(chunks)}


@tool("agent1_extract")
def agent1_extract() -> str:
    """
    Run Agent 1 on all student answer PDFs.
    """
    run_agent1(str(STUDENT_DIR / "*.pdf"))
    return str(AGENT1_OUT)


@tool("agent2_map")
def agent2_map() -> str:
    """
    Run Agent 2 to map student answers with question paper.
    """
    run_agent2(str(QUESTION_PAPER), str(AGENT1_OUT))
    return str(AGENT2_OUT)


@tool("agent3_evaluate")
def agent3_evaluate() -> str:
    """
    Run Agent 3 — Evaluation using RAG + Gemini.
    """
    run_agent3(str(AGENT2_OUT), FAISS_PATH, CHUNKS_PATH)
    return str(AGENT3_OUT)


@tool("agent4_report")
def agent4_report() -> str:
    """
    Run Agent 4 — Generate final PDF reports.
    """
    run_agent4(str(AGENT3_OUT))
    return str(REPORTS_DIR)


# ===============================
# Orchestrator (Manual Chain)
# ===============================

def run_full_pipeline():
    print("\n🚀 Starting Scribify AI End-to-End Evaluation Pipeline...\n")

    # 1️⃣ Build VectorDB
    print("🔹 Step 1: Building RAG from subject book...")
    rag = build_rag.invoke({})
    print(f"✅ VectorDB built → {rag}")

    # 2️⃣ Extract student answers
    print("\n🔹 Step 2: Extracting student answers...")
    agent1_extract.invoke({})
    
    # 3️⃣ Map question paper + answers
    print("\n🔹 Step 3: Mapping question paper with student answers...")
    agent2_map.invoke({})
    
    # 4️⃣ Evaluate with RAG + Gemini
    print("\n🔹 Step 4: Evaluating student answers...")
    agent3_evaluate.invoke({})
    
    # 5️⃣ Generate final PDF reports
    print("\n🔹 Step 5: Generating PDF reports...")
    reports_path = agent4_report.invoke({})

    print("\n🏁 Pipeline complete! All reports saved in:", reports_path)
    return reports_path


if __name__ == "__main__":
    run_full_pipeline()
