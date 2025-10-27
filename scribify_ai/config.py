# scribify_ai/config.py
import os
from pathlib import Path
import google.generativeai as genai

# -------------------------------
# Gemini Setup
# -------------------------------
os.environ["GOOGLE_API_KEY"] = "AIzaSyCXUQ-6FuRqBQQwc43IEq49dvoHv9usnZ8"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# -------------------------------
# Paths
# -------------------------------
DATA_DIR = Path("data")
SUBJECT_BOOK = DATA_DIR / "subject_book.pdf"
QUESTION_PAPER = DATA_DIR / "question_paper.pdf"
STUDENT_DIR = DATA_DIR / "students"
AGENT1_OUT = Path("agent1_outputs")
AGENT2_OUT = Path("agent2_outputs")
AGENT3_OUT = Path("agent3_outputs")
REPORTS_DIR = Path("reports")

# -------------------------------
# RAG Assets
# -------------------------------
FAISS_PATH = "vector_db.faiss"
CHUNKS_PATH = "chunks.pkl"
