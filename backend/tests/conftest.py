import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"
os.environ["DEMO_TODAY"] = "2026-10-22"
os.environ["GROQ_API_KEY"] = ""   # tests never call a real provider
os.environ["GROQ_MODEL"] = ""
