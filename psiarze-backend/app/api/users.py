from __future__ import annotations

from fastapi import APIRouter, Depends

from app.schemas.users import UserMe
from app.services.deps import get_current_user
from app.db.models import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserMe)
def me(user: User = Depends(get_current_user)):
    return UserMe(id=user.id, email=user.email, username=user.username, created_at=user.created_at)
