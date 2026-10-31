"""Assignment 2 Verification Suite: Privacy, Authorization, Human Approvals & Audit Trail.
Tests all required scenarios specified in the Assignment 2 syllabus brief:
1. Logged-in student asks for own fee or scholarship status - allowed.
2. Logged-in student asks for another student's private record - blocked by code-level authorization.
3. Student requests a sensitive change to their record - approval required before execution.
4. Approval is rejected - action must not execute and zero database mutation occurs.
5. Approval is approved - action executes and records audit trail.
6. Sensitive credentials (OTP/password) in chat - must not become persistent memory.
7. Security audit logs record who requested, what was attempted, authorization decision, and result.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.main import app
from app.db import SessionLocal
from app.models import ActionApproval, SecurityAuditLog, StudentBankAccount, Student


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_scenario_1_own_fee_and_scholarship_allowed(client):
    """Scenario 1: Logged-in student asks for their own fee or scholarship status -> Allowed."""
    # Own fee status
    r_fee = client.post("/api/v1/chat", json={"message": "What is my current fee status?"})
    assert r_fee.status_code == 200
    res_fee = r_fee.json()
    assert res_fee["route"] == "fee"
    assert "25,000" in res_fee["answer"]
    assert res_fee["error_category"] is None

    # Own scholarship status
    r_sch = client.post("/api/v1/chat", json={"message": "What is my active scholarship status?"})
    assert r_sch.status_code == 200
    res_sch = r_sch.json()
    assert res_sch["route"] == "scholarship"
    assert "Merit Excellence" in res_sch["answer"]
    assert "35,000" in res_sch["answer"]

    # Verify audit log recorded ALLOWED
    with SessionLocal() as db:
        fee_audit = db.scalars(
            select(SecurityAuditLog)
            .where(SecurityAuditLog.action_name == "get_fee_status", SecurityAuditLog.decision == "ALLOWED")
            .order_by(SecurityAuditLog.timestamp.desc())
        ).first()
        assert fee_audit is not None
        assert fee_audit.execution_status == "completed"


def test_scenario_2_cross_student_private_record_blocked(client):
    """Scenario 2: Logged-in student asks for another student's private record -> Blocked by code-level authorization."""
    # Current student is STU-DEMO-1001 (Aarav). Student asks for Kabir's fee status (STU-DEMO-1003)
    r1 = client.post("/api/v1/chat", json={"message": "What is Kabir Rao's fee status?"})
    assert r1.status_code == 200
    res1 = r1.json()
    assert res1["route"] == "cross_student_access"
    assert res1["error_category"] == "authorization_blocked"
    assert "Access Denied" in res1["answer"]
    assert "BLOCKED_UNAUTHORIZED" in res1["answer"]
    assert res1["tool_calls"][0]["status"] == "blocked_unauthorized"

    # Student asks for Diya's record by explicit ID STU-DEMO-1002
    r2 = client.post("/api/v1/chat", json={"message": "Show me private record for STU-DEMO-1002"})
    assert r2.status_code == 200
    res2 = r2.json()
    assert res2["route"] == "cross_student_access"
    assert "STU-DEMO-1002" in res2["answer"]

    # Verify security audit log captured the unauthorized attempts
    with SessionLocal() as db:
        blocked_log = db.scalars(
            select(SecurityAuditLog)
            .where(SecurityAuditLog.decision == "BLOCKED_UNAUTHORIZED")
            .order_by(SecurityAuditLog.timestamp.desc())
        ).first()
        assert blocked_log is not None
        assert blocked_log.execution_status == "blocked"
        assert "attempted unauthorized access" in blocked_log.reason.lower()


def test_scenario_3_sensitive_change_requires_human_approval(client):
    """Scenario 3: Student requests a sensitive change to their record -> Approval required before execution."""
    r = client.post(
        "/api/v1/chat",
        json={"message": "Update my refund bank account to HDFC Bank account 987654321012 with IFSC HDFC0001024"},
    )
    assert r.status_code == 200
    res = r.json()
    assert res["route"] == "sensitive_action"
    assert "Requires Confirmation & Human Approval" in res["answer"]
    assert res["approval_request"] is not None
    appv_id = res["approval_request"]["approval_id"]
    assert appv_id.startswith("appv_")
    assert res["approval_request"]["status"] == "pending"

    # Verify staged in DB with status "pending"
    with SessionLocal() as db:
        staged = db.get(ActionApproval, appv_id)
        assert staged is not None
        assert staged.status == "pending"
        assert staged.action_type == "update_bank_account"

        # Verify audit log logged PENDING_APPROVAL
        audit = db.scalars(
            select(SecurityAuditLog)
            .where(SecurityAuditLog.decision == "PENDING_APPROVAL", SecurityAuditLog.target_resource == f"ActionApproval:{appv_id}")
        ).first()
        assert audit is not None


