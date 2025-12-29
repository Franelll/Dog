from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field


class LocationUpsert(BaseModel):
    lat: float
    lng: float
    is_sharing: bool = True


class LocationPublic(BaseModel):
    user_id: str
    lat: float
    lng: float
    is_sharing: bool
    created_at: dt.datetime
