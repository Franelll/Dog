from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        existing = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        existing_u = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none()
        if existing_u:
            raise HTTPException(status_code=409, detail="Username already taken")

        user = User(email=payload.email, username=payload.username, password_hash=hash_password(payload.password))
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(subject=user.id)
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token)
