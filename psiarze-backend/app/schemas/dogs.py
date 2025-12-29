from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field


class DogCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    breed: str = Field(default="", max_length=120)


class DogPublic(BaseModel):
    id: str
    owner_id: str
    name: str
    breed: str
    created_at: dt.datetime
