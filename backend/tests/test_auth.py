import json
from starlette.testclient import TestClient
from app.main import app
from app.auth import verify_password


def test_registration_valid_and_stored():
    client = TestClient(app)
    # Register new student with official university domain
    reg_payload = {
        "name": "Sarah Connor",
        "email": "sarah.connor@university.edu",
        "password": "SecurePassword123!",
        "programme": "MSc Computer Science",
        "semester": "Semester 1",
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "ok"
    assert data["student"]["name"] == "Sarah Connor"
    assert data["student"]["email"] == "sarah.connor@university.edu"
    assert data["student"]["is_demo"] is False
    assert "token" in data
    token = data["token"]

    # Verify session profile via /auth/me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["authenticated"] is True
    assert me_data["student"]["name"] == "Sarah Connor"
    assert me_data["student"]["id"] == data["student"]["id"]


def test_registration_domain_validation_rejections():
    client = TestClient(app)
    bad_emails = [
        "student@gmail.com",
        "student@yahoo.com",
        "student@outlook.com",
        "student@fakeuniversity.com",
        "student@university.edu.example.com",
        "invalid-email",
        "@university.edu",
    ]
    for bad in bad_emails:
        payload = {
            "name": "Test Student",
            "email": bad,
            "password": "ValidPassword999!",
        }
        res = client.post("/api/v1/auth/register", json=payload)
        assert res.status_code == 422, f"Expected 422 for email: {bad}, got {res.status_code}"


def test_registration_allowed_subdomain():
    client = TestClient(app)
    payload = {
        "name": "Alex Vance",
        "email": "alex.vance@eng.university.edu",
        "password": "ValidPassword999!",
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 200, res.text
    assert res.json()["student"]["email"] == "alex.vance@eng.university.edu"


def test_password_security_and_hashing():
    client = TestClient(app)
    # Rejects short password
    short_res = client.post("/api/v1/auth/register", json={
        "name": "Short Pwd",
        "email": "short.pwd@university.edu",
        "password": "123",
    })
    assert short_res.status_code == 422

    # Verify that stored password in DB is scrypt hash, never plaintext
    from app.db import SessionLocal
    from app.models import Student
    db = SessionLocal()
    try:
        student = db.get(Student, "STU-DEMO-1001")
        # Now check registered student
        alex = client.post("/api/v1/auth/register", json={
            "name": "Hashed Student",
            "email": "hashed.pwd@university.edu",
            "password": "SuperSecretPassword123",
        }).json()
        db_student = db.get(Student, alex["student"]["id"])
        assert db_student.password_hash.startswith("scrypt$")
        assert "SuperSecretPassword123" not in db_student.password_hash
        assert verify_password("SuperSecretPassword123", db_student.password_hash) is True
        assert verify_password("WrongPassword", db_student.password_hash) is False
    finally:
        db.close()


def test_login_and_logout_lifecycle():
    client = TestClient(app)
    # Register
    client.post("/api/v1/auth/register", json={
        "name": "Lifecycle Student",
        "email": "lifecycle@university.edu",
        "password": "Password12345!",
    })

    # Login with wrong password
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "lifecycle@university.edu",
        "password": "IncorrectPassword",
    })
    assert bad_login.status_code == 401

    # Login with correct password
    login_res = client.post("/api/v1/auth/login", json={
        "email": "lifecycle@university.edu",
        "password": "Password12345!",
    })
    assert login_res.status_code == 200
    token = login_res.json()["token"]

    # Verify session active
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["authenticated"] is True

    # Logout
    logout_res = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200

    # Verify session invalidated
    me_after = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_after.json()["authenticated"] is False


def test_cross_account_isolation_and_empty_fee_state():
    client = TestClient(app)

    # 1. Register User A
    res_a = client.post("/api/v1/auth/register", json={
        "name": "User Alpha",
        "email": "alpha@university.edu",
        "password": "PasswordAlpha123!",
    })
    token_a = res_a.json()["token"]
    student_a_id = res_a.json()["student"]["id"]

    # 2. Register User B
    res_b = client.post("/api/v1/auth/register", json={
        "name": "User Beta",
        "email": "beta@university.edu",
        "password": "PasswordBeta123!",
    })
    token_b = res_b.json()["token"]
    student_b_id = res_b.json()["student"]["id"]

    # User A creates a conversation
    conv_a = client.post("/api/v1/conversations", headers={"Authorization": f"Bearer {token_a}"}).json()

    # User B should NOT see User A's conversation
    convs_b = client.get("/api/v1/conversations", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert all(c["id"] != conv_a["id"] for c in convs_b)

    # User B cannot access User A's conversation by ID
    forbidden_get = client.get(f"/api/v1/conversations/{conv_a['id']}", headers={"Authorization": f"Bearer {token_b}"})
    assert forbidden_get.status_code == 404

    # User A saves a memory preference
    client.post("/api/v1/memories", json={"content": "Please remember that I prefer bullet points"}, headers={"Authorization": f"Bearer {token_a}"})

    # User B should have 0 memories
    mems_b = client.get("/api/v1/memories", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert len(mems_b) == 0

    # User A checks fee status: User A has no fee invoice yet -> MUST return status: "no_record" (NOT 404 and NOT Aarav's fee)
    fee_a = client.get("/api/v1/student/fee-status", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert fee_a["status"] == "no_record"
    assert fee_a["student_id"] == student_a_id
    assert fee_a["student_name"] == "User Alpha"
    assert fee_a["outstanding_amount"] == 0
    assert "No fee records are available" in fee_a["message"]
