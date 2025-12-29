from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def _normalize_db_url(url: str) -> str:
    # For SQLite, ensure check_same_thread is disabled for FastAPI.
    if url.startswith("sqlite:"):
        if "?" in url:
            return url + "&check_same_thread=false"
        return url + "?check_same_thread=false"
    # Render uses postgres:// but SQLAlchemy 2.x needs postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # Add sslmode for Render PostgreSQL if not already present
    if url.startswith("postgresql://") and "sslmode" not in url:
        if "?" in url:
            url = url + "&sslmode=require"
        else:
            url = url + "?sslmode=require"
    return url


engine = create_engine(
    _normalize_db_url(settings.database_url),
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
