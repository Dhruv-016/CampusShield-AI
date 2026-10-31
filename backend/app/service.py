"""Chat orchestration: runs the graph, persists conversation + redacted trace. Always produces a trace."""
import logging
log = logging.getLogger("uvicorn.error")

import time
import uuid

from sqlalchemy import select

from . import llm
from .agent import build_graph
from .config import settings
from .models import Conversation, Message, Trace, iso, utcnow
from .safety import sanitize


def _token_info(state: dict) -> dict:
    calls, with_usage = state.get("llm_calls", 0), state.get("llm_calls_with_usage", 0)
    if calls == 0 or with_usage == 0:
        return {"input": None, "output": None, "total": None, "source": "unavailable"}
    return {"input": state.get("input_tokens"), "output": state.get("output_tokens"), "total": state.get("total_tokens"),
            "source": "provider" if with_usage == calls else "partial"}


def new_conversation(db, student_id: str, title: str = "New conversation") -> Conversation:
    c = Conversation(id="cv_" + uuid.uuid4().hex[:12], student_id=student_id, title=title)
    db.add(c)
    db.commit()
    return c


def run_chat(db, message: str, conversation_id: str | None = None, student_id: str | None = None,
             fault: str | None = None, use_llm: bool = True, conv_title: str | None = None) -> dict:
    t0 = time.perf_counter()
    student_id = student_id or settings.demo_student_id
    conv = db.get(Conversation, conversation_id) if conversation_id else None
    if conv is None:
        initial_title, _ = sanitize(message) if message else ("New conversation", [])
        conv = new_conversation(db, student_id, conv_title or (initial_title[:40] if initial_title else "New conversation"))
    trace_id = "tr_" + uuid.uuid4().hex[:12]
    state = {"request_id": trace_id, "conversation_id": conv.id, "student_id": student_id, "user_message": message,
             "use_llm": use_llm, "fault": fault, "t0": t0, "tool_calls": [], "events": [], "llm_calls": 0, "llm_calls_with_usage": 0,
             "redactions": [], "chunks": [], "memories": [], "context_meta": {}, "notices": []}
    try:
        out = build_graph(db).invoke(state)
    except Exception as e:  # noqa: BLE001
        log.exception("agent graph failed")
        out = dict(state, route="fallback", answer="Something went wrong on my side. Please try again.",
                   error_category="internal_error", fallback_used=True, provider_status="error",
                   events=state["events"] + [{"stage": "error", "t_ms": round((time.perf_counter() - t0) * 1000, 1), "detail": type(e).__name__}])
    latency = round((time.perf_counter() - t0) * 1000, 1)
    tokens = _token_info(out)
    live = out.get("provider_status") == "live_llm" or out.get("router_source") == "llm"
    clean = out.get("sanitized_message", "[unprocessed]")
    sources = [{"chunk_id": c["chunk_id"], "document_title": c["document_title"], "section_title": c["section_title"],
                "source_location": c["source_location"], "score": c["score"], "snippet": c["content"][:400]} for c in out.get("chunks", [])]
    mem_used = [{"id": m["id"], "content": m["content"]} for m in out.get("memories", [])] if out.get("route") != "memory" else []
    events = out.get("events", []) + [{"stage": "trace_persisted", "t_ms": latency, "detail": ""}]

    db.add_all([
        Message(conversation_id=conv.id, role="user", content=clean, trace_id=trace_id),  # redacted text only
        Message(
            conversation_id=conv.id,
            role="assistant",
            content=out.get("answer", ""),
            trace_id=trace_id,
            meta={
                "route": out.get("route"),
                "sources": sources,
                "tool_calls": out.get("tool_calls", []),
                "approval_request": out.get("approval_request"),
            },
        ),
    ])
    conv.updated_at = utcnow()
    db.add(Trace(
        id=trace_id, conversation_id=conv.id, student_id=student_id, route=out.get("route"), router_source=out.get("router_source"),
        status="error" if out.get("error_category") else "success", latency_ms=latency, tool_calls=out.get("tool_calls", []),
        chunk_ids=[c["chunk_id"] for c in out.get("chunks", [])], memory_ids=[m["id"] for m in mem_used],
        context=out.get("context_meta", {}), events=events, error_category=out.get("error_category"),
        fallback_used=bool(out.get("fallback_used")), provider_status=out.get("provider_status", "unknown"),
        model=settings.groq_model if live else None, retrieval_mode=out.get("retrieval_mode"),
        input_tokens=tokens["input"], output_tokens=tokens["output"], total_tokens=tokens["total"], token_source=tokens["source"],
        redacted_message=clean, redaction_categories=out.get("redactions", []),
        langsmith_status="configured (delivery not verified)" if settings.langsmith_enabled else "disabled"))
    db.commit()
    return {
        "answer": out.get("answer", ""), "conversation_id": conv.id, "trace_id": trace_id, "route": out.get("route"),
        "router_source": out.get("router_source"), "tool_calls": out.get("tool_calls", []), "sources": sources,
        "memory_used": mem_used, "memory_saved": out.get("memory_saved"), "notices": out.get("notices", []),
        "latency_ms": latency, "token_usage": tokens, "provider_status": out.get("provider_status"),
        "error_category": out.get("error_category"), "context_meta": out.get("context_meta", {}),
        "approval_request": out.get("approval_request"),
        "execution_summary": [e["detail"] for e in events if e["stage"] in ("tool_executed", "memory_saved", "memory_blocked", "clarification", "safe_fallback", "direct_answer", "sensitive_action_staged", "security_violation_blocked") and e["detail"]],
        "created_at": iso(utcnow()),
    }
