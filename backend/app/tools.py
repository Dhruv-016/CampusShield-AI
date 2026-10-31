"""Explicitly registered tools with code-level authorization & audit logging (Assignment 2).
Every tool returns {"status": ok|not_found|empty|error|blocked_unauthorized|pending_approval, "data": ...}.
"""
import re
import uuid
from datetime import date, datetime, timezone
from sqlalchemy import select
from .config import settings
from .models import (
    ActionApproval,
    CalendarEvent,
    FeeRecord,
    ScholarshipRecord,
    SecurityAuditLog,
    Student,
    StudentBankAccount,
    utcnow,
)
from .retrieval_service import get_retriever

STUDENT_ID_RX = re.compile(r"^STU-(?:DEMO|\d{4}|[A-Za-z0-9]+)(?:-[A-Za-z0-9]+)*$")
TOOL_REGISTRY = (
    "get_fee_status",
    "get_academic_calendar",
    "search_student_policy",
    "get_scholarship_status",
    "stage_sensitive_action",
    "get_bank_account",
)


class ToolError(Exception):
    pass


class AuthorizationError(Exception):
    pass


def log_security_audit(
    db,
    actor_id: str,
    action_category: str,
    action_name: str,
    target_resource: str,
    decision: str,
    target_student_id: str | None = None,
    reason: str = "",
    trace_id: str | None = None,
    execution_status: str = "completed",
    actor_email: str | None = None,
) -> SecurityAuditLog:
    """Create an immutable security audit entry required by Assignment 2."""
    entry = SecurityAuditLog(
        id="aud_" + uuid.uuid4().hex[:12],
        timestamp=utcnow(),
        actor_id=actor_id,
        actor_email=actor_email,
        action_category=action_category,
        action_name=action_name,
        target_resource=target_resource,
        target_student_id=target_student_id,
        decision=decision,
        reason=reason,
        trace_id=trace_id,
        execution_status=execution_status,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_fee_status(
    db,
    student_id: str,
    requester_id: str | None = None,
    fault: str | None = None,
    trace_id: str | None = None,
) -> dict:
    """Retrieve tuition balance and invoice status with code-level authorization check."""
    if fault == "tool_error":
        raise ToolError("injected fault")
    if not STUDENT_ID_RX.match(student_id or ""):
        return {"status": "not_found", "data": None}

    # Code-level authorization check: student can only read their own record
    eff_requester = requester_id or student_id
    if requester_id and requester_id != student_id:
        log_security_audit(
            db,
            actor_id=eff_requester,
            action_category="data_access",
            action_name="get_fee_status",
            target_resource=f"FeeRecord:{student_id}",
            target_student_id=student_id,
            decision="BLOCKED_UNAUTHORIZED",
            reason=f"Student {eff_requester} attempted to access private fee record of student {student_id}.",
            trace_id=trace_id,
            execution_status="blocked",
        )
        return {
            "status": "blocked_unauthorized",
            "data": None,
            "error": "Access to another student's private record is blocked by code-level authorization policy.",
            "target_student_id": student_id,
            "requester_id": eff_requester,
        }

    student = db.get(Student, student_id)
    fee = db.scalars(
        select(FeeRecord).where(FeeRecord.student_id == student_id).order_by(FeeRecord.due_date.desc())
    ).first()

    if not student or not fee:
        return {"status": "not_found", "data": None}

    outstanding = fee.total_fee - fee.paid_amount
    status = "PAID" if outstanding <= 0 else ("UNPAID" if fee.paid_amount == 0 else "PARTIALLY_PAID")

    log_security_audit(
        db,
        actor_id=eff_requester,
        action_category="data_access",
        action_name="get_fee_status",
        target_resource=f"FeeRecord:{student_id}",
        target_student_id=student_id,
        decision="ALLOWED",
        reason=f"Student {eff_requester} authorized to access own fee record.",
        trace_id=trace_id,
        execution_status="completed",
    )

    return {
        "status": "ok",
        "data": {
            "student_id": student_id,
            "student_name": student.name,
            "semester": fee.semester,
            "total_fee": fee.total_fee,
            "paid_amount": fee.paid_amount,
            "outstanding_amount": outstanding,
            "status": status,
            "due_date": fee.due_date.isoformat(),
            "currency": fee.currency,
            "is_demo_data": bool(student.is_demo),
        },
    }


def get_scholarship_status(
    db,
    student_id: str,
    requester_id: str | None = None,
    fault: str | None = None,
    trace_id: str | None = None,
) -> dict:
    """Retrieve scholarship grants with code-level authorization check (Assignment 2)."""
    if fault == "tool_error":
        raise ToolError("injected fault")
    if not STUDENT_ID_RX.match(student_id or ""):
        return {"status": "not_found", "data": None}

    eff_requester = requester_id or student_id
    if requester_id and requester_id != student_id:
        log_security_audit(
            db,
            actor_id=eff_requester,
            action_category="data_access",
            action_name="get_scholarship_status",
            target_resource=f"ScholarshipRecord:{student_id}",
            target_student_id=student_id,
            decision="BLOCKED_UNAUTHORIZED",
            reason=f"Student {eff_requester} attempted to access private scholarship grant of student {student_id}.",
            trace_id=trace_id,
            execution_status="blocked",
        )
        return {
            "status": "blocked_unauthorized",
            "data": None,
            "error": "Access to another student's private scholarship record is blocked by authorization policy.",
            "target_student_id": student_id,
            "requester_id": eff_requester,
        }

    student = db.get(Student, student_id)
    sch = db.scalars(
        select(ScholarshipRecord)
        .where(ScholarshipRecord.student_id == student_id)
        .order_by(ScholarshipRecord.id.desc())
    ).first()

    if not student or not sch:
        return {"status": "not_found", "data": None}

    log_security_audit(
        db,
        actor_id=eff_requester,
        action_category="data_access",
        action_name="get_scholarship_status",
        target_resource=f"ScholarshipRecord:{student_id}",
        target_student_id=student_id,
        decision="ALLOWED",
        reason=f"Student {eff_requester} authorized to access own scholarship record.",
        trace_id=trace_id,
        execution_status="completed",
    )

    return {
        "status": "ok",
        "data": {
            "student_id": student_id,
            "student_name": student.name,
            "scholarship_name": sch.scholarship_name,
            "grant_amount": sch.grant_amount,
            "status": sch.status,
            "academic_year": sch.academic_year,
            "renewal_criteria": sch.renewal_criteria,
            "currency": sch.currency,
        },
    }


def get_bank_account(
    db,
    student_id: str,
    requester_id: str | None = None,
    trace_id: str | None = None,
) -> dict:
    """Retrieve masked bank account details for refund verification."""
    eff_requester = requester_id or student_id
    if requester_id and requester_id != student_id:
        log_security_audit(
            db,
            actor_id=eff_requester,
            action_category="data_access",
            action_name="get_bank_account",
            target_resource=f"StudentBankAccount:{student_id}",
            target_student_id=student_id,
            decision="BLOCKED_UNAUTHORIZED",
            reason=f"Student {eff_requester} attempted to read financial banking data of {student_id}.",
            trace_id=trace_id,
            execution_status="blocked",
        )
        return {"status": "blocked_unauthorized", "data": None}

    bank = db.scalar(select(StudentBankAccount).where(StudentBankAccount.student_id == student_id))
    if not bank:
        return {"status": "not_found", "data": None}

    return {
        "status": "ok",
        "data": {
            "student_id": student_id,
            "bank_name": bank.bank_name,
            "account_number_masked": bank.account_number_masked,
            "ifsc_code": bank.ifsc_code,
            "account_holder": bank.account_holder,
        },
    }


def stage_sensitive_action(
    db,
    student_id: str,
    action_type: str,
    title: str,
    description: str,
    payload: dict,
    conversation_id: str | None = None,
    trace_id: str | None = None,
) -> dict:
    """Stage a sensitive mutation requiring interactive human approval before execution (Assignment 2)."""
    appv_id = "appv_" + uuid.uuid4().hex[:12]
    approval = ActionApproval(
        id=appv_id,
        student_id=student_id,
        conversation_id=conversation_id,
        action_type=action_type,
        title=title,
        description=description,
        payload=payload,
        status="pending",
        created_at=utcnow(),
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)

    log_security_audit(
        db,
        actor_id=student_id,
        action_category="sensitive_action",
        action_name=action_type,
        target_resource=f"ActionApproval:{appv_id}",
        target_student_id=student_id,
        decision="PENDING_APPROVAL",
        reason=f"Sensitive action '{title}' requires explicit human approval before database mutation.",
        trace_id=trace_id,
        execution_status="pending",
    )

    return {
        "status": "pending_approval",
        "data": {
            "approval_id": approval.id,
            "action_type": approval.action_type,
            "title": approval.title,
            "description": approval.description,
            "payload": approval.payload,
            "status": approval.status,
            "created_at": approval.created_at.isoformat(),
        },
    }


def execute_approval_decision(
    db,
    approval_id: str,
    decision: str,  # approved | rejected
    decided_by: str = "student",
    reason: str | None = None,
) -> dict:
    """Handle human decision (Approve or Reject) for a staged sensitive action."""
    approval = db.get(ActionApproval, approval_id)
    if not approval:
        return {"status": "error", "error": "Approval request not found"}
    if approval.status != "pending":
        return {"status": "error", "error": f"Approval is already in '{approval.status}' state."}

    now = utcnow()
    approval.decided_at = now
    approval.decided_by = decided_by
    approval.decision_reason = reason or ("Confirmed by user" if decision == "approved" else "Rejected by user")

    if decision == "approved":
        approval.status = "approved"
        # Execute the actual staged mutation
        mutation_result = {}
        if approval.action_type == "update_bank_account":
            bank = db.scalar(select(StudentBankAccount).where(StudentBankAccount.student_id == approval.student_id))
            acc = str(approval.payload.get("account_number", "9876543210"))
            masked = "*" * (len(acc) - 4) + acc[-4:] if len(acc) > 4 else "****" + acc
            if bank:
                bank.bank_name = approval.payload.get("bank_name", bank.bank_name)
                bank.account_number = acc
                bank.account_number_masked = masked
                bank.ifsc_code = approval.payload.get("ifsc_code", bank.ifsc_code)
                bank.account_holder = approval.payload.get("account_holder", bank.account_holder)
                bank.updated_at = now
            else:
                bank = StudentBankAccount(
                    student_id=approval.student_id,
                    bank_name=approval.payload.get("bank_name", "Primary Student Bank"),
                    account_number=acc,
                    account_number_masked=masked,
                    ifsc_code=approval.payload.get("ifsc_code", "CAMP0001001"),
                    account_holder=approval.payload.get("account_holder", "Authorized Student"),
                    updated_at=now,
                )
                db.add(bank)
            mutation_result = {"updated": "bank_account", "masked_account": masked, "status": "active"}

        elif approval.action_type == "apply_scholarship":
            sch = ScholarshipRecord(
                student_id=approval.student_id,
                scholarship_name=approval.payload.get("scholarship_name", "Emergency Tuition Assistance Grant"),
                grant_amount=int(approval.payload.get("amount", 20000)),
                status="UNDER_REVIEW",
                academic_year="2026-2027",
                renewal_criteria=approval.payload.get("criteria", "Pending faculty committee verification"),
            )
            db.add(sch)
            mutation_result = {"submitted": "scholarship_application", "status": "UNDER_REVIEW"}

        elif approval.action_type == "update_programme":
            student = db.get(Student, approval.student_id)
            if student:
                student.programme = approval.payload.get("new_programme", student.programme)
                student.updated_at = now
                mutation_result = {"updated": "programme", "new_programme": student.programme}

        approval.execution_result = mutation_result
        db.commit()

        log_security_audit(
            db,
            actor_id=decided_by,
            action_category="sensitive_action",
            action_name=approval.action_type,
            target_resource=f"ActionApproval:{approval.id}",
            target_student_id=approval.student_id,
            decision="APPROVED",
            reason=f"Human approved action: {approval.decision_reason}. Mutation applied.",
            execution_status="completed",
        )
        return {
            "status": "ok",
            "decision": "approved",
            "message": f"Action '{approval.title}' has been approved and executed successfully.",
            "execution_result": mutation_result,
        }

    else:
        # Rejected: zero database mutations!
        approval.status = "rejected"
        approval.execution_result = {"aborted": True, "reason": approval.decision_reason}
        db.commit()

        log_security_audit(
            db,
            actor_id=decided_by,
            action_category="sensitive_action",
            action_name=approval.action_type,
            target_resource=f"ActionApproval:{approval.id}",
            target_student_id=approval.student_id,
            decision="REJECTED",
            reason=f"Human rejected action: {approval.decision_reason}. Execution halted with zero record mutations.",
            execution_status="aborted",
        )
        return {
            "status": "ok",
            "decision": "rejected",
            "message": f"Action '{approval.title}' was rejected. The proposed change was aborted, and your record remains unmodified.",
            "execution_result": {"aborted": True},
        }


def today() -> date:
    return date.fromisoformat(settings.demo_today) if settings.demo_today else date.today()


def get_academic_calendar(db, month: int | None = None, event_type: str | None = None, limit: int = 3) -> dict:
    t = today()
    q = select(CalendarEvent).order_by(CalendarEvent.event_date)
    if event_type:
        q = q.where(CalendarEvent.event_type == event_type)
    rows = db.scalars(q).all()
    start = t.replace(day=1) if month else t
    rows = [r for r in rows if r.event_date >= start and (month is None or r.event_date.month == month)][:limit]
    if not rows:
        return {"status": "empty", "data": {"events": [], "as_of": t.isoformat()}}
    return {
        "status": "ok",
        "data": {
            "as_of": t.isoformat(),
            "events": [
                {"title": r.title, "date": r.event_date.isoformat(), "type": r.event_type, "description": r.description}
                for r in rows
            ],
        },
    }


def search_student_policy(db, query: str, limit: int = 3, fault: str | None = None) -> dict:
    if fault == "no_retrieval":
        return {"status": "empty", "data": {"chunks": [], "mode": "lexical-bm25"}}
    r = get_retriever(db)
    hits = r.search(query, limit=limit)
    return {"status": "ok" if hits else "empty", "data": {"chunks": hits, "mode": r.mode}}
