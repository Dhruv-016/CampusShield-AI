"""Create tables and insert missing demo data. Safe to re-run (never deletes data). Run from repo root: python scripts/seed_database.py"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app import models  # noqa
from app.db import Base, SessionLocal, engine
from app.seed import seed_all

Base.metadata.create_all(engine)
with SessionLocal() as db:
    print("Seeded:", seed_all(db) or "nothing to add (already seeded)")
