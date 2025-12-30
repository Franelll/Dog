from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.users import UserMe, UserPublic
from app.services.deps import get_current_user
from app.db.models import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserMe)
def me(user: User = Depends(get_current_user)):
    return UserMe(id=user.id, email=user.email, username=user.username, created_at=user.created_at)


@router.get("/discover", response_model=list[UserPublic])
def discover_users(
    search: str = Query(default="", description="Search by username"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all users except the current user, optionally filtered by username search."""
    query = select(User).where(User.id != user.id)
    if search:
        query = query.where(User.username.ilike(f"%{search}%"))
    query = query.order_by(User.username).limit(50)
    
    users = db.execute(query).scalars().all()
    return [
        UserPublic(id=u.id, email=u.email, username=u.username, created_at=u.created_at)
        for u in users
    ]
