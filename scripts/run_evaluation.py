"""Usage: python scripts/run_evaluation.py [local|live]   (live needs GROQ_API_KEY + GROQ_MODEL, otherwise cases are BLOCKED)"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app import models  # noqa
from app.db import Base, SessionLocal, engine
from app.evaluation import run_evaluation, summarize
from app.seed import seed_all

Base.metadata.create_all(engine)
with SessionLocal() as db:
    seed_all(db)
    run = run_evaluation(db, sys.argv[1] if len(sys.argv) > 1 else "local")
    out = summarize(db, run.id)
    for r in out["results"]:
        print(f"{r['case_id']} {r['status']:8} route={r['actual_route']} tools={r['actual_tools']} {r['latency_ms']}ms  {r['note']}")
    print(out["summary"])
