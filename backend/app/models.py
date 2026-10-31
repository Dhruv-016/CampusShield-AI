from datetime import date, datetime, timezone
from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


class Student(Base):
    __tablename__ = "students"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(120), unique=True, index=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(256), nullable=True)
    programme: Mapped[str] = mapped_column(String(100), default="General Studies")
    semester: Mapped[str] = mapped_column(String(32), default="Semester 1")
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    account_status: Mapped[str] = mapped_column(String(32), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Session(Base):
    __tablename__ = "sessions"
    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)


class FeeRecord(Base):
    __tablename__ = "fee_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id"), index=True)
    semester: Mapped[str] = mapped_column(String(32))
    total_fee: Mapped[int] = mapped_column(Integer)
    paid_amount: Mapped[int] = mapped_column(Integer)
    due_date: Mapped[date] = mapped_column(Date)
    currency: Mapped[str] = mapped_column(String(8), default="INR")


class ScholarshipRecord(Base):
    """Assignment 2: Student scholarship awards and financial aid status."""
    __tablename__ = "scholarship_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id"), index=True)
    scholarship_name: Mapped[str] = mapped_column(String(120))
    grant_amount: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")  # ACTIVE | DISBURSED | UNDER_REVIEW | REVOKED
    academic_year: Mapped[str] = mapped_column(String(20), default="2026-2027")
    renewal_criteria: Mapped[str] = mapped_column(Text, default="Minimum CGPA 3.5 & 75% attendance")
    currency: Mapped[str] = mapped_column(String(8), default="INR")


class StudentBankAccount(Base):
    """Assignment 2: Sensitive student refund bank account (requires approval to modify)."""
    __tablename__ = "student_bank_accounts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id"), unique=True, index=True)
    bank_name: Mapped[str] = mapped_column(String(100))
    account_number_masked: Mapped[str] = mapped_column(String(32))  # e.g. ************4821
    account_number: Mapped[str] = mapped_column(String(64))  # Encrypted or stored
    ifsc_code: Mapped[str] = mapped_column(String(32))
    account_holder: Mapped[str] = mapped_column(String(100))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)



class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    event_date: Mapped[date] = mapped_column(Date, index=True)
    event_type: Mapped[str] = mapped_column(String(32), index=True)
    description: Mapped[str] = mapped_column(Text, default="")


