# ============================================================
# SCRIBIFY AI - Unified Backend (LangChain + Gemini + PostgreSQL)
# ============================================================

import os, json, shutil, uuid, time
from pathlib import Path
from typing import List
from datetime import datetime, timedelta

import google.generativeai as genai
from fastapi import FastAPI, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

# ============================================================
# CONFIGURATION
# ============================================================
DATA_DIR = Path("data")
REPORTS_DIR = Path("reports")
DATA_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)

# URL-encode password with @ symbol: tkart@123 -> tkart%40123
DATABASE_URL = "postgresql+psycopg2://postgres:tkart%40123@localhost/scribify_ai"
SECRET_KEY = "scribify_secret_key"
ALGORITHM = "HS256"

os.environ["GOOGLE_API_KEY"] = "AIzaSyCXUQ-6FuRqBQQwc43IEq49dvoHv9usnZ8"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Import the unified LangChain pipeline
from brain import run_full_pipeline

# ============================================================
# DATABASE
# ============================================================
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    notebooks = relationship("Notebook", back_populates="teacher")

class Notebook(Base):
    __tablename__ = "notebooks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    subject_book = Column(String)
    question_paper = Column(String)
    status = Column(String, default="idle")  # idle | processing | completed
    reports_path = Column(String, default="")
    teacher = relationship("Teacher", back_populates="notebooks")
    answers = relationship("AnswerPaper", back_populates="notebook")

class AnswerPaper(Base):
    __tablename__ = "answer_papers"
    id = Column(Integer, primary_key=True)
    student_name = Column(String)
    file_path = Column(String)
    notebook_id = Column(Integer, ForeignKey("notebooks.id"))
    notebook = relationship("Notebook", back_populates="answers")

Base.metadata.create_all(bind=engine)

