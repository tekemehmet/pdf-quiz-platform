from typing import Generator, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.security import get_password_hash
from app.db import models, schemas
from app.db.session import get_db

router = APIRouter()

# OAuth2 scheme (tokenUrl should match where your login endpoint is mounted)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


# Local lightweight schema for public registration (no role field)
class UserRegistration(BaseModel):
    name: str
    email: EmailStr
    password: str
    student_number: Optional[str] = None


# Helper: get current user from JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --------------------------
# Routes
# --------------------------

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegistration, db: Session = Depends(get_db)):
    """
    Self-registration endpoint (students by default).
    If you want to allow teacher signups, either use a separate admin flow
    or add verification step — by default this creates a student account.
    """
    # check duplicate email
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user_in.password)

    new_user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pw,
        role=models.RoleEnum.student,  # self-registration => student
        student_number=user_in.student_number,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    """
    Return current authenticated user's profile.
    """
    return current_user
