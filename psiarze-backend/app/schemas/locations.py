from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field


from typing import Optional


class LocationUpsert(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_sharing: bool = True
    
    @property
    def actual_lat(self) -> float:
        return self.latitude or 0.0
    
    @property
    def actual_lng(self) -> float:
        return self.longitude or 0.0


class LocationPublic(BaseModel):
    user_id: str
    username: str = ""
    latitude: float
    longitude: float
    is_active: bool
    created_at: dt.datetime