# ============================================================
# UTILS
# ============================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password[:72])

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_token(data: dict, expires=60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================
# FASTAPI APP
# ============================================================
app = FastAPI(title="Scribify AI Backend", version="1.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# AUTH ROUTES
# ============================================================
class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

<<<<<<< HEAD
class CreateNotebookRequest(BaseModel):
    name: str
    teacher_id: int

# ============================================================
# AUTH ROUTES
# ============================================================
=======
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc
@app.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Teacher).filter(Teacher.email == req.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(Teacher).filter(Teacher.username == req.username).first():
        raise HTTPException(400, "Username already taken")

    teacher = Teacher(
        email=req.email,
        username=req.username,
        password_hash=hash_password(req.password)
    )
    db.add(teacher)
    db.commit()
    return {"msg": "Registered successfully"}

@app.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.email == req.email).first()
    if not teacher or not verify_password(req.password, teacher.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = create_token({"sub": teacher.email})
    return {
        "access_token": token,
        "teacher_id": teacher.id,
        "username": teacher.username,
    }

# ============================================================
# NOTEBOOK ROUTES
# ============================================================
@app.get("/notebooks")
def list_notebooks(db: Session = Depends(get_db)):
    notebooks = db.query(Notebook).order_by(Notebook.created_at.desc()).all()
    return [
        {
            "id": nb.id,
            "name": nb.name,
            "created_at": nb.created_at.isoformat(),
            "status": nb.status,
        }
        for nb in notebooks
    ]

@app.post("/upload/create_notebook")
<<<<<<< HEAD
def create_notebook(req: CreateNotebookRequest, db: Session = Depends(get_db)):
    try:
        nb = Notebook(name=req.name, teacher_id=req.teacher_id)
        db.add(nb)
        db.commit()
        db.refresh(nb)
        return {"notebook_id": nb.id, "msg": "Notebook created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Failed to create notebook: {str(e)}")

# ============================================================
# NOTEBOOK MANAGEMENT ROUTES
# ============================================================
@app.get("/notebooks")
def list_notebooks(teacher_id: int, db: Session = Depends(get_db)):
    """Get all notebooks for a teacher"""
    try:
        notebooks = db.query(Notebook).filter(
            Notebook.teacher_id == teacher_id
        ).order_by(Notebook.created_at.desc()).all()
        
        return [
            {
                "id": nb.id,
                "name": nb.name,
                "created_at": nb.created_at.isoformat(),
                "status": nb.status,
                "teacher_id": nb.teacher_id,
                "question_paper": nb.question_paper,
                "subject_book": nb.subject_book,
                "reports_path": nb.reports_path,
                "answers": [
                    {"id": ans.id, "student_name": ans.student_name} 
                    for ans in nb.answers
                ]
            }
            for nb in notebooks
        ]
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch notebooks: {str(e)}")


@app.get("/notebooks/{notebook_id}")
def get_notebook(notebook_id: int, db: Session = Depends(get_db)):
    """Get single notebook details"""
    nb = db.query(Notebook).filter_by(id=notebook_id).first()
    if not nb:
        raise HTTPException(404, "Notebook not found")
    
    return {
        "id": nb.id,
        "name": nb.name,
        "created_at": nb.created_at.isoformat(),
        "status": nb.status,
        "teacher_id": nb.teacher_id,
        "question_paper": nb.question_paper,
        "subject_book": nb.subject_book,
        "reports_path": nb.reports_path,
        "answers": [
            {
                "id": ans.id, 
                "student_name": ans.student_name,
                "file_path": ans.file_path
            } 
            for ans in nb.answers
        ]
    }


@app.delete("/notebooks/{notebook_id}")
def delete_notebook(notebook_id: int, db: Session = Depends(get_db)):
    """Delete a notebook and all associated files"""
    nb = db.query(Notebook).filter_by(id=notebook_id).first()
    if not nb:
        raise HTTPException(404, "Notebook not found")
    
    try:
        # Delete uploaded files
        if nb.subject_book and os.path.exists(nb.subject_book):
            os.remove(nb.subject_book)
        if nb.question_paper and os.path.exists(nb.question_paper):
            os.remove(nb.question_paper)
        
        for ans in nb.answers:
            if os.path.exists(ans.file_path):
                os.remove(ans.file_path)
        
        # Delete reports directory
        if nb.reports_path and os.path.exists(nb.reports_path):
            shutil.rmtree(nb.reports_path)
        
        # Delete from database
        db.delete(nb)
        db.commit()
        
        return {"msg": "Notebook deleted successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Failed to delete notebook: {str(e)}")
=======
def create_notebook(name: str = Form(...), teacher_id: int = Form(...), db: Session = Depends(get_db)):
    nb = Notebook(name=name, teacher_id=teacher_id)
    db.add(nb)
    db.commit()
    db.refresh(nb)
    return {"notebook_id": nb.id, "msg": "Notebook created"}
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc

# ============================================================
# FILE UPLOADS
# ============================================================
@app.post("/upload/subject")
def upload_subject(notebook_id: int = Form(...), file: UploadFile = None, db: Session = Depends(get_db)):
<<<<<<< HEAD
    nb = db.query(Notebook).filter_by(id=notebook_id).first()
    if not nb:
        raise HTTPException(404, "Notebook not found")
=======
    nb = db.query(Notebook).get(notebook_id)
    if not nb: raise HTTPException(404, "Notebook not found")

>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc
    path = DATA_DIR / f"{uuid.uuid4()}_{file.filename}"
    with open(path, "wb") as f: f.write(file.file.read())

    nb.subject_book = str(path)
    db.commit()
    return {"msg": "Subject book uploaded", "path": str(path)}

@app.post("/upload/question")
def upload_question(notebook_id: int = Form(...), file: UploadFile = None, db: Session = Depends(get_db)):
<<<<<<< HEAD
    nb = db.query(Notebook).filter_by(id=notebook_id).first()
    if not nb:
        raise HTTPException(404, "Notebook not found")
=======
    nb = db.query(Notebook).get(notebook_id)
    if not nb: raise HTTPException(404, "Notebook not found")

>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc
    path = DATA_DIR / f"{uuid.uuid4()}_{file.filename}"
    with open(path, "wb") as f: f.write(file.file.read())

    nb.question_paper = str(path)
    db.commit()
    return {"msg": "Question paper uploaded", "path": str(path)}

@app.post("/upload/answers")
def upload_answers(notebook_id: int = Form(...), files: List[UploadFile] = None, db: Session = Depends(get_db)):
<<<<<<< HEAD
    nb = db.query(Notebook).filter_by(id=notebook_id).first()
    if not nb:
        raise HTTPException(404, "Notebook not found")
=======
    nb = db.query(Notebook).get(notebook_id)
    if not nb: raise HTTPException(404, "Notebook not found")
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc

    uploaded = 0
    for file in files:
        path = DATA_DIR / f"{uuid.uuid4()}_{file.filename}"
        with open(path, "wb") as f: f.write(file.file.read())
        db.add(AnswerPaper(
            student_name=file.filename.split(".")[0],
            file_path=str(path),
            notebook_id=nb.id,
        ))
        uploaded += 1
    db.commit()
    return {"msg": f"{uploaded} answer(s) uploaded successfully"}

# ============================================================
# EVALUATION (LangChain Pipeline)
# ============================================================
@app.post("/evaluate/{notebook_id}")
def evaluate_notebook(notebook_id: int, db: Session = Depends(get_db)):
    nb = db.query(Notebook).filter_by(id=notebook_id).first()
    if not nb:
        raise HTTPException(404, "Notebook not found")

    # Count sheets
    sheets_count = len(nb.answers)
    if sheets_count == 0:
        raise HTTPException(400, "No answer sheets uploaded")

    nb.status = "processing"
    db.commit()

<<<<<<< HEAD
    start_time = time.time()
    
    try:
        # Copy PDFs to expected locations
        data_dir = Path("data")
        shutil.rmtree(data_dir, ignore_errors=True)
        (data_dir / "students").mkdir(parents=True, exist_ok=True)
        
        if not nb.subject_book or not os.path.exists(nb.subject_book):
            raise HTTPException(400, "Subject book not uploaded")
        if not nb.question_paper or not os.path.exists(nb.question_paper):
            raise HTTPException(400, "Question paper not uploaded")
        
        shutil.copy(nb.subject_book, data_dir / "subject_book.pdf")
        shutil.copy(nb.question_paper, data_dir / "question_paper.pdf")
        
        for ans in nb.answers:
            if os.path.exists(ans.file_path):
                shutil.copy(ans.file_path, data_dir / "students" / Path(ans.file_path).name)

        # Run your pipeline
        reports_path = run_full_pipeline()
=======
    # Prepare directories for the pipeline
    shutil.rmtree("data", ignore_errors=True)
    (Path("data") / "students").mkdir(parents=True, exist_ok=True)

    shutil.copy(nb.subject_book, "data/subject_book.pdf")
    shutil.copy(nb.question_paper, "data/question_paper.pdf")

    for ans in nb.answers:
        shutil.copy(ans.file_path, f"data/students/{Path(ans.file_path).name}")

    # Run your full evaluation pipeline
    reports_path = run_full_pipeline()
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc

        nb.status = "completed"
        nb.reports_path = str(reports_path)
        db.commit()
        
        processing_time = time.time() - start_time
        cost_per_sheet = 6.50  # As defined in usage_tracker
        total_cost = sheets_count * cost_per_sheet

<<<<<<< HEAD
        return {
            "msg": "Evaluation complete",
            "reports_dir": str(reports_path),
            "sheets_processed": sheets_count,
            "processing_time": round(processing_time, 2),
            "cost_incurred": round(total_cost, 2),
            "sheets_remaining": "N/A"  # Will be implemented with usage tracker
        }
    
    except Exception as e:
        nb.status = "failed"
        db.commit()
        raise HTTPException(500, f"Evaluation failed: {str(e)}")
=======
    return {"msg": "Evaluation complete ✅", "reports_dir": str(reports_path)}
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc

# ============================================================
# REPORTS
# ============================================================
@app.get("/reports/{notebook_id}")
def list_reports(notebook_id: int, db: Session = Depends(get_db)):
    nb = db.query(Notebook).filter_by(id=notebook_id).first()
    if not nb or not nb.reports_path:
        raise HTTPException(404, "No reports found")
    files = list(Path(nb.reports_path).glob("*.pdf"))
    return [{"student": f.stem, "url": f"/download/{f.name}"} for f in files]

@app.get("/download/{filename}")
def download_report(filename: str):
    path = REPORTS_DIR / filename
    if not path.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(path, media_type="application/pdf", filename=filename)

# ============================================================
# ROOT
# ============================================================
@app.get("/")
def root():
    return {"msg": "Welcome to Scribify AI Backend 🚀"}
