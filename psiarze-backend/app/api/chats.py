from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ChatMessage, ChatRoom, ChatRoomMember, User
from app.schemas.chats import MessageCreate, MessagePublic, RoomCreate, RoomPublic
from app.services.deps import get_current_user

router = APIRouter(prefix="/chats", tags=["chats"])


def _room_has_member(db: Session, room_id: str, user_id: str) -> bool:
    m = db.execute(
        select(ChatRoomMember).where(and_(ChatRoomMember.room_id == room_id, ChatRoomMember.user_id == user_id))
    ).scalar_one_or_none()
    return m is not None


@router.post("/rooms", response_model=RoomPublic)
def create_room(payload: RoomCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.other_user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot create room with yourself")

    other = db.get(User, payload.other_user_id)
    if not other:
        raise HTTPException(status_code=404, detail="User not found")

    # Try to find an existing 1:1 room by checking any room that contains both members.
    # (Simple approach for MVP.)
    candidate_room_ids = db.execute(
        select(ChatRoomMember.room_id).where(ChatRoomMember.user_id == user.id)
    ).scalars().all()

    for rid in candidate_room_ids:
        if _room_has_member(db, rid, payload.other_user_id):
            room = db.get(ChatRoom, rid)
            if room:
                return RoomPublic(id=room.id, created_at=room.created_at)

    room = ChatRoom()
    db.add(room)
    db.commit()
    db.refresh(room)

    db.add(ChatRoomMember(room_id=room.id, user_id=user.id))
    db.add(ChatRoomMember(room_id=room.id, user_id=payload.other_user_id))
    db.commit()

    return RoomPublic(id=room.id, created_at=room.created_at)


@router.get("/rooms", response_model=list[RoomPublic])
def list_rooms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room_ids = db.execute(select(ChatRoomMember.room_id).where(ChatRoomMember.user_id == user.id)).scalars().all()
    rooms = db.execute(select(ChatRoom).where(ChatRoom.id.in_(room_ids)).order_by(ChatRoom.created_at.desc())).scalars().all()
    return [RoomPublic(id=r.id, created_at=r.created_at) for r in rooms]


@router.get("/rooms/{room_id}/messages", response_model=list[MessagePublic])
def list_messages(room_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _room_has_member(db, room_id, user.id):
        raise HTTPException(status_code=404, detail="Room not found")

    msgs = (
        db.execute(select(ChatMessage).where(ChatMessage.room_id == room_id).order_by(ChatMessage.created_at.asc()))
        .scalars()
        .all()
    )
    return [
        MessagePublic(
            id=m.id,
            room_id=m.room_id,
            sender_id=m.sender_id,
            kind=m.kind,
            text=m.text,
            created_at=m.created_at,
        )
        for m in msgs
    ]


@router.post("/rooms/{room_id}/messages", response_model=MessagePublic)
def send_message(
    room_id: str,
    payload: MessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.kind not in {"text", "announce"}:
        raise HTTPException(status_code=400, detail="Invalid kind")

    if not _room_has_member(db, room_id, user.id):
        raise HTTPException(status_code=404, detail="Room not found")

    msg = ChatMessage(room_id=room_id, sender_id=user.id, kind=payload.kind, text=payload.text)
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return MessagePublic(
        id=msg.id,
        room_id=msg.room_id,
        sender_id=msg.sender_id,
        kind=msg.kind,
        text=msg.text,
        created_at=msg.created_at,
    )
