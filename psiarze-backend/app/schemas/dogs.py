from __future__ import annotations

import datetime as dt
from typing import Optional

from pydantic import BaseModel, Field


class DogCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    breed: str = Field(default="", max_length=120)
    age: Optional[int] = None
    weight: Optional[float] = None


class DogUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=80)
    breed: Optional[str] = Field(default=None, max_length=120)
    age: Optional[int] = None
    weight: Optional[float] = None


class DogPublic(BaseModel):
    id: str
    owner_id: str
    name: str
    breed: str
    age: Optional[int] = None
    weight: Optional[float] = None
    created_at: dt.datetime
