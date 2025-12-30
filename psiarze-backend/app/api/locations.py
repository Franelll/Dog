from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, UserLocation
from app.schemas.locations import LocationPublic, LocationUpsert
from app.services.deps import get_current_user

router = APIRouter(prefix="/locations", tags=["locations"])


@router.put("/me", response_model=LocationPublic)
def upsert_my_location(payload: LocationUpsert, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Store latest snapshot (simple MVP). You can switch to upsert later.
    new_loc = UserLocation(
        user_id=user.id,
        lat=str(payload.actual_lat),
        lng=str(payload.actual_lng),
        is_sharing=payload.is_sharing,
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)

    return LocationPublic(
        user_id=new_loc.user_id,
        username=user.username,
        latitude=float(new_loc.lat),
        longitude=float(new_loc.lng),
        is_active=new_loc.is_sharing,
        created_at=new_loc.created_at,
    )


@router.get("/friends", response_model=list[LocationPublic])
def list_friend_locations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.db.models import FriendRequest
    
    # Get accepted friends
    friend_ids = []
    friend_requests = db.execute(
        select(FriendRequest).where(
            ((FriendRequest.from_user_id == user.id) | (FriendRequest.to_user_id == user.id)) &
            (FriendRequest.status == "accepted")
        )
    ).scalars().all()
    
    for req in friend_requests:
        if req.from_user_id == user.id:
            friend_ids.append(req.to_user_id)
        else:
            friend_ids.append(req.from_user_id)
    
    if not friend_ids:
        return []
    
    # Get latest locations for friends who share
    rows = db.execute(
        select(UserLocation)
        .where(UserLocation.is_sharing == True)  # noqa: E712
        .where(UserLocation.user_id.in_(friend_ids))
        .order_by(UserLocation.created_at.desc())
    ).scalars().all()

    # Keep latest per user
    latest: dict[str, UserLocation] = {}
    for r in rows:
        if r.user_id not in latest:
            latest[r.user_id] = r

    # Get usernames
    result = []
    for r in latest.values():
        friend_user = db.get(User, r.user_id)
        result.append(LocationPublic(
            user_id=r.user_id,
            username=friend_user.username if friend_user else "",
            latitude=float(r.lat),
            longitude=float(r.lng),
            is_active=r.is_sharing,
            created_at=r.created_at,
        ))
    
    return result


@router.get("/friends/{friend_id}", response_model=LocationPublic | None)
def get_friend_location(friend_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.db.models import FriendRequest
    from fastapi import HTTPException
    
    # Check if they are friends
    friend_req = db.execute(
        select(FriendRequest).where(
            (
                ((FriendRequest.from_user_id == user.id) & (FriendRequest.to_user_id == friend_id)) |
                ((FriendRequest.from_user_id == friend_id) & (FriendRequest.to_user_id == user.id))
            ) &
            (FriendRequest.status == "accepted")
        )
    ).scalar_one_or_none()
    
    if not friend_req:
        raise HTTPException(status_code=404, detail="Nie jesteście znajomymi")
    
    # Get friend's latest location
    loc = db.execute(
        select(UserLocation)
        .where(UserLocation.user_id == friend_id)
        .where(UserLocation.is_sharing == True)  # noqa: E712
        .order_by(UserLocation.created_at.desc())
    ).scalars().first()
    
    if not loc:
        raise HTTPException(status_code=404, detail="Znajomy nie udostępnia lokalizacji")
    
    friend_user = db.get(User, friend_id)
    return LocationPublic(
        user_id=loc.user_id,
        username=friend_user.username if friend_user else "",
        latitude=float(loc.lat),
        longitude=float(loc.lng),
        is_active=loc.is_sharing,
        created_at=loc.created_at,
    )
