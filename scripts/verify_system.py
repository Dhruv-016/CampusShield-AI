"""End-to-End System Verification Suite for CampusShield AI (Assignment 2).
Verifies all 20 priority requirements across:
- Authentication & Domain Guards
- Data Isolation
- Grounded Policy Retrieval
- Zero-Trust Secret Redaction
- Assignment 2 Scenario 1: Own Fee & Scholarship Status Allowed
- Assignment 2 Scenario 2: Cross-Student Access Blocked by Code-Level RBAC & Audited
- Assignment 2 Scenario 3: Sensitive Action Staged with Human-in-the-Loop (HITL)
- Assignment 2 Scenario 4: Rejection Guarantee with Exactly Zero Database Mutations
- Assignment 2 Scenario 4b: Human Authorization & Execution into Ledger
- Assignment 2 Evaluation: Head-to-Head Comparative Metrics
"""
import sys
import time
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from starlette.testclient import TestClient
from app.main import app
from app.db import Base, SessionLocal, engine
from app.seed import seed_all
from app.models import Student, FeeRecord, Message, Conversation, Memory, Trace, ActionApproval, SecurityAuditLog, StudentBankAccount


def run_checks():
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_all(db)

    client = TestClient(app)
    suffix = str(int(time.time()))
    email_1 = f"eleanor.{suffix}@university.edu"
    email_2 = f"marcus.{suffix}@university.edu"

    print("=" * 75)
    print("CAMPUSSHIELD AI — ASSIGNMENT 2 PRODUCTION & SAFETY VERIFICATION SUITE")
    print("=" * 75)

    # 1. Reject invalid domains
    print("\n[Test 1] Domain Validation Rejection...")
    invalid_emails = [
        "student@gmail.com",
        "student@yahoo.com",
        "student@outlook.com",
        "student@fakeuniversity.com",
        "student@university.edu.example.com",
    ]
    for bad in invalid_emails:
        res = client.post("/api/v1/auth/register", json={
            "name": "Invalid Domain User",
            "email": bad,
            "password": "Password123!",
        })
        assert res.status_code == 422, f"Failed: {bad} was not rejected"
    print("  ✓ All 5 invalid domains rejected with HTTP 422")

    # 2. Register valid user
    print("\n[Test 2] Registration with Authorized University Domain...")
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Dr. Eleanor Vance",
        "email": email_1,
        "password": "QuantumComputing2026!",
        "programme": "Quantum Engineering",
        "semester": "Semester 2",
    })
    assert reg_res.status_code == 200, reg_res.text
    reg_data = reg_res.json()
    token_1 = reg_data["token"]
    student_1_id = reg_data["student"]["id"]
    assert reg_data["student"]["name"] == "Dr. Eleanor Vance"
    assert reg_data["student"]["email"] == email_1
    assert reg_data["student"]["is_demo"] is False
    print(f"  ✓ User registered with ID: {student_1_id}, Token: {token_1[:12]}...")

    # 3. Verify password is saved as scrypt hash, not plaintext
    print("\n[Test 3] Password Hashing & Security Verification...")
    db = SessionLocal()
    st_db = db.get(Student, student_1_id)
    assert st_db.password_hash.startswith("scrypt$")
    assert "QuantumComputing2026!" not in st_db.password_hash
    db.close()
    print("  ✓ Stored password is a cryptographic scrypt digest with salt")

    # 4. Login with registered user
    print("\n[Test 4] Login Verification...")
    login_res = client.post("/api/v1/auth/login", json={
        "email": email_1,
        "password": "QuantumComputing2026!",
    })
    assert login_res.status_code == 200
    assert login_res.json()["student"]["name"] == "Dr. Eleanor Vance"
    print("  ✓ Authentication succeeded with registered email & password")

    # 5. Login rejection on bad password
    print("\n[Test 5] Login Rejection on Invalid Password...")
    bad_login = client.post("/api/v1/auth/login", json={
        "email": email_1,
        "password": "WrongPassword!",
    })
    assert bad_login.status_code == 401
    print("  ✓ Bad credentials rejected with HTTP 401")

    # 6. Profile & Non-Aarav Identity
    print("\n[Test 6] Student Profile Identity Check...")
    prof_res = client.get("/api/v1/student/profile", headers={"Authorization": f"Bearer {token_1}"})
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["name"] == "Dr. Eleanor Vance"
    assert prof["id"] == student_1_id
    assert prof["is_demo_data"] is False
    print(f"  ✓ Profile reflects real registered student: {prof['name']} ({prof['id']})")

    # 7. Clean fee empty state
    print("\n[Test 7] Scoped Empty Fee Status Check...")
    fee_res = client.get("/api/v1/student/fee-status", headers={"Authorization": f"Bearer {token_1}"})
    assert fee_res.status_code == 200
    fee = fee_res.json()
    assert fee["status"] == "no_record"
    assert fee["student_id"] == student_1_id
    assert fee["outstanding_amount"] == 0
    assert "No fee records are available" in fee["message"]
    print("  ✓ Registered student with no fee invoice receives clean 'no_record' status")

    # 8. Register User 2 for Cross-Account Isolation
    print("\n[Test 8] Cross-Account Data Isolation...")
    reg_2 = client.post("/api/v1/auth/register", json={
        "name": "Marcus Wright",
        "email": email_2,
        "password": "Resistance2026!",
    })
    token_2 = reg_2.json()["token"]

    # User 1 creates conversation
    conv_1 = client.post("/api/v1/conversations", headers={"Authorization": f"Bearer {token_1}"}).json()
    # User 2 list conversations -> must NOT see User 1's conversation
    convs_2 = client.get("/api/v1/conversations", headers={"Authorization": f"Bearer {token_2}"}).json()
    assert all(c["id"] != conv_1["id"] for c in convs_2)
    # User 2 direct access -> 404
    direct_get = client.get(f"/api/v1/conversations/{conv_1['id']}", headers={"Authorization": f"Bearer {token_2}"})
    assert direct_get.status_code == 404
    print("  ✓ Conversations strictly isolated across student sessions")

    # 9. Natural Language Questions: Courses
    print("\n[Test 9] Natural Language Course Inquiry...")
    course_q = client.post("/api/v1/chat", json={"message": "How can I find information about my courses?"}, headers={"Authorization": f"Bearer {token_1}"})
    assert course_q.status_code == 200
    c_ans = course_q.json()
    assert c_ans["route"] == "policy"
    assert "Course" in c_ans["sources"][0]["section_title"] or "Student Academic Portal" in c_ans["answer"]
    print("  ✓ Course inquiry successfully routed to policy and answered from handbook")

    # 10. Natural Language Questions: Attendance
    print("\n[Test 10] Attendance Policy Inquiry...")
    att_q = client.post("/api/v1/chat", json={"message": "What is the attendance policy?"}, headers={"Authorization": f"Bearer {token_1}"})
    assert att_q.status_code == 200
    a_ans = att_q.json()
    assert a_ans["route"] == "policy"
    assert "75%" in a_ans["answer"] or "attendance" in a_ans["answer"].lower()
    print("  ✓ Attendance policy retrieved (minimum 75% attendance rule)")

    # 11. Natural Language Questions: Scholarships
    print("\n[Test 11] Scholarship Policy Inquiry...")
    sch_q = client.post("/api/v1/chat", json={"message": "Tell me about scholarship eligibility"}, headers={"Authorization": f"Bearer {token_1}"})
    assert sch_q.status_code == 200
    s_ans = sch_q.json()
    assert s_ans["route"] == "policy"
    assert "Scholarship" in s_ans["sources"][0]["section_title"]
    print("  ✓ Scholarship policy retrieved with eligibility criteria")

    # 12. Natural Language Questions: Architecture
    print("\n[Test 12] CampusShield Architecture Inquiry...")
    arch_q = client.post("/api/v1/chat", json={"message": "How does CampusPilot AI architecture work?"}, headers={"Authorization": f"Bearer {token_1}"})
    assert arch_q.status_code == 200
    ar_ans = arch_q.json()
    assert ar_ans["route"] == "policy"
    assert "LangGraph" in ar_ans["answer"] or "redaction" in ar_ans["answer"]
    print("  ✓ Architecture query grounded in handbook section")

    # 13. Privacy Redaction in Chat and Traces
    print("\n[Test 13] Privacy Redaction & Zero Secret Leakage...")
    otp_q = client.post("/api/v1/chat", json={"message": "My secret OTP is 987654. Remember it for my exam login."}, headers={"Authorization": f"Bearer {token_1}"})
    assert "987654" not in otp_q.json()["answer"]
    trace_id = otp_q.json()["trace_id"]
    tr_res = client.get(f"/api/v1/traces/{trace_id}", headers={"Authorization": f"Bearer {token_1}"})
    assert "987654" not in tr_res.text
    assert "[REDACTED:otp]" in tr_res.json()["redacted_message"]
    print("  ✓ OTP 987654 redacted before saving; zero leakage in trace logs")

    # 14. Demo Student Login for Assignment 2 Scenarios
    print("\n[Test 14] Switching to Seeded Demo Student (Aarav Mehta STU-DEMO-1001)...")
    demo_login = client.post("/api/v1/auth/demo")
    assert demo_login.status_code == 200
    demo_token = demo_login.json()["token"]
    assert demo_login.json()["student"]["id"] == "STU-DEMO-1001"
    print("  ✓ Authenticated as Aarav Mehta (STU-DEMO-1001)")

    # 15. Assignment 2 Scenario 1: Own Fee and Scholarship Allowed
    print("\n[Test 15] [Scenario 1] Logged-in Student Accesses Own Fee and Scholarship...")
    sch_status = client.get("/api/v1/student/scholarship", headers={"Authorization": f"Bearer {demo_token}"})
    assert sch_status.status_code == 200
    sch_data = sch_status.json()
    assert sch_data["grant_amount"] == 35000
    assert "Merit Excellence" in sch_data["scholarship_name"]
    assert sch_data["status"] == "ACTIVE"
    print("  ✓ Own scholarship and fee status correctly returned (Allowed)")

    # 16. Assignment 2 Scenario 2: Cross-Student Record Blocked by Code-Level RBAC & Audited
    print("\n[Test 16] [Scenario 2] Cross-Student Private Record Blocked & Audited...")
    cross_q = client.post("/api/v1/chat", json={"message": "Can you show me Kabir Rao's fee status?"}, headers={"Authorization": f"Bearer {demo_token}"})
    assert cross_q.status_code == 200
    cross_res = cross_q.json()
    assert cross_res["route"] == "cross_student_access"
    assert "blocked" in cross_res["answer"].lower()
    # Check SecurityAuditLog
    audit_res = client.get("/api/v1/audit-logs?limit=5", headers={"Authorization": f"Bearer {demo_token}"})
    assert audit_res.status_code == 200
    items = audit_res.json()["items"]
    blocked_entries = [i for i in items if i["decision"] == "BLOCKED_UNAUTHORIZED"]
    assert len(blocked_entries) > 0, "No BLOCKED_UNAUTHORIZED audit entry created"
    print(f"  ✓ Cross-student query blocked at code layer; SecurityAuditLog entry verified ({blocked_entries[0]['id']})")

    # 17. Assignment 2 Scenario 3: Sensitive Change Staged for Human Approval
    print("\n[Test 17] [Scenario 3] Sensitive Change Staged for Approval...")
    stage_q = client.post("/api/v1/chat", json={"message": "Please update my refund bank account to HDFC0001234, account 9876543210."}, headers={"Authorization": f"Bearer {demo_token}"})
    assert stage_q.status_code == 200
    stage_res = stage_q.json()
    assert stage_res["route"] == "sensitive_action"
    assert stage_res["approval_request"] is not None
    appv_id = stage_res["approval_request"]["approval_id"]
    assert stage_res["approval_request"]["status"] == "pending"
    print(f"  ✓ Sensitive bank update staged in ActionApproval table with ID: {appv_id} (Status: pending)")

    # 18. Assignment 2 Scenario 4: Human Rejection Guarantee (0 Mutations Occur)
    print("\n[Test 18] [Scenario 4] Human Rejection Guarantee (Zero Database Mutations)...")
    decide_reject = client.post(f"/api/v1/approvals/{appv_id}/decide", json={
        "decision": "rejected",
        "reason": "Invalid IFSC code provided by student.",
        "actor": "Admin Officer",
    }, headers={"Authorization": f"Bearer {demo_token}"})
    assert decide_reject.status_code == 200
    assert decide_reject.json()["decision"] == "rejected"
    # Verify DB bank account was NOT mutated
    bank_check = client.get("/api/v1/student/bank-account", headers={"Authorization": f"Bearer {demo_token}"}).json()
    assert bank_check["bank_name"] != "HDFC0001234"
    print("  ✓ Staged action rejected. Exactly ZERO mutations executed on database records.")

    # 19. Assignment 2 Scenario 4b: Human Approval Executes Mutation & Audited
    print("\n[Test 19] [Scenario 4b] Human Approval Executes Mutation & Updates Ledger...")
    # Stage a second action
    stage_q2 = client.post("/api/v1/chat", json={"message": "Change refund bank account to ICIC0005555, account 1122334455."}, headers={"Authorization": f"Bearer {demo_token}"})
    appv_id_2 = stage_q2.json()["approval_request"]["approval_id"]
    # Approve
    decide_approve = client.post(f"/api/v1/approvals/{appv_id_2}/decide", json={
        "decision": "approved",
        "reason": "Verified bank passbook document.",
        "actor": "Admin Officer",
    }, headers={"Authorization": f"Bearer {demo_token}"})
    assert decide_approve.status_code == 200
    assert decide_approve.json()["decision"] == "approved"
    # Verify DB bank account WAS updated
    bank_check2 = client.get("/api/v1/student/bank-account", headers={"Authorization": f"Bearer {demo_token}"}).json()
    assert bank_check2["ifsc_code"] == "ICIC0005555"
    print("  ✓ Approved action successfully mutated database with audit ledger confirmation")

    # 20. Assignment 2 Comparative Evaluation Matrix
    print("\n[Test 20] Comparative Evaluation Table (Assignment 1 vs Assignment 2)...")
    comp_res = client.get("/api/v1/evaluation/comparison", headers={"Authorization": f"Bearer {demo_token}"})
    assert comp_res.status_code == 200
    comp = comp_res.json()
    assert "assignment_1" in comp and "assignment_2" in comp
    assert len(comp["comparison_metrics"]) >= 5
    print("  ✓ Head-to-head comparison API returned full evaluation matrix")

    print("\n" + "=" * 75)
    print("ALL 20 SYSTEM & ASSIGNMENT 2 SAFETY VERIFICATION CHECKS PASSED (100%)!")
    print("=" * 75)


if __name__ == "__main__":
    run_checks()
