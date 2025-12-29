from __future__ import annotations

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Psiarze API"
    environment: str = "dev"

    # SQLite by default for local dev; for Render use Postgres (e.g. postgres://...)
    database_url: str = "sqlite:///./psiarze.db"

    # JWT
    jwt_secret: str = "CHANGE_ME_DEV_SECRET"
    jwt_algorithm: str = "HS256"
    jwt_access_token_minutes: int = 60 * 24 * 7

    # CORS: comma-separated list
    cors_origins: str = "*"


settings = Settings()


class HealthResponse(BaseModel):
    status: str
    app: str
    env: str
