import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from .config import settings
from .models import Session, Student, utcnow


def hash_password(password: str) -> str:
    """Hash password using scrypt with random 16-byte hex salt."""
    salt = secrets.token_hex(16)
    key = hashlib.scrypt(password.encode("utf-8"), salt=salt.encode("utf-8"), n=16384, r=8, p=1, maxmem=0)
    return f"scrypt${salt}${key.hex()}"


def verify_password(password: str, hashed: str | None) -> bool:
    """Verify password against scrypt hash in constant time."""
    if not hashed or not isinstance(hashed, str):
        return False
    try:
        parts = hashed.split("$")
        if len(parts) != 3 or parts[0] != "scrypt":
            return False
        salt, digest = parts[1], parts[2]
        computed = hashlib.scrypt(password.encode("utf-8"), salt=salt.encode("utf-8"), n=16384, r=8, p=1, maxmem=0)
        return hmac.compare_digest(computed.hex(), digest)
    except Exception:
        return False


_EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$")
_PUBLIC_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
    "protonmail.com", "aol.com", "zoho.com", "mail.com", "yandex.com",
}


def validate_university_email(email: str, allowed_domain: str | None = None, allow_subdomains: bool | None = None) -> tuple[bool, str]:
    """Validate university email against configured domain and subdomains.
    Returns (is_valid, normalized_email_or_error_message).
    """
    if not email or not isinstance(email, str):
        return False, "University email address is required."

    normalized = email.strip().lower()
    match = _EMAIL_REGEX.match(normalized)
    if not match:
        return False, "Please provide a valid email format (e.g., student@university.edu)."

    domain_part = match.group(1).lower()
    target = (allowed_domain or settings.university_email_domain).strip().lower()
    subdomains_ok = settings.allow_university_subdomains if allow_subdomains is None else allow_subdomains

    # Check for public email providers
    if domain_part in _PUBLIC_EMAIL_DOMAINS:
        return False, f"Personal email addresses (@{domain_part}) are not allowed. Please use your official university email (@{target})."

    # Exact match on domain
    if domain_part == target:
        return True, normalized

    # Subdomain match: student@eng.university.edu -> domain_part ends with '.university.edu'
    if subdomains_ok and domain_part.endswith("." + target):
        return True, normalized

    return False, f"Email domain '@{domain_part}' is not authorized. Must be @{target} or an authorized campus subdomain."


def validate_legal_name(name: str) -> tuple[bool, str]:
    """Validate full legal name: mandatory, stripped, reasonable length."""
    if not name or not isinstance(name, str):
        return False, "Full legal name is required."
    clean = " ".join(name.strip().split())
    if len(clean) < 2:
        return False, "Full name must be at least 2 characters long."
    if len(clean) > 100:
        return False, "Full name must not exceed 100 characters."
    if not re.match(r"^[A-Za-z\s\-'.]+$", clean):
        return False, "Full name contains invalid characters."
    return True, clean


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets minimum security standards."""
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if len(password) > 128:
        return False, "Password exceeds maximum length (128 characters)."
    return True, ""


def generate_student_id(db) -> str:
    """Generate a unique human-readable student ID: STU-2026-XXXX."""
    for _ in range(50):
        candidate = f"STU-2026-{secrets.randbelow(9000) + 1000}"
        if not db.get(Student, candidate):
            return candidate
    return f"STU-2026-{secrets.token_hex(3).upper()}"


def create_session(db, student_id: str, is_demo: bool = False, hours: int = 72) -> Session:
    """Create a new session token for the student and store in DB."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=hours)
    session = Session(token=token, student_id=student_id, expires_at=expires_at, is_demo=is_demo)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_student_from_token(db, token: str) -> Student | None:
    """Validate session token and return the associated Student if valid and unexpired."""
    if not token or not isinstance(token, str):
        return None
    sess = db.get(Session, token)
    if not sess:
        return None
    # Check expiration
    now = datetime.now(timezone.utc)
    sess_exp = sess.expires_at
    if sess_exp.tzinfo is None:
        sess_exp = sess_exp.replace(tzinfo=timezone.utc)
    if sess_exp <= now:
        db.delete(sess)
        db.commit()
        return None
    return db.get(Student, sess.student_id)


def invalidate_session(db, token: str) -> bool:
    """Delete a session by token."""
    if not token:
        return False
    sess = db.get(Session, token)
    if sess:
        db.delete(sess)
        db.commit()
        return True
    return False
