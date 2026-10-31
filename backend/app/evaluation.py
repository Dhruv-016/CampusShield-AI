import json
import statistics
from collections import Counter, defaultdict

from sqlalchemy import select

from . import llm, memory as memsvc
from .config import settings
from .models import EvalResult, EvalRun, Memory, Message, Trace, iso
from .scoring import score_case
from .service import run_chat


def load_cases() -> list[dict]:
    with open(settings.eval_cases_path, encoding="utf-8") as f:
        return json.load(f)


def _leak_sources(db, value: str, answer: str, trace: Trace) -> list[str]:
    hits = []
    if value in (answer or ""):
        hits.append("answer")
    if value in json.dumps({"m": trace.redacted_message, "e": trace.events, "t": trace.tool_calls, "c": trace.context}, default=str):
        hits.append("trace")
    if any(value in m.content for m in db.scalars(select(Memory))):
        hits.append("memory")
    if trace.conversation_id:
        msgs = db.scalars(select(Message).where(Message.conversation_id == trace.conversation_id)).all()
        if any(value in m.content for m in msgs):
            hits.append("messages")
    return hits


def run_evaluation(db, mode: str = "local") -> EvalRun:
    """mode='local': deterministic, no LLM calls. mode='live': uses the configured provider; cases are BLOCKED if it is not configured."""
    cases = load_cases()
    run = EvalRun(mode=mode, total=len(cases))
    db.add(run)
    db.commit()
    live = mode == "live"
    mem_before = {m["id"] for m in memsvc.list_memories(db, settings.demo_student_id)}
    blocked = live and not llm.configured()
    for case in cases:
        res = EvalResult(run_id=run.id, case_id=case["case_id"], name=case["name"], category=case["category"],
                         expected_route=case.get("expected_route"), expected_tool=case.get("expected_tool"))
        if blocked:
            res.status, res.note = "blocked", "Live mode requested but GROQ_API_KEY/GROQ_MODEL are not configured. Not run."
            db.add(res)
            continue
        steps = case.get("steps") or [{"user_message": case["user_message"]}]
        out = None
        for st in steps:  # every step starts a NEW conversation
            out = run_chat(db, st["user_message"], None, case.get("student_id"), case.get("fault"), use_llm=live, conv_title="[eval] " + case["name"])
        trace = db.get(Trace, out["trace_id"])
        leaked = _leak_sources(db, case["forbid_value"], out["answer"], trace) if case.get("forbid_value") else []
        outcome = {"route": out["route"], "tools": [t["name"] for t in out["tool_calls"]], "answer": out["answer"],
                   "sections": [s["section_title"] for s in out["sources"]], "chunk_ids": [s["chunk_id"] for s in out["sources"]],
                   "memory_ids": [m["id"] for m in out["memory_used"]], "error_category": out["error_category"],
                   "tool_status": out["tool_calls"][0]["status"] if out["tool_calls"] else None, "leaked": leaked}
        ok, note = score_case(case, outcome)
        res.actual_route, res.actual_tools, res.status = out["route"], outcome["tools"], "passed" if ok else "failed"
        res.latency_ms, res.total_tokens, res.trace_id, res.evidence_ids, res.note = out["latency_ms"], out["token_usage"]["total"], out["trace_id"], outcome["chunk_ids"], note
        db.add(res)
    # remove memories created only by the evaluation so real user memory is not polluted
    for m in memsvc.list_memories(db, settings.demo_student_id):
        if m["id"] not in mem_before:
            memsvc.delete_memory(db, settings.demo_student_id, m["id"])
    results = db.scalars(select(EvalResult).where(EvalResult.run_id == run.id)).all()
    run.passed = sum(r.status == "passed" for r in results)
    run.failed = sum(r.status == "failed" for r in results)
    run.blocked = sum(r.status == "blocked" for r in results)
    db.commit()
    return run


def summarize(db, run_id: int | None = None) -> dict:
    run = db.get(EvalRun, run_id) if run_id else db.scalars(select(EvalRun).order_by(EvalRun.id.desc())).first()
    if not run:
        return {"run": None, "results": [], "summary": None}
    rs = db.scalars(select(EvalResult).where(EvalResult.run_id == run.id).order_by(EvalResult.case_id)).all()
    executed = [r for r in rs if r.status != "blocked"]
    lat = [r.latency_ms for r in executed if r.latency_ms is not None]
    tok = [r.total_tokens for r in executed if r.total_tokens is not None]
    by_cat = defaultdict(lambda: {"passed": 0, "failed": 0})
    for r in executed:
        by_cat[r.category]["passed" if r.status == "passed" else "failed"] += 1
    tools = Counter(t for r in executed for t in (r.actual_tools or []))
    tool_cases = [r for r in executed if r.expected_tool is not None]
    summary = {
        "total_cases": len(rs), "executed": len(executed), "passed": run.passed, "failed": run.failed, "blocked": run.blocked,
        "success_rate": round(100 * run.passed / len(executed), 1) if executed else None,
        "avg_latency_ms": round(statistics.mean(lat), 1) if lat else None,
        "median_latency_ms": round(statistics.median(lat), 1) if lat else None,
        "tool_selection_accuracy": round(100 * sum(r.expected_tool in (r.actual_tools or []) for r in tool_cases) / len(tool_cases), 1) if tool_cases else None,
        "token_total": sum(tok) if tok else None, "token_cases": len(tok),
        "by_category": [{"category": k, **v} for k, v in by_cat.items()],
        "tool_usage": [{"tool": k, "count": v} for k, v in tools.items()],
    }
    return {"run": {"id": run.id, "mode": run.mode, "started_at": iso(run.started_at)}, "summary": summary,
            "results": [{"case_id": r.case_id, "name": r.name, "category": r.category, "expected_route": r.expected_route, "actual_route": r.actual_route,
                         "expected_tool": r.expected_tool, "actual_tools": r.actual_tools, "status": r.status, "latency_ms": r.latency_ms,
                         "total_tokens": r.total_tokens, "trace_id": r.trace_id, "evidence_ids": r.evidence_ids, "note": r.note} for r in rs]}
