from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db import models, schemas
from app.api.v1.users import get_current_user

router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"]
)

# ---------- Endpoints ----------

@router.post("/", response_model=schemas.QuizOut)
def create_quiz(
    quiz_data: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create quizzes"
        )

    new_quiz = models.Quiz(
        title=quiz_data.title,
        file_name=quiz_data.file_name,
        question_type=quiz_data.question_type,
        questions=[q.dict() for q in quiz_data.questions],
        created_by=current_user.id,
        is_published=quiz_data.is_published
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@router.get("/", response_model=List[schemas.QuizOut])
def list_quizzes(db: Session = Depends(get_db)):
    quizzes = db.query(models.Quiz).filter(models.Quiz.is_published == True).all()
    return quizzes

@router.get("/my-quizzes", response_model=List[schemas.QuizOut])
def list_my_quizzes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can view their own quizzes"
        )
    
    quizzes = db.query(models.Quiz).filter(models.Quiz.created_by == current_user.id).all()
    return quizzes

@router.get("/{quiz_id}", response_model=schemas.QuizOut)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if quiz.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to delete this quiz"
        )

    db.delete(quiz)
    db.commit()
    return
