from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import HealthResponse, settings
from app.db.init_db import init_db


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    allow_all_origins = (not origins) or ("*" in origins)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all_origins else origins,
        # "*" + credentials is invalid in CORS; disable credentials when allowing all origins.
        allow_credentials=False if allow_all_origins else True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup():
        init_db()

    @app.get("/health", response_model=HealthResponse)
    def health():
        return HealthResponse(status="ok", app=settings.app_name, env=settings.environment)

    @app.get("/debug/db")
    def debug_db():
        """Debug endpoint to check database connection."""
        from sqlalchemy import text
        from app.db.database import engine
        try:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                return {"status": "ok", "db_url_start": settings.database_url[:30] + "..."}
        except Exception as e:
            return {"status": "error", "error": str(e), "db_url_start": settings.database_url[:30] + "..."}

    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
