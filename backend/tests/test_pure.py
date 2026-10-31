"""Dependency-free tests (no FastAPI/DB needed)."""
from pathlib import Path
from app.context import budget_chunks, select_history, select_memories
from app.retrieval import Retriever, chunk_markdown
from app.rules import extract_memory_candidate, route_heuristic
from app.safety import is_sensitive, sanitize
from app.scoring import score_case

HB = (Path(__file__).resolve().parents[2] / "data" / "sample_student_handbook.md").read_text()
R = Retriever(chunk_markdown(HB, "h", "Handbook"))


def test_chunking_keeps_headings():
    ch = chunk_markdown(HB, "h", "Handbook")
    assert len(ch) == 9 and ch[2]["section_title"] == "Payment Portal Problems" and ch[2]["content"].startswith("Payment Portal Problems")
    assert len({c["chunk_id"] for c in ch}) == len(ch)


def test_portal_query_retrieves_portal_section():
    hits = R.search("The payment portal failed. Can I pay on the next working day?")
    assert hits[0]["section_title"] == "Payment Portal Problems" and hits[0]["score"] > 0


def test_deadline_query():
    assert R.search("What does the handbook say about fee deadlines?")[0]["section_title"] == "Fee Payment Deadlines"


def test_unanswerable_returns_nothing():
    assert R.search("What is the hostel accommodation allotment policy?") == []
    assert R.search("What is the parking policy?") == []


def test_sanitize_otp_password_key_card():
    t, c = sanitize("My temporary OTP is 482913. Remember it for later.")
    assert "482913" not in t and c == ["otp"]
    assert is_sensitive("my password is hunter2") and is_sensitive("key gsk_abcdefghijklmnop")
    assert is_sensitive("card 4111 1111 1111 1111") and not is_sensitive("I prefer concise answers")


def test_memory_candidates():
    assert extract_memory_candidate("Remember that I prefer concise explanations.")[0] == "response_style"
    assert extract_memory_candidate("Remember that my cat is Tom") is None


def test_routing():
    sid = "STU-DEMO-1001"
    assert route_heuristic("What is my current fee status?", sid) == "fee"
    assert route_heuristic("What is my current fee status?", None) == "clarify"
    assert route_heuristic("The payment portal failed. Can I pay on the next working day?", sid) == "policy"
    assert route_heuristic("What is the next academic event?", sid) == "calendar"
    assert route_heuristic("Hello, what can you help me with?", sid) == "direct"
    assert route_heuristic("Remember that I prefer concise explanations.", sid) == "memory"


def test_context_bounds():
    msgs = [{"role": "user", "content": "x" * 400} for _ in range(10)]
    picked, truncated = select_history(msgs, max_messages=6, max_chars=1500)
    assert len(picked) == 3 and truncated
    mems = [{"id": 1, "category": "response_style", "content": "prefers concise", "enabled": True},
            {"id": 2, "category": "programme", "content": "studies robotics", "enabled": True}]
    assert [m["id"] for m in select_memories(mems, "explain fee deadline")] == [1]
    assert budget_chunks([{"content": "a" * 2000}, {"content": "b" * 2000}])[1] is True


def test_scoring_detects_failure():
    case = {"expected_route": "fee", "expected_tool": "get_fee_status", "must_contain": ["25,000"]}
    bad = {"route": "direct", "tools": [], "answer": "hi", "sections": [], "memory_ids": [], "chunk_ids": [], "error_category": None}
    ok, note = score_case(case, bad)
    assert not ok and "route" in note and "tool" in note
    good = dict(bad, route="fee", tools=["get_fee_status"], answer="outstanding INR 25,000")
    assert score_case(case, good)[0]
