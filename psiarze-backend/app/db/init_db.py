from __future__ import annotations

from sqlalchemy import text, inspect
from app.db.database import engine
from app.db.models import Base


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

    # Simple migration for dogs table
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if inspector.has_table("dogs"):
                columns = [c["name"] for c in inspector.get_columns("dogs")]
                
                if "age" not in columns:
                    conn.execute(text("ALTER TABLE dogs ADD COLUMN age INTEGER"))
                
                if "weight" not in columns:
                    conn.execute(text("ALTER TABLE dogs ADD COLUMN weight FLOAT"))
                
                conn.commit()
    except Exception as e:
        print(f"Migration failed: {e}")
