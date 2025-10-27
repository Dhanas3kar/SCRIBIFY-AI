# ============================================================
# Safe-thread RAG Vector Database Builder (MacOS ARM Fix)
# ============================================================
import os

import os
for var in ["OMP_NUM_THREADS","OPENBLAS_NUM_THREADS","MKL_NUM_THREADS",
            "VECLIB_MAXIMUM_THREADS","NUMEXPR_NUM_THREADS"]:
    os.environ[var] = "1"
os.environ["FAISS_DISABLE_OPENMP"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import fitz
import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
from pathlib import Path


def build_vector_db(subject_pdf_path="data/subject_book.pdf",
                    out_index="scribify_ai/vector_db.faiss",
                    out_chunks="scribify_ai/chunks.pkl",
                    chunk_size=500):
    print("📘 Reading textbook...")
    doc = fitz.open(subject_pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()

    words = full_text.split()
    chunks = [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    print(f"🔹 Created {len(chunks)} chunks from {Path(subject_pdf_path).name}")

    print("🧠 Loading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("⚙️ Encoding embeddings (single-thread safe)...")
    embeddings = model.encode(chunks, show_progress_bar=True, batch_size=8)

    print("🧮 Building FAISS index...")
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings).astype("float32"))

    faiss.write_index(index, str(out_index))

    with open(out_chunks, "wb") as f:
        pickle.dump(chunks, f)

    
    print(f"🧩 Total chunks: {len(chunks)}")


    

    print(f"✅ VectorDB built and saved as {out_index} + {out_chunks}")
    return index, chunks


if __name__ == "__main__":
    build_vector_db("data/subject_book.pdf")
