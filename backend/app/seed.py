from datetime import date
from sqlalchemy import select, func
from .models import CalendarEvent, FeeRecord, PolicyChunk, ScholarshipRecord, Student, StudentBankAccount
from .retrieval_service import ingest_handbook

STUDENTS = [
    ("STU-DEMO-1001", "Aarav Mehta (Demo)", "MSc Data Science", "Semester 3"),
    ("STU-DEMO-1002", "Diya Nair (Demo)", "MSc Data Science", "Semester 3"),
    ("STU-DEMO-1003", "Kabir Rao (Demo)", "MSc Artificial Intelligence", "Semester 3"),
]
FEES = [("STU-DEMO-1001", 85000, 60000), ("STU-DEMO-1002", 85000, 85000), ("STU-DEMO-1003", 85000, 0)]
SCHOLARSHIPS = [
    ("STU-DEMO-1001", "Merit Excellence Academic Fellowship", 35000, "ACTIVE", "Minimum CGPA 3.5 & 75% attendance"),
    ("STU-DEMO-1002", "Women in Technology Leadership Award", 40000, "DISBURSED", "Minimum CGPA 3.2"),
    ("STU-DEMO-1003", "Need-Based Campus Assistance Grant", 25000, "UNDER_REVIEW", "Income certificate verification"),
]
BANK_ACCOUNTS = [
    ("STU-DEMO-1001", "State Bank of India", "************4821", "SBI0004921", "Aarav Mehta"),
    ("STU-DEMO-1002", "HDFC Bank Ltd", "************9912", "HDFC0001024", "Diya Nair"),
    ("STU-DEMO-1003", "ICICI Bank Ltd", "************3341", "ICIC0000219", "Kabir Rao"),
]
EVENTS = [
    ("Semester 3 begins", date(2026, 9, 1), "semester", "Teaching starts for Semester 3."),
    ("Mid-semester examination week begins", date(2026, 11, 2), "exam", "Mid-semester examinations run for one week."),
    ("Semester 3 fee payment deadline", date(2026, 11, 15), "deadline", "Last date to pay Semester 3 fees without late fee."),
    ("Course change window closes", date(2026, 11, 26), "deadline", "Last date to request a course change."),
    ("Semester 3 ends", date(2026, 12, 18), "semester", "Last teaching day of Semester 3."),
    ("Semester 4 begins", date(2027, 1, 11), "semester", "Teaching starts for Semester 4."),
]


def seed_all(db) -> dict:
    """Idempotent: only inserts what is missing. Never deletes user data."""
    added = {}
    if db.scalar(select(func.count()).select_from(Student)) == 0:
        db.add_all([Student(id=i, name=n, programme=p, semester=s) for i, n, p, s in STUDENTS])
        db.add_all([FeeRecord(student_id=i, semester="Semester 3", total_fee=t, paid_amount=p,
                              due_date=date(2026, 11, 15)) for i, t, p in FEES])
        added["students"] = len(STUDENTS)
    if db.scalar(select(func.count()).select_from(ScholarshipRecord)) == 0:
        db.add_all([ScholarshipRecord(student_id=i, scholarship_name=n, grant_amount=a, status=st, renewal_criteria=c)
                    for i, n, a, st, c in SCHOLARSHIPS])
        added["scholarships"] = len(SCHOLARSHIPS)
    if db.scalar(select(func.count()).select_from(StudentBankAccount)) == 0:
        db.add_all([StudentBankAccount(student_id=i, bank_name=b, account_number_masked=m, account_number=m, ifsc_code=f, account_holder=h)
                    for i, b, m, f, h in BANK_ACCOUNTS])
        added["bank_accounts"] = len(BANK_ACCOUNTS)
    if db.scalar(select(func.count()).select_from(CalendarEvent)) == 0:
        db.add_all([CalendarEvent(title=t, event_date=d, event_type=k, description=x) for t, d, k, x in EVENTS])
        added["events"] = len(EVENTS)
    db.commit()
    if db.scalar(select(func.count()).select_from(PolicyChunk)) == 0:
        added["handbook"] = ingest_handbook(db)
    return added