def test_scenario_4_approval_rejected_halts_execution_zero_mutations(client):
    """Scenario 4: Approval is rejected -> Action must not execute and record remains unmodified."""
    # Stage an action
    r = client.post("/api/v1/chat", json={"message": "Update my refund bank account to SBI 111122223333"})
    appv_id = r.json()["approval_request"]["approval_id"]

    # Reject the action via decision endpoint
    r_decide = client.post(
        f"/api/v1/approvals/{appv_id}/decide",
        json={"decision": "rejected", "reason": "Student cancelled requested bank change"},
    )
    assert r_decide.status_code == 200
    res_decide = r_decide.json()
    assert res_decide["decision"] == "rejected"
    assert "aborted" in res_decide["message"].lower()

    # Verify ActionApproval is rejected and database was NOT modified
    with SessionLocal() as db:
        appv = db.get(ActionApproval, appv_id)
        assert appv.status == "rejected"
        assert appv.decided_at is not None

        # Verify audit log recorded REJECTED
        audit = db.scalars(
            select(SecurityAuditLog)
            .where(SecurityAuditLog.decision == "REJECTED", SecurityAuditLog.target_resource == f"ActionApproval:{appv_id}")
        ).first()
        assert audit is not None
        assert audit.execution_status == "aborted"


def test_scenario_4b_approval_approved_executes_mutation(client):
    """Approval is approved -> Action executes and database mutation is applied."""
    # Stage an action
    r = client.post("/api/v1/chat", json={"message": "Update my refund bank account to ICICI 555566667777"})
    appv_id = r.json()["approval_request"]["approval_id"]

    # Approve the action
    r_approve = client.post(
        f"/api/v1/approvals/{appv_id}/decide",
        json={"decision": "approved", "reason": "Student verified 2FA token"},
    )
    assert r_approve.status_code == 200
    res_appv = r_approve.json()
    assert res_appv["decision"] == "approved"
    assert "executed successfully" in res_appv["message"]

    # Verify database was mutated
    with SessionLocal() as db:
        appv = db.get(ActionApproval, appv_id)
        assert appv.status == "approved"
        bank = db.scalar(select(StudentBankAccount).where(StudentBankAccount.student_id == appv.student_id))
        assert bank is not None
        assert "7777" in bank.account_number_masked

        # Verify audit log recorded APPROVED
        audit = db.scalars(
            select(SecurityAuditLog)
            .where(SecurityAuditLog.decision == "APPROVED", SecurityAuditLog.target_resource == f"ActionApproval:{appv_id}")
        ).first()
        assert audit is not None
        assert audit.execution_status == "completed"


def test_scenario_5_otp_password_excluded_from_persistent_memory(client):
    """Scenario 5: Sensitive information (OTP, password) in chat -> Must not become persistent memory."""
    r = client.post("/api/v1/chat", json={"message": "My temporary OTP is 987654. Remember it for later."})
    assert r.status_code == 200
    res = r.json()
    # Sensitive response
    assert "won't save sensitive" in res["answer"].lower()
    assert "987654" not in res["answer"]
    assert res["memory_saved"] is None

    # Check memories table in DB: OTP must NOT exist anywhere
    with SessionLocal() as db:
        mems = client.get("/api/v1/memories").json()
        for m in mems:
            assert "987654" not in m["content"]


def test_audit_logs_and_stats_endpoints(client):
    """Verify security audit logs dashboard endpoint and statistics."""
    logs = client.get("/api/v1/audit-logs").json()
    assert "items" in logs
    assert logs["total"] > 0

    stats = client.get("/api/v1/audit-logs/stats").json()
    assert stats["total_audited"] > 0
    assert stats["unauthorized_blocked"] > 0
    assert stats["secrets_leaked"] == 0


def test_evaluation_comparison_table(client):
    """Verify comparative evaluation endpoint (Assignment 1 vs Assignment 2)."""
    comp = client.get("/api/v1/evaluation/comparison").json()
    assert "assignment_1" in comp
    assert "assignment_2" in comp
    assert "comparison_metrics" in comp
    metrics = comp["comparison_metrics"]
    assert len(metrics) >= 5
    assert any(m["measure"] == "Cross-student privacy tests" for m in metrics)
    assert any(m["measure"] == "Unsafe-action human approval" for m in metrics)
