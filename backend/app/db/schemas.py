from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any

class RoleEnum(str, Enum):
    teacher = "teacher"
    student = "student"

class QuestionTypeEnum(str, Enum):
    multiple_choice = "multiple-choice"
    open_ended = "open-ended"

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum

class UserCreate(UserBase):
    password: str
    student_number: str | None = None

class UserOut(UserBase):
    id: int
    student_number: str | None
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    id: int | None = None
    role: RoleEnum | None = None

# Question Schemas
class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    correctAnswer: int
    explanation: Optional[str] = None
    type: QuestionTypeEnum

class Answer(BaseModel):
    questionId: str
    selectedOption: int
    isCorrect: bool
    timeSpent: int
    openEndedAnswer: Optional[str] = None

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    file_name: str
    question_type: QuestionTypeEnum
    questions: List[Question]
    is_published: bool = True

class QuizCreate(QuizBase):
    pass

class QuizOut(QuizBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        orm_mode = True

# Quiz Result Schemas
class QuizResultBase(BaseModel):
    quiz_id: int
    student_id: int
    student_name: str
    student_number: str
    answers: List[Answer]
    score: int
    total_questions: int
    time_spent: int

class QuizResultCreate(QuizResultBase):
    pass

class QuizResultOut(QuizResultBase):
    id: int
    completed_at: datetime

    class Config:
        orm_mode = True

# PDF Upload Schema
class PDFUploadResponse(BaseModel):
    success: bool
    quiz: QuizOut
    message: str
