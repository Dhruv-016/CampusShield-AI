"""Deterministic routing heuristics, sensitive action detection, and memory extraction. Pure functions (Assignment 2)."""
import re
from .retrieval import tokenize

ROUTES = {
    "direct",
    "fee",
    "scholarship",
    "cross_student_access",
    "sensitive_action",
    "calendar",
    "policy",
    "memory",
    "clarify",
    "fallback",
}

_GREETING = re.compile(
    r"^\s*(hi|hello|hey|good (morning|afternoon|evening)|thanks|thank you)\b|what can you (help|do)|who are you", re.I
)
_MEMORY = re.compile(r"\b(remember|save this|note that|keep in mind)\b", re.I)
_FEE = re.compile(
    r"\b(fee status|fees status|tuition|outstanding|balance|how much (do i|have i|am i)|amount (paid|due|pending)|my fees?|pending fees?|pay my fee)\b",
    re.I,
)
_SCHOLARSHIP = re.compile(
    r"\b(my scholarship|scholarship status|scholarship grant|financial aid status|active scholarship|fellowship status|my grant)\b",
    re.I,
)
_CALENDAR = re.compile(
    r"\b(calendar|academic event|next event|semester (begin|start)|exam|events? (in|scheduled)|when does|when is the next)\b",
    re.I,
)
_POLICY_CUES = re.compile(
    r"\b(handbook|policy|policies|portal|deadline|scholarship|scholarships|course|courses|subject|subjects|syllabus|curriculum|registration|attendance|leave|exam|exams|examination|grade|grades|gpa|credit|credits|campuspilot|campusshield|architecture|system|working day|refund|late fee|rule|rules|contact|office|allowed|can i|payment)\b",
    re.I,
)

# Sensitive action cues (Assignment 2: Human-in-the-loop approval required)
_SENSITIVE_BANK = re.compile(
    r"\b(update|change|set|modify|replace)\s+(?:my\s+)?(?:refund\s+)?(?:bank|account|ifsc|iban|payout)\b|\b(?:bank|account)\s+(?:details?|number)\s+(?:change|update)\b",
    re.I,
)
_SENSITIVE_SCHOLARSHIP = re.compile(
    r"\b(apply|submit|request)\s+(?:for\s+)?(?:emergency|special|need-based|hardship)?\s*(?:scholarship|grant|fee waiver|concession)\b",
    re.I,
)
_SENSITIVE_PROGRAMME = re.compile(
    r"\b(change|switch|transfer|update)\s+(?:my\s+)?(?:enrolled\s+)?(?:programme|program|major|course|stream|branch)\b",
    re.I,
)

KNOWN_STUDENT_NAMES = {
    "aarav": "STU-DEMO-1001",
    "aarav mehta": "STU-DEMO-1001",
    "diya": "STU-DEMO-1002",
    "diya nair": "STU-DEMO-1002",
    "kabir": "STU-DEMO-1003",
    "kabir rao": "STU-DEMO-1003",
}


def detect_target_student(message: str, current_student_id: str | None) -> tuple[str | None, str | None]:
    """Detect if the message asks about another student's record by explicit ID or student name.
    Returns (target_student_id, target_student_name) or (None, None)."""
    m = message.lower()

    # Look for explicit STU- ID
    found_ids = re.findall(r"\b(stu-(?:demo|\d{4}|[a-z0-9]+)(?:-[a-z0-9]+)*)\b", m, re.I)
    for sid in found_ids:
        sid_upper = sid.upper()
        if current_student_id and sid_upper != current_student_id.upper():
            return sid_upper, sid_upper

    # Look for known names
    for name, sid in KNOWN_STUDENT_NAMES.items():
        if re.search(r"\b" + re.escape(name) + r"\b", m):
            if current_student_id and sid.upper() != current_student_id.upper():
                return sid, name.title()

    # Check for generic phrasing: "another student", "someone else's fee", "my friend's record"
    if re.search(r"\b(another student|other student|someone else|classmate|peer|friend)'?s?\s+(?:fee|scholarship|record|dues|status)\b", m, re.I):
        return "STU-ANOTHER-UNKNOWN", "Another Student"

    return None, None


def route_heuristic(message: str, student_id: str | None) -> str:
    m = message.strip()

    # 1. Check for cross-student private data probing (Assignment 2 priority)
    target_id, _ = detect_target_student(m, student_id)
    if target_id and (_FEE.search(m) or _SCHOLARSHIP.search(m) or re.search(r"\b(record|status|account|details|info)\b", m, re.I)):
        return "cross_student_access"

    # 2. Check for sensitive actions requiring human approval (Assignment 2 priority)
    if _SENSITIVE_BANK.search(m) or _SENSITIVE_SCHOLARSHIP.search(m) or _SENSITIVE_PROGRAMME.search(m):
        return "sensitive_action"

    # 3. Standard routes
    if _MEMORY.search(m):
        return "memory"
    if _GREETING.search(m) and len(m) < 80:
        return "direct"
    if _SCHOLARSHIP.search(m):
        return "scholarship" if student_id else "clarify"
    if _FEE.search(m) and not re.search(r"\b(handbook|policy|portal|deadline)\b", m, re.I):
        return "fee" if student_id else "clarify"
    if _CALENDAR.search(m):
        return "calendar"
    if _POLICY_CUES.search(m) or "?" in m or m.lower().startswith(("what", "how", "when", "where", "who", "can", "is", "are", "do")):
        return "policy" if tokenize(m) else "clarify"
    return "direct"


_STYLE = re.compile(r"\b(concise|brief|short|bullet|detailed|simple|step[- ]by[- ]step)\b", re.I)
_LANG = re.compile(r"\b(?:in|use|speak)\s+(english|hindi|gujarati|marathi|tamil|telugu|bengali|spanish|french|german)\b", re.I)
_PROG = re.compile(r"\bi(?:'m| am)?\s*(?:study|studying)\s+(.{3,60})", re.I)


def extract_memory_candidate(message: str) -> tuple[str, str] | None:
    """Return (category, content) for an allowed, non-sensitive preference, else None.
    Allowed categories: response_style, language, programme."""
    text = re.sub(r"(?i)^\s*(please\s+)?(remember|note|keep in mind)( that)?[:,]?\s*", "", message.strip()).strip(" .!")
    if not text:
        return None
    if _STYLE.search(text):
        return "response_style", text[:200]
    if _LANG.search(text):
        return "language", text[:200]
    if _PROG.search(text):
        return "programme", text[:200]
    return None
