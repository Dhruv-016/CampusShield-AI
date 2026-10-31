"""Re-chunk and re-index a handbook. Usage: python scripts/ingest_handbook.py [path/to/handbook.md]
To use another document, pass its path (Markdown with '## 1. Title' style headings)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app import models  # noqa
from app.db import Base, SessionLocal, engine
from app.retrieval_service import ingest_handbook

Base.metadata.create_all(engine)
with SessionLocal() as db:
    print(ingest_handbook(db, sys.argv[1] if len(sys.argv) > 1 else None))
