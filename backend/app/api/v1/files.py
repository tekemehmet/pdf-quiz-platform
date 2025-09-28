import shutil
import os
from datetime import datetime
from typing import List

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from PyPDF2 import PdfReader

from app.db.session import get_db
from app.db import models, schemas
from app.api.v1.users import get_current_user
from app.core.llm import generate_quiz_from_text

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------- Helper: Extract text from PDF ----------

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()

# ---------- Endpoints ----------

@router.post("/upload", response_model=schemas.PDFUploadResponse)
def upload_file(
    pdf_file: UploadFile = File(...),
    question_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can upload files")

    if not pdf_file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    if question_type not in ["multiple-choice", "open-ended"]:
        raise HTTPException(status_code=400, detail="Question type must be 'multiple-choice' or 'open-ended'")

    # Save file locally
    file_path = os.path.join(UPLOAD_DIR, pdf_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(pdf_file.file, buffer)

    try:
        # Extract text from PDF
        text_content = extract_text_from_pdf(file_path)
        if not text_content:
            raise ValueError("No readable text in PDF")

        # Generate quiz questions using LLM
        questions_data = generate_quiz_from_text(text_content, question_type)
        
        if not questions_data:
            raise ValueError("Failed to generate questions from PDF")

        # Create quiz
        quiz_title = pdf_file.filename.replace('.pdf', '')
        new_quiz = models.Quiz(
            title=quiz_title,
            file_name=pdf_file.filename,
            question_type=question_type,
            questions=questions_data,
            created_by=current_user.id,
            is_published=True
        )
        db.add(new_quiz)
        db.commit()
        db.refresh(new_quiz)

        return schemas.PDFUploadResponse(
            success=True,
            quiz=new_quiz,
            message="PDF uploaded and quiz generated successfully"
        )

    except Exception as e:
        # Clean up uploaded file if quiz generation fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
