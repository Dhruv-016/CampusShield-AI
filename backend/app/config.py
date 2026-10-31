import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / "backend" / ".env")


def _b(name: str, default: str) -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


@dataclass
class Settings:
    app_name: str = "CampusShield AI"
    version: str = "2.0.0-assignment2"
    env: str = os.getenv("APP_ENV", "development")
    groq_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "")
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{ROOT / 'campuspilot.db'}")
    cors_origins: tuple = tuple(o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","))
    university_email_domain: str = os.getenv("UNIVERSITY_EMAIL_DOMAIN", "university.edu").strip().lower()
    allow_university_subdomains: bool = _b("ALLOW_UNIVERSITY_SUBDOMAINS", "true")
    memory_enabled: bool = _b("MEMORY_ENABLED", "true")
    demo_mode: bool = _b("DEMO_MODE", "true")
    demo_student_id: str = os.getenv("DEMO_STUDENT_ID", "STU-DEMO-1001")
    demo_today: str = os.getenv("DEMO_TODAY", "")  # ISO date; makes calendar queries reproducible
    langsmith_enabled: bool = _b("LANGSMITH_TRACING", "false") and bool(os.getenv("LANGSMITH_API_KEY"))
    handbook_path: str = str(ROOT / "data" / "sample_student_handbook.md")
    eval_cases_path: str = str(ROOT / "data" / "evaluation_cases.json")
    max_message_chars: int = 1000
    max_tool_calls: int = 2
    rate_limit_per_minute: int = 30


settings = Settings()
