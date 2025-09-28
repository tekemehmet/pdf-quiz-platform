from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db import models, schemas
from app.api.v1.users import get_current_user

router = APIRouter(
    prefix="/results",
    tags=["Results"]
)

# ---------- Endpoints ----------

@router.post("/", response_model=schemas.QuizResultOut)
def create_result(
    result_data: schemas.QuizResultCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only students can submit results
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit quiz results"
        )

    # Verify quiz exists
    quiz = db.query(models.Quiz).filter(models.Quiz.id == result_data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Check if student already submitted this quiz
    existing_result = db.query(models.QuizResult).filter(
        models.QuizResult.quiz_id == result_data.quiz_id,
        models.QuizResult.student_id == current_user.id
    ).first()
    
    if existing_result:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted this quiz"
        )

    new_result = models.QuizResult(
        quiz_id=result_data.quiz_id,
        student_id=current_user.id,
        student_name=result_data.student_name,
        student_number=result_data.student_number,
        answers=[a.dict() for a in result_data.answers],
        score=result_data.score,
        total_questions=result_data.total_questions,
        time_spent=result_data.time_spent
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return new_result

@router.get("/my-results", response_model=List[schemas.QuizResultOut])
def get_my_results(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    results = db.query(models.QuizResult).filter(
        models.QuizResult.student_id == current_user.id
    ).all()
    return results

@router.get("/quiz/{quiz_id}", response_model=List[schemas.QuizResultOut])
def get_quiz_results(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only teachers can view quiz results
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can view quiz results"
        )

    # Verify quiz exists and belongs to teacher
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    if quiz.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only view results for your own quizzes"
        )

    results = db.query(models.QuizResult).filter(
        models.QuizResult.quiz_id == quiz_id
    ).all()
    return results

@router.get("/all", response_model=List[schemas.QuizResultOut])
def get_all_results(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only teachers can view all results
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can view all results"
        )

    results = db.query(models.QuizResult).all()
    return results
