from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import FriendRequest, User
from app.schemas.friends import FriendRequestCreate, FriendRequestPublic
from app.services.deps import get_current_user

router = APIRouter(prefix="/friends", tags=["friends"])


@router.get("/requests", response_model=list[FriendRequestPublic])
def list_requests(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reqs = (
        db.execute(
            select(FriendRequest)
            .where(or_(FriendRequest.from_user_id == user.id, FriendRequest.to_user_id == user.id))
            .order_by(FriendRequest.created_at.desc())
        )
        .scalars()
        .all()
    )
    
    # Get usernames for all users involved
    user_ids = set()
    for r in reqs:
        user_ids.add(r.from_user_id)
        user_ids.add(r.to_user_id)
    
    users_map = {}
    if user_ids:
        users = db.execute(select(User).where(User.id.in_(user_ids))).scalars().all()
        users_map = {u.id: u.username for u in users}
    
    return [
        FriendRequestPublic(
            id=r.id,
            from_user_id=r.from_user_id,
            to_user_id=r.to_user_id,
            status=r.status,
            created_at=r.created_at,
            from_username=users_map.get(r.from_user_id),
            to_username=users_map.get(r.to_user_id),
        )
        for r in reqs
    ]


@router.post("/requests", response_model=FriendRequestPublic)
def create_request(payload: FriendRequestCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.to_user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot friend yourself")

    to_user = db.get(User, payload.to_user_id)
    if not to_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Avoid duplicates both directions
    existing = (
        db.execute(
            select(FriendRequest).where(
                or_(
                    and_(FriendRequest.from_user_id == user.id, FriendRequest.to_user_id == payload.to_user_id),
                    and_(FriendRequest.from_user_id == payload.to_user_id, FriendRequest.to_user_id == user.id),
                )
            )
        )
        .scalar_one_or_none()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Request already exists")

    fr = FriendRequest(from_user_id=user.id, to_user_id=payload.to_user_id)
    db.add(fr)
    db.commit()
    db.refresh(fr)

    return FriendRequestPublic(
        id=fr.id,
        from_user_id=fr.from_user_id,
        to_user_id=fr.to_user_id,
        status=fr.status,
        created_at=fr.created_at,
    )


@router.post("/requests/{request_id}/accept", response_model=FriendRequestPublic)
def accept_request(request_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fr = db.get(FriendRequest, request_id)
    if not fr or fr.to_user_id != user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    if fr.status != "pending":
        raise HTTPException(status_code=400, detail="Request not pending")

    fr.status = "accepted"
    db.add(fr)
    db.commit()
    db.refresh(fr)

    return FriendRequestPublic(
        id=fr.id,
        from_user_id=fr.from_user_id,
        to_user_id=fr.to_user_id,
        status=fr.status,
        created_at=fr.created_at,
    )


@router.post("/requests/{request_id}/reject", response_model=FriendRequestPublic)
def reject_request(request_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fr = db.get(FriendRequest, request_id)
    if not fr or fr.to_user_id != user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    if fr.status != "pending":
        raise HTTPException(status_code=400, detail="Request not pending")

    fr.status = "rejected"
    db.add(fr)
    db.commit()
    db.refresh(fr)

    return FriendRequestPublic(
        id=fr.id,
        from_user_id=fr.from_user_id,
        to_user_id=fr.to_user_id,
        status=fr.status,
        created_at=fr.created_at,
    )
