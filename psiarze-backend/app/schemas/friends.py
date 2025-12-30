from __future__ import annotations

import datetime as dt
from typing import Optional

from pydantic import BaseModel, Field


class FriendRequestCreate(BaseModel):
    to_user_id: str = Field(min_length=1)


class FriendRequestPublic(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str
    created_at: dt.datetime
    from_username: Optional[str] = None
    to_username: Optional[str] = None
