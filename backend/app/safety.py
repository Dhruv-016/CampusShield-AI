"""Pattern-based sensitive-data detection and redaction.

LIMITATION: regex detection is best-effort. It catches obvious OTPs, passwords,
API keys, tokens and card numbers. It cannot identify every sensitive fact.
"""
import re

PATTERNS = [
    ("otp", re.compile(r"(?i)\b(?:otp|one[- ]time (?:password|code)|verification code|passcode|pin)\b[^0-9\n]{0,30}\d{4,8}\b")),
    ("password", re.compile(r"(?i)\b(?:password|passwd|pwd)\b\s*(?:is|:|=)?\s*\S+")),
    ("api_key", re.compile(r"\b(?:gsk_[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]{10,}|lsv2_[A-Za-z0-9_]{10,})\b")),
    ("token", re.compile(r"(?i)\b(?:token|secret|api[ _-]?key)\b\s*(?:is|:|=)\s*\S+")),
    ("card", re.compile(r"\b(?:\d[ -]?){12,18}\d\b")),
]


def sanitize(text: str) -> tuple[str, list[str]]:
    """Return (redacted_text, categories_found)."""
    found: list[str] = []
    out = text
    for name, rx in PATTERNS:
        if rx.search(out):
            found.append(name)
            out = rx.sub(f"[REDACTED:{name}]", out)
    return out, found


def is_sensitive(text: str) -> bool:
    return bool(sanitize(text)[1])
