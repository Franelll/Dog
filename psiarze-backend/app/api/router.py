from __future__ import annotations

from fastapi import APIRouter

from app.api import auth, chats, dogs, friends, locations, users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(dogs.router)
api_router.include_router(friends.router)
api_router.include_router(chats.router)
api_router.include_router(locations.router)
