import sys, traceback
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app import models  # noqa
from app.db import Base, SessionLocal, engine
from app.seed import seed_all
import app.service as svc

orig = svc.build_graph
class Wrap:
    def __init__(self, g): self.g = g
    def invoke(self, s):
        try:
            return self.g.invoke(s)
        except Exception:
            traceback.print_exc()
            raise
svc.build_graph = lambda db: Wrap(orig(db))

Base.metadata.create_all(engine)
with SessionLocal() as db:
    seed_all(db)
    r = svc.run_chat(db, "When is the next academic event?")
    print("ROUTE:", r["route"], "| ERROR:", r["error_category"])
    print("ANSWER:", r["answer"])
