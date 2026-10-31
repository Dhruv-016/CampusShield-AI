import sys, time, traceback
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app import models  # noqa
from app.db import Base, SessionLocal, engine
from app.seed import seed_all
from app.agent import build_graph

Base.metadata.create_all(engine)
with SessionLocal() as db:
    seed_all(db)
    state = {"request_id": "tr_debug", "conversation_id": "cv_debug", "student_id": "STU-DEMO-1001",
             "user_message": "When is the next academic event?", "use_llm": True, "fault": None,
             "t0": time.perf_counter(), "tool_calls": [], "events": [], "llm_calls": 0,
             "llm_calls_with_usage": 0, "redactions": [], "chunks": [], "memories": [],
             "context_meta": {}, "notices": []}
    try:
        out = build_graph(db).invoke(state)
        print("OK ->", out.get("route"), "|", out.get("answer"))
    except Exception:
        traceback.print_exc()
