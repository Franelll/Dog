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
    loc = (
        db.execute(select(UserLocation).where(UserLocation.user_id == user.id).order_by(UserLocation.created_at.desc()))
        .scalars()
        .first()
    )

    # Store latest snapshot (simple MVP). You can switch to upsert later.
    new_loc = UserLocation(
        user_id=user.id,
        lat=str(payload.lat),
        lng=str(payload.lng),
        is_sharing=payload.is_sharing,
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)

    return LocationPublic(
        user_id=new_loc.user_id,
        lat=float(new_loc.lat),
        lng=float(new_loc.lng),
        is_sharing=new_loc.is_sharing,
        created_at=new_loc.created_at,
    )


@router.get("/friends", response_model=list[LocationPublic])
def list_friend_locations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # MVP: return latest locations for all users who share; actual "friends" filtering can be added later.
    rows = db.execute(
        select(UserLocation)
        .where(UserLocation.is_sharing == True)  # noqa: E712
        .order_by(UserLocation.created_at.desc())
    ).scalars().all()

    # Keep latest per user
    latest: dict[str, UserLocation] = {}
    for r in rows:
        if r.user_id not in latest:
            latest[r.user_id] = r

    return [
        LocationPublic(
            user_id=r.user_id,
            lat=float(r.lat),
            lng=float(r.lng),
            is_sharing=r.is_sharing,
            created_at=r.created_at,
        )
        for r in latest.values()
    ]
