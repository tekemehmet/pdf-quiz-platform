from sqlalchemy import Column, String, Integer, Enum, DateTime, func, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

class RoleEnum(str, enum.Enum):
    teacher = "teacher"
    student = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.student)
    student_number = Column(String, unique=True, nullable=True)  # only for students
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    question_type = Column(Enum('multiple-choice', 'open-ended'), nullable=False)
    questions = Column(JSON, nullable=False)  # Store questions as JSON
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_published = Column(Boolean, default=True)

    # Relationships
    creator = relationship("User", back_populates="created_quizzes")
    results = relationship("QuizResult", back_populates="quiz")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_name = Column(String, nullable=False)
    student_number = Column(String, nullable=False)
    answers = Column(JSON, nullable=False)  # Store answers as JSON
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    time_spent = Column(Integer, nullable=False)  # in milliseconds

    # Relationships
    quiz = relationship("Quiz", back_populates="results")
    student = relationship("User", back_populates="quiz_results")

# Add relationships to User model
User.created_quizzes = relationship("Quiz", back_populates="creator")
User.quiz_results = relationship("QuizResult", back_populates="student")
