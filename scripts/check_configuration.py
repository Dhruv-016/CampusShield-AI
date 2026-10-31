"""Prints configuration status WITHOUT revealing secrets."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app.config import settings
print("GROQ_API_KEY set:", bool(settings.groq_key))
print("GROQ_MODEL set:", bool(settings.groq_model), "->", settings.groq_model or "(none)")
print("Database kind:", settings.database_url.split(":")[0])
print("LangSmith enabled:", settings.langsmith_enabled)
print("Memory enabled:", settings.memory_enabled, "| Demo student:", settings.demo_student_id)
