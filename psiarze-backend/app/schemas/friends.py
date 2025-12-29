from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field


class FriendRequestCreate(BaseModel):
    to_user_id: str = Field(min_length=1)


class FriendRequestPublic(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str
    created_at: dt.datetime
