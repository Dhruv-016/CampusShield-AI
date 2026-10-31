from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings

_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def ensure_schema(bind_engine=engine):
    """Ensure database schema is up-to-date with non-breaking migrations."""
    Base.metadata.create_all(bind_engine)
    try:
        inspector = inspect(bind_engine)
        if "students" in inspector.get_table_names():
            columns = {col["name"] for col in inspector.get_columns("students")}
            with bind_engine.begin() as conn:
                if "email" not in columns:
                    conn.execute(text("ALTER TABLE students ADD COLUMN email VARCHAR(120)"))
                if "password_hash" not in columns:
                    conn.execute(text("ALTER TABLE students ADD COLUMN password_hash VARCHAR(256)"))
                if "account_status" not in columns:
                    conn.execute(text("ALTER TABLE students ADD COLUMN account_status VARCHAR(32) DEFAULT 'active'"))
                if "created_at" not in columns:
                    conn.execute(text("ALTER TABLE students ADD COLUMN created_at DATETIME"))
                if "updated_at" not in columns:
                    conn.execute(text("ALTER TABLE students ADD COLUMN updated_at DATETIME"))
    except Exception as e:
        # Log and continue; SQLite might already have columns or in-memory DB
        pass


# Ensure schema migrations run automatically on initialization
ensure_schema(engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
