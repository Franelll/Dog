from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, EmailStr


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    username: str
    created_at: dt.datetime


class UserMe(UserPublic):
    pass
