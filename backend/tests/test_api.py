"""Integration tests through the real FastAPI app + SQLite + LangGraph. No paid LLM calls."""
import json
import pytest
from fastapi.testclient import TestClient

from app import llm
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def chat(client, msg, cid=None):
    r = client.post("/api/v1/chat", json={"message": msg, "conversation_id": cid})
    assert r.status_code == 200, r.text
    return r.json()


def test_health(client):
    assert client.get("/api/v1/health").json()["status"] == "ok"


def test_status_hides_secrets(client):
    s = client.get("/api/v1/status").json()
    assert "groq_key" not in json.dumps(s).lower() and s["llm_configured"] is False


def test_fee_question_uses_tool(client):
    r = chat(client, "What is my current fee status?")
    assert r["route"] == "fee" and r["tool_calls"][0]["name"] == "get_fee_status" and "25,000" in r["answer"]
    assert r["provider_status"] == "limited_mode_no_llm" and r["token_usage"]["source"] == "unavailable"
    assert client.get(f"/api/v1/traces/{r['trace_id']}").json()["tool_calls"][0]["status"] == "ok"


def test_policy_question_returns_evidence(client):
    r = chat(client, "The payment portal failed. Can I pay on the next working day?")
    assert r["route"] == "policy" and r["sources"][0]["section_title"] == "Payment Portal Problems"


def test_calendar(client):
    r = chat(client, "What is the next academic event?")
    assert r["route"] == "calendar" and "Mid-semester" in r["answer"]


def test_unsupported_policy_no_invention(client):
    r = chat(client, "What is the hostel accommodation allotment policy?")
    assert r["route"] == "fallback" and r["sources"] == [] and "couldn't verify" in r["answer"]


def test_memory_persists_across_conversations_and_sensitive_excluded(client):
    client.delete("/api/v1/memories")
    saved = chat(client, "Remember that I prefer concise explanations.")
    assert saved["memory_saved"]["category"] == "response_style"
    r = chat(client, "What does the handbook say about fee deadlines?")  # new conversation
    assert r["memory_used"] and r["conversation_id"] != saved["conversation_id"]
    otp = chat(client, "My temporary OTP is 482913. Remember it for later.")
    assert "482913" not in otp["answer"] and otp["notices"]
    assert "482913" not in json.dumps(client.get("/api/v1/memories").json())
    assert "482913" not in json.dumps(client.get(f"/api/v1/traces/{otp['trace_id']}").json())
    assert "482913" not in json.dumps(client.get(f"/api/v1/conversations/{otp['conversation_id']}").json())


def test_memory_delete(client):
    mid = client.get("/api/v1/memories").json()[0]["id"]
    assert client.delete(f"/api/v1/memories/{mid}").status_code == 200
    assert client.delete(f"/api/v1/memories/{mid}").status_code == 404


def test_tool_failure_is_safe_and_traced(client):
    from app.db import SessionLocal
    from app.service import run_chat
    with SessionLocal() as db:
        r = run_chat(db, "What is my current fee status?", fault="tool_error")
        assert r["error_category"] == "tool_error" and "temporarily unavailable" in r["answer"]
    assert client.get(f"/api/v1/traces/{r['trace_id']}").json()["status"] == "error"


def test_validation(client):
    assert client.post("/api/v1/chat", json={"message": ""}).status_code == 422
    assert client.post("/api/v1/chat", json={"message": "x" * 1001}).status_code == 422


def test_mocked_llm_records_provider_tokens_and_rejects_ungrounded(client):
    def fake(messages, mt, temp):
        if "Classify" in messages[0]["content"]:
            return llm.LLMResult('{"route": "fee"}', 10, 5, 15)
        return llm.LLMResult("Your outstanding fee is INR 25,000.", 100, 20, 120)
    llm.set_override(fake)
    try:
        r = chat(client, "What is my current fee status?")
        assert r["provider_status"] == "live_llm" and r["token_usage"] == {"input": 110, "output": 25, "total": 135, "source": "provider"}
        llm.set_override(lambda m, a, b: llm.LLMResult("Your fee is INR 999.", None, None, None) if "Classify" not in m[0]["content"] else llm.LLMResult('{"route":"fee"}'))
        r = chat(client, "What is my current fee status?")
        assert r["provider_status"] == "llm_error_fallback" and "25,000" in r["answer"]
    finally:
        llm.set_override(None)


def test_evaluation_run_stores_real_results(client):
    out = client.post("/api/v1/evaluation/run", json={"mode": "local"}).json()
    s = out["summary"]
    assert s["executed"] == 10 and s["blocked"] == 0
    failed = [(r["case_id"], r["note"]) for r in out["results"] if r["status"] != "passed"]
    assert not failed, failed
    assert client.get("/api/v1/evaluation/results").json()["summary"]["executed"] == 10


def test_live_eval_blocked_without_key(client):
    out = client.post("/api/v1/evaluation/run", json={"mode": "live"}).json()
    assert out["summary"]["blocked"] == 10 and out["summary"]["passed"] == 0