class Conversation(Base):
    __tablename__ = "conversations"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(32), index=True)
    title: Mapped[str] = mapped_column(String(120), default="New conversation")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("conversations.id"), index=True)
    role: Mapped[str] = mapped_column(String(16))
    content: Mapped[str] = mapped_column(Text)  # user content is stored AFTER redaction
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    trace_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    meta: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class Memory(Base):
    __tablename__ = "memories"
    __table_args__ = (UniqueConstraint("student_id", "content", name="uq_memory_student_content"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[str] = mapped_column(String(32), index=True)
    category: Mapped[str] = mapped_column(String(32))
    content: Mapped[str] = mapped_column(String(300))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class PolicyDocument(Base):
    __tablename__ = "policy_documents"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    doc_type: Mapped[str] = mapped_column(String(40), default="student_handbook")
    status: Mapped[str] = mapped_column(String(20), default="indexed")
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)


class PolicyChunk(Base):
    __tablename__ = "policy_chunks"
    chunk_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    document_id: Mapped[str] = mapped_column(ForeignKey("policy_documents.id"), index=True)
    document_title: Mapped[str] = mapped_column(String(200))
    section_title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    source_location: Mapped[str] = mapped_column(String(80))
    chunk_index: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Trace(Base):
    __tablename__ = "traces"
    __table_args__ = (Index("ix_trace_created", "created_at"),)
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    conversation_id: Mapped[str | None] = mapped_column(String(40), index=True, nullable=True)
    student_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    route: Mapped[str | None] = mapped_column(String(20), index=True, nullable=True)
    router_source: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[str] = mapped_column(String(12), index=True)  # success | error
    latency_ms: Mapped[float] = mapped_column(Float)
    tool_calls: Mapped[list] = mapped_column(JSON, default=list)
    chunk_ids: Mapped[list] = mapped_column(JSON, default=list)
    memory_ids: Mapped[list] = mapped_column(JSON, default=list)
    context: Mapped[dict] = mapped_column(JSON, default=dict)
    events: Mapped[list] = mapped_column(JSON, default=list)
    error_category: Mapped[str | None] = mapped_column(String(40), nullable=True)
    fallback_used: Mapped[bool] = mapped_column(Boolean, default=False)
    provider_status: Mapped[str] = mapped_column(String(32), default="unknown")
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    retrieval_mode: Mapped[str | None] = mapped_column(String(30), nullable=True)
    input_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    output_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    token_source: Mapped[str] = mapped_column(String(16), default="unavailable")  # provider | partial | unavailable
    redacted_message: Mapped[str] = mapped_column(Text, default="")
    redaction_categories: Mapped[list] = mapped_column(JSON, default=list)
    langsmith_status: Mapped[str] = mapped_column(String(40), default="disabled")


class EvalRun(Base):
    __tablename__ = "eval_runs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    mode: Mapped[str] = mapped_column(String(20))  # local | live
    total: Mapped[int] = mapped_column(Integer, default=0)
    passed: Mapped[int] = mapped_column(Integer, default=0)
    failed: Mapped[int] = mapped_column(Integer, default=0)
    blocked: Mapped[int] = mapped_column(Integer, default=0)


class EvalResult(Base):
    __tablename__ = "eval_results"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("eval_runs.id"), index=True)
    case_id: Mapped[str] = mapped_column(String(16))
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(32))
    expected_route: Mapped[str | None] = mapped_column(String(20), nullable=True)
    actual_route: Mapped[str | None] = mapped_column(String(20), nullable=True)
    expected_tool: Mapped[str | None] = mapped_column(String(40), nullable=True)
    actual_tools: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(10))  # passed | failed | blocked
    latency_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    trace_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    evidence_ids: Mapped[list] = mapped_column(JSON, default=list)
    note: Mapped[str] = mapped_column(Text, default="")


class ActionApproval(Base):
    """Assignment 2: Human-in-the-loop pending approval requests for sensitive actions."""
    __tablename__ = "action_approvals"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)  # appv_...
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id"), index=True)
    conversation_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    action_type: Mapped[str] = mapped_column(String(40), index=True)  # update_bank_account | apply_scholarship | update_major | emergency_leave
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)  # pending | approved | rejected
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    decided_by: Mapped[str | None] = mapped_column(String(60), nullable=True)  # student | registrar | faculty
    decision_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    execution_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class SecurityAuditLog(Base):
    """Assignment 2: Comprehensive immutable security and permission audit records."""
    __tablename__ = "security_audit_logs"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)  # aud_...
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    actor_id: Mapped[str] = mapped_column(String(60), index=True)  # authenticated student or guest
    actor_email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    action_category: Mapped[str] = mapped_column(String(40), index=True)  # data_access | sensitive_action | auth | pii_redaction
    action_name: Mapped[str] = mapped_column(String(80))  # e.g. view_fee_status, cross_student_access, bank_update
    target_resource: Mapped[str] = mapped_column(String(100))  # e.g. FeeRecord:STU-DEMO-1002
    target_student_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    decision: Mapped[str] = mapped_column(String(30), index=True)  # ALLOWED | BLOCKED_UNAUTHORIZED | PENDING_APPROVAL | APPROVED | REJECTED
    reason: Mapped[str] = mapped_column(Text, default="")
    trace_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), default="127.0.0.1")
    execution_status: Mapped[str] = mapped_column(String(20), default="completed")  # completed | blocked | aborted

