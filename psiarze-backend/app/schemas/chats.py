from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field


class RoomCreate(BaseModel):
    other_user_id: str = Field(min_length=1)


class RoomPublic(BaseModel):
    id: str
    created_at: dt.datetime
    name: str | None = None  # Name of the other user in the room


class MessageCreate(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    kind: str = Field(default="text")  # text|announce


class MessagePublic(BaseModel):
    id: str
    room_id: str
    sender_id: str
    kind: str
    text: str
    created_at: dt.datetime
