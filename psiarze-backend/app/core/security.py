from __future__ import annotations

import datetime as dt
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # bcrypt has a 72-byte limit, truncate if necessary
    password_bytes = password.encode('utf-8')[:72]
    return pwd_context.hash(password_bytes.decode('utf-8', errors='ignore'))


def verify_password(password: str, password_hash: str) -> bool:
    password_bytes = password.encode('utf-8')[:72]
    return pwd_context.verify(password_bytes.decode('utf-8', errors='ignore'), password_hash)


def create_access_token(*, subject: str, extra: dict[str, Any] | None = None) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    exp = now + dt.timedelta(minutes=settings.jwt_access_token_minutes)

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    if extra:
        payload.update(extra)

    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
