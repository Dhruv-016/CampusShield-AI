import os, sys, traceback
from pathlib import Path
BACKEND = Path(__file__).resolve().parents[1] / "backend"
os.chdir(BACKEND)
sys.path.insert(0, str(BACKEND))
from fastapi.testclient import TestClient
import app.service as svc
from app.main import app

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

with TestClient(app) as c:
    r = c.post("/api/v1/chat", json={"message": "When is the next academic event?"})
    print("STATUS:", r.status_code)
    j = r.json()
    print("ROUTE:", j.get("route"), "| ERROR:", j.get("error_category"))
    print("ANSWER:", j.get("answer"))
