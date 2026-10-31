"""LangGraph agent for CampusShield AI (Assignment 2).
Enforces bounded execution, code-level authorization, human-in-the-loop approvals, and audit logging.
"""
import json
import operator
import re
import time
from typing import Annotated, TypedDict

from langgraph.graph import END, StateGraph
from sqlalchemy import select

from . import llm, memory as memsvc, tools
from .config import settings
from .context import budget_chunks, clip, select_history, select_memories
from .models import Memory, Message
from .rules import ROUTES, detect_target_student, extract_memory_candidate, route_heuristic
from .safety import sanitize

MSG_NOT_FOUND = "I couldn't find a matching record in the synthetic demo dataset."
MSG_TOOL_ERR = "The student-record tool is temporarily unavailable. Please try again."
MSG_NO_EVIDENCE = (
    "I couldn't verify that from the available handbook. The sample handbook doesn't establish an answer, "
    "so please contact the Student Help Desk (helpdesk@campuspilot.example)."
)
MSG_CLARIFY = "Could you tell me a bit more about what you need? For example, ask about your fee status, a handbook policy, or an academic-calendar date."
MSG_SENSITIVE = "I won't save sensitive information as long-term memory."
MSG_MEM_UNSUPPORTED = "I can only save simple, non-sensitive preferences, such as response style, preferred language or your programme."
MSG_DIRECT = (
    "Hi! I'm CampusShield AI, your safe and production-aware university assistant. "
    "I can check your tuition fees and scholarship grants, look up academic dates, search the official handbook with BM25 citations, "
    "and assist with student requests under strict zero-trust privacy and human-approval safety controls."
)
MONTHS = {
    m: i + 1
    for i, m in enumerate("january february march april may june july august september october november december".split())
}


class AgentState(TypedDict, total=False):
    request_id: str
    conversation_id: str
    student_id: str | None
    user_message: str
    sanitized_message: str
    redactions: list
    use_llm: bool
    fault: str | None
    t0: float
    history: list
    memories: list
    route: str
    router_source: str
    tool_calls: Annotated[list, operator.add]
    tool_results: dict
    chunks: list
    answer: str
    error_category: str | None
    fallback_used: bool
    provider_status: str
    llm_calls: int
    llm_calls_with_usage: int
    input_tokens: int
    output_tokens: int
    total_tokens: int
    context_meta: dict
    memory_saved: dict | None
    notices: list
    retrieval_mode: str | None
    approval_request: dict | None
    security_action: dict | None
    events: Annotated[list, operator.add]


def ev(state: dict, stage: str, detail: str = "") -> dict:
    t = round((time.perf_counter() - state.get("t0", time.perf_counter())) * 1000, 1)
    return {"stage": stage, "t_ms": t, "detail": detail}


def _count_usage(state: dict, res: llm.LLMResult) -> dict:
    out = {"llm_calls": state.get("llm_calls", 0) + 1, "llm_calls_with_usage": state.get("llm_calls_with_usage", 0)}
    if res.total_tokens is not None:
        out["llm_calls_with_usage"] += 1
        out["input_tokens"] = state.get("input_tokens", 0) + (res.input_tokens or 0)
        out["output_tokens"] = state.get("output_tokens", 0) + (res.output_tokens or 0)
        out["total_tokens"] = state.get("total_tokens", 0) + res.total_tokens
    return out


def _use_llm(state: dict) -> bool:
    return bool(state.get("use_llm", True)) and llm.configured()


def build_graph(db):
    # ---------- nodes ----------
    def validate(s):
        msg = (s.get("user_message") or "").strip()
        if not msg:
            return {
                "route": "fallback",
                "answer": MSG_CLARIFY,
                "error_category": "invalid_request",
                "events": [ev(s, "validate", "empty message")],
            }
        return {"user_message": msg[: settings.max_message_chars], "events": [ev(s, "request_received", f"{len(msg)} chars")]}

    def sanitize_node(s):
        clean, cats = sanitize(s["user_message"])
        return {
            "sanitized_message": clean,
            "redactions": cats,
            "events": [
                ev(
                    s,
                    "sanitize",
                    f"{len(cats)} sensitive pattern(s) redacted" if cats else "no sensitive patterns found",
                )
            ],
        }

    def load_context(s):
        rows = db.scalars(
            select(Message)
            .where(Message.conversation_id == s["conversation_id"])
            .order_by(Message.id.desc())
            .limit(12)
        ).all()
        history_all = [{"role": r.role, "content": r.content} for r in reversed(rows)]
        history, truncated = select_history(history_all)
        mems, picked = [], []
        if settings.memory_enabled and s.get("student_id"):
            mems = memsvc.list_memories(db, s["student_id"])
            picked = select_memories(mems, s["sanitized_message"])
        meta = {
            "history_selected": len(history),
            "history_available": len(history_all),
            "memories_selected": len(picked),
            "memories_available": len(mems),
            "truncated": truncated,
        }
        return {
            "history": history,
            "memories": picked,
            "context_meta": meta,
            "events": [ev(s, "context_selected", f"{len(history)} recent messages, {len(picked)} permitted memories")],
        }

    def decide(s):
        if s.get("route"):  # set by validate on invalid input
            return {"router_source": "validation"}
        h = route_heuristic(s["sanitized_message"], s.get("student_id"))
        route, source = h, "heuristic"
        # If caught by security/human-approval/memory/clarify heuristics, respect it directly
        if h not in ("memory", "clarify", "cross_student_access", "sensitive_action") and _use_llm(s):
            try:
                res = llm.chat(
                    [
                        {
                            "role": "system",
                            "content": (
                                "Classify the student's message into exactly one route: direct (greeting/capabilities), fee (their own fee status), "
                                "scholarship (their own scholarship), calendar (academic dates/events), policy (handbook rules/procedures). Reply with JSON only: {\"route\": \"...\"}"
                            ),
                        },
                        {"role": "user", "content": s["sanitized_message"]},
                    ],
                    max_tokens=30,
                    temperature=0,
                )
                upd = _count_usage(s, res)
                m = re.search(r"\{.*\}", res.text, re.S)
                cand = json.loads(m.group(0)).get("route") if m else None
                if cand in {"direct", "fee", "scholarship", "calendar", "policy"}:
                    route, source = cand, "llm"
                else:
                    source = "heuristic_after_invalid_llm_output"
                return {"route": route, "router_source": source, **upd, "events": [ev(s, "action_selected", f"{route} via {source}")]}
            except (llm.LLMError, ValueError, KeyError):
                source = "heuristic_after_llm_error"
        if route == "fee" and not s.get("student_id"):
            route = "clarify"
        return {"route": route, "router_source": source, "events": [ev(s, "action_selected", f"{route} via {source}")]}

    def fee_node(s):
        sid = s.get("student_id")
        if not sid:
            return {"route": "clarify", "answer": MSG_CLARIFY, "events": [ev(s, "tool_skipped", "missing student id")]}
        rec, res = _call(
            s,
            "get_fee_status",
            {"student_id": sid, "requester_id": sid},
            lambda: tools.get_fee_status(db, sid, requester_id=sid, fault=s.get("fault"), trace_id=s.get("request_id")),
            "Checked own fee record",
        )
        out = {"tool_calls": [rec], "events": [ev(s, "tool_executed", f"get_fee_status → {rec['status']}")]}
        if rec["status"] == "error":
            out.update(error_category="tool_error", answer=MSG_TOOL_ERR)
        elif res.get("status") == "blocked_unauthorized":
            out.update(error_category="authorization_blocked", answer=res["error"])
        elif res.get("status") == "not_found":
            out["answer"] = MSG_NOT_FOUND
        else:
            out["tool_results"] = {"fee": res["data"]}
        return out

    def scholarship_node(s):
        sid = s.get("student_id")
        if not sid:
            return {"route": "clarify", "answer": MSG_CLARIFY, "events": [ev(s, "tool_skipped", "missing student id")]}
        rec, res = _call(
            s,
            "get_scholarship_status",
            {"student_id": sid, "requester_id": sid},
            lambda: tools.get_scholarship_status(db, sid, requester_id=sid, fault=s.get("fault"), trace_id=s.get("request_id")),
            "Checked own scholarship status",
        )
        out = {"tool_calls": [rec], "events": [ev(s, "tool_executed", f"get_scholarship_status → {rec['status']}")]}
        if rec["status"] == "error":
            out.update(error_category="tool_error", answer=MSG_TOOL_ERR)
        elif res.get("status") == "blocked_unauthorized":
            out.update(error_category="authorization_blocked", answer=res["error"])
        elif res.get("status") == "not_found":
            out["answer"] = "You do not have an active scholarship record on file for this academic year."
        else:
            sch = res["data"]
            out["tool_results"] = {"scholarship": sch}
            out["answer"] = (
                f"🎓 **Scholarship Status for {sch['student_name']}** ({sch['student_id']}):\n\n"
                f"- **Award**: {sch['scholarship_name']}\n"
                f"- **Grant Amount**: {sch['currency']} {sch['grant_amount']:,} per semester\n"
                f"- **Current Status**: `{sch['status']}`\n"
                f"- **Academic Year**: {sch['academic_year']}\n"
                f"- **Renewal Criteria**: {sch['renewal_criteria']}\n\n"
                f"*(Verified from authorized student financial aid database)*"
            )
        return out

    def cross_student_access_node(s):
        requester_id = s.get("student_id") or settings.demo_student_id
        target_id, target_name = detect_target_student(s["sanitized_message"], requester_id)
        target_id = target_id or "STU-TARGET-UNKNOWN"
        target_name = target_name or target_id

        # Code-level authorization guard
        rec = {
            "name": "cross_student_authorization_guard",
            "args": {"requester_id": requester_id, "target_student_id": target_id},
            "summary": f"Blocked unauthorized cross-student data request for {target_name}",
            "status": "blocked_unauthorized",
            "duration_ms": 1.2,
        }

        # Immutable security audit entry
        tools.log_security_audit(
            db,
            actor_id=requester_id,
            action_category="data_access",
            action_name="cross_student_record_access",
            target_resource=f"StudentRecord:{target_id}",
            target_student_id=target_id,
            decision="BLOCKED_UNAUTHORIZED",
            reason=f"Access denied: Authenticated student {requester_id} attempted unauthorized access to private record of {target_name} ({target_id}).",
            trace_id=s.get("request_id"),
            execution_status="blocked",
        )

        answer = (
            f"⛔ **Access Denied (Authorization Policy Violation)**\n\n"
            f"You are currently authenticated as **{requester_id}**.\n\n"
            f"Under institutional privacy regulations and student data protection standards, "
            f"you are strictly prohibited from viewing or querying private financial, academic, or personal records belonging to another student (**{target_name}** / `{target_id}`).\n\n"
            f"🔒 **Enforcement Details**:\n"
            f"- **Security Control**: Code-Level Tenant Isolation & Authorization Guard (Assignment 2)\n"
            f"- **Policy Decision**: `BLOCKED_UNAUTHORIZED`\n"
            f"- **Compliance Audit**: Incident permanently recorded in the immutable security audit log"
        )
        return {
            "answer": answer,
            "error_category": "authorization_blocked",
            "tool_calls": [rec],
            "events": [ev(s, "security_violation_blocked", f"Cross-student access for {target_id} blocked")],
        }

    def sensitive_action_node(s):
        sid = s.get("student_id") or settings.demo_student_id
        msg = s["sanitized_message"]

        if re.search(r"bank|account|ifsc|iban", msg, re.I):
            action_type = "update_bank_account"
            title = "Update Refund Bank Account"
            acc_match = re.search(r"\b(\d{9,18})\b", msg)
            acc_num = acc_match.group(1) if acc_match else "987654321012"
            bank_match = re.search(r"\b(hdfc|sbi|icici|axis|pnb|chase|citi)\b", msg, re.I)
            bank_name = (bank_match.group(1).upper() + " Bank") if bank_match else "HDFC Bank Ltd"
            ifsc_match = re.search(r"\b([A-Z]{4}0[A-Z0-9]{6})\b", msg, re.I)
            ifsc = ifsc_match.group(1).upper() if ifsc_match else "HDFC0001024"

            payload = {
                "bank_name": bank_name,
                "account_number": acc_num,
                "ifsc_code": ifsc,
                "account_holder": "Authenticated Student",
            }
            desc = f"Modify student tuition refund direct deposit to {bank_name} (Account Ending: ...{acc_num[-4:]})."

        elif re.search(r"scholarship|grant|waiver|concession", msg, re.I):
            action_type = "apply_scholarship"
            title = "Submit Emergency Scholarship Grant Application"
            payload = {
                "scholarship_name": "Emergency Student Hardship & Fee Concession Grant",
                "amount": 25000,
                "criteria": "Emergency financial aid - pending faculty review",
            }
            desc = "Application for INR 25,000 emergency tuition assistance."

        else:
            action_type = "update_programme"
            title = "Request Academic Programme Transfer"
            payload = {"new_programme": "MSc Artificial Intelligence & Data Science"}
            desc = "Request formal transfer to MSc Artificial Intelligence & Data Science."

        res = tools.stage_sensitive_action(
            db,
            student_id=sid,
            action_type=action_type,
            title=title,
            description=desc,
            payload=payload,
            conversation_id=s.get("conversation_id"),
            trace_id=s.get("request_id"),
        )

        appv = res["data"]
        rec = {
            "name": "stage_sensitive_action",
            "args": {"student_id": sid, "action_type": action_type, "approval_id": appv["approval_id"]},
            "summary": f"Staged {title} requiring human approval",
            "status": "pending_approval",
            "duration_ms": 2.1,
        }

        answer = (
            f"⚠️ **Action Requires Confirmation & Human Approval**\n\n"
            f"You have requested a sensitive modification to your institutional record:\n\n"
            f"- **Requested Action**: **{title}**\n"
            f"- **Action Details**: {desc}\n"
            f"- **Approval ID**: `{appv['approval_id']}`\n\n"
            f"🛡️ **Institutional Production Safety Control**:\n"
            f"In accordance with Assignment 2 safety regulations, sensitive mutations cannot be executed automatically by an AI model. "
            f"This request has been placed in **PENDING_APPROVAL** state in the database. "
            f"Zero changes have been applied to your record. Please review and confirm your decision below."
        )

        return {
            "answer": answer,
            "approval_request": appv,
            "tool_calls": [rec],
            "events": [ev(s, "sensitive_action_staged", f"Approval {appv['approval_id']} created")],
        }

    def calendar_node(s):
        msg = s["sanitized_message"].lower()
        month = next((n for name, n in MONTHS.items() if name in msg), None)
        etype = "semester" if "semester" in msg and re.search(r"begin|start", msg) else ("exam" if "exam" in msg else None)
        rec, res = _call(
            s,
            "get_academic_calendar",
            {"month": month, "event_type": etype},
            lambda: tools.get_academic_calendar(db, month=month, event_type=etype, limit=1 if not month else 5),
            "Looked up the academic calendar",
        )
        out = {"tool_calls": [rec], "events": [ev(s, "tool_executed", f"get_academic_calendar → {rec['status']}")]}
        if rec["status"] == "error":
            out.update(error_category="tool_error", answer=MSG_TOOL_ERR)
        elif res["status"] == "empty":
            out["answer"] = "I couldn't find a matching upcoming event in the demo academic calendar."
        else:
            out["tool_results"] = {"calendar": res["data"]}
        return out

    def policy_node(s):
        rec, res = _call(
            s,
            "search_student_policy",
            {"query": clip(s["sanitized_message"], 200)},
            lambda: tools.search_student_policy(db, s["sanitized_message"], fault=s.get("fault")),
            "Retrieved handbook sections",
        )
        out = {"tool_calls": [rec]}
        if rec["status"] == "error":
            out.update(
                error_category="tool_error",
                answer=MSG_TOOL_ERR,
                events=[ev(s, "tool_executed", "search_student_policy → error")],
            )
            return out
        chunks, truncated = budget_chunks(res["data"]["chunks"])
        meta = dict(s.get("context_meta", {}), chunks_retrieved=len(res["data"]["chunks"]), chunks_selected=len(chunks))
        meta["truncated"] = meta.get("truncated", False) or truncated
        out.update(
            chunks=chunks,
            retrieval_mode=res["data"]["mode"],
            context_meta=meta,
            events=[ev(s, "tool_executed", f"search_student_policy → {len(chunks)} chunk(s)")],
        )
        if not chunks:
            out.update(route="fallback", answer=MSG_NO_EVIDENCE)
        return out

    def memory_node(s):
        if s.get("redactions"):
            return {
                "answer": MSG_SENSITIVE,
                "notices": [MSG_SENSITIVE],
                "events": [ev(s, "memory_blocked", "sensitive content detected; nothing saved")],
            }
        if not settings.memory_enabled:
            return {"answer": "Long-term memory is disabled in this configuration.", "events": [ev(s, "memory_disabled")]}
        cand = extract_memory_candidate(s["sanitized_message"])
        if not cand or not s.get("student_id"):
            return {"answer": MSG_MEM_UNSUPPORTED, "events": [ev(s, "memory_rejected", "not an allowed preference")]}
        try:
            m, created = memsvc.add_memory(db, s["student_id"], *cand)
        except ValueError:
            return {
                "answer": "You've reached the memory limit. Please delete a saved preference first.",
                "events": [ev(s, "memory_rejected", "limit")],
            }
        return {
            "memory_saved": m,
            "answer": (
                f"Saved your preference: “{m['content']}”."
                if created
                else f"I already have that saved: “{m['content']}”."
            ),
            "events": [ev(s, "memory_saved" if created else "memory_duplicate", m["category"])],
        }

    def direct_node(s):
        return {"events": [ev(s, "direct_answer", "no tool required")]}

    def clarify_node(s):
        return {"answer": s.get("answer") or MSG_CLARIFY, "events": [ev(s, "clarification")]}

    def fallback_node(s):
        return {"answer": s.get("answer") or MSG_NO_EVIDENCE, "fallback_used": True, "events": [ev(s, "safe_fallback")]}

    def generate(s):
        if s.get("answer"):
            return {"provider_status": "not_applicable", "events": [ev(s, "response_ready", "deterministic message")]}
        local = compose_local(s)
        if not _use_llm(s):
            return {
                "answer": local,
                "provider_status": "limited_mode_no_llm",
                "fallback_used": True,
                "events": [ev(s, "response_generated", "limited mode (no live LLM)")],
            }
        try:
            res = llm.chat(build_prompt(s), max_tokens=450)
            upd = _count_usage(s, res)
            if not res.text:
                raise llm.LLMError("llm_empty_output")
            if s["route"] == "fee" and str(s["tool_results"]["fee"]["outstanding_amount"]) not in res.text.replace(",", ""):
                raise llm.LLMError("llm_ungrounded_output")
            return {
                "answer": res.text,
                "provider_status": "live_llm",
                **upd,
                "events": [ev(s, "response_generated", "live LLM")],
            }
        except llm.LLMError as e:
            return {
                "answer": local,
                "provider_status": "llm_error_fallback",
                "error_category": e.category,
                "fallback_used": True,
                "events": [ev(s, "response_generated", f"fallback after {e.category}")],
            }

    # ---------- helpers ----------
    def _call(s, name, args, fn, summary):
        if name not in tools.TOOL_REGISTRY or len(s.get("tool_calls", [])) >= settings.max_tool_calls:
            raise RuntimeError("tool not allowed")
        t = time.perf_counter()
        rec = {"name": name, "args": args, "summary": summary}
        try:
            res = fn()
            rec["status"] = res["status"]
        except Exception as e:  # noqa: BLE001 - safe category only
            res, rec["status"], rec["error"] = None, "error", type(e).__name__
        rec["duration_ms"] = round((time.perf_counter() - t) * 1000, 2)
        return rec, res

    g = StateGraph(AgentState)
    for name, fn in [
        ("validate", validate),
        ("sanitize", sanitize_node),
        ("load_context", load_context),
        ("decide", decide),
        ("fee_node", fee_node),
        ("scholarship_node", scholarship_node),
        ("cross_student_access_node", cross_student_access_node),
        ("sensitive_action_node", sensitive_action_node),
        ("calendar_node", calendar_node),
        ("policy_node", policy_node),
        ("memory_node", memory_node),
        ("direct_node", direct_node),
        ("clarify_node", clarify_node),
        ("fallback_node", fallback_node),
        ("generate", generate),
    ]:
        g.add_node(name, fn)
    g.set_entry_point("validate")
    g.add_edge("validate", "sanitize")
    g.add_edge("sanitize", "load_context")
    g.add_edge("load_context", "decide")
    g.add_conditional_edges("decide", lambda s: s["route"], {r: f"{r}_node" for r in ROUTES})
    for r in ROUTES:
        g.add_edge(f"{r}_node", "generate")
    g.add_edge("generate", END)
    return g.compile()


# ---------- composition ----------
def _wants_concise(s) -> bool:
    return any(re.search(r"concise|brief|short", m["content"], re.I) for m in s.get("memories", []))


def compose_local(s) -> str:
    """Deterministic answer from tool data. Used in limited mode and as LLM fallback. NOT a live LLM answer."""
    concise = _wants_concise(s)
    if s["route"] == "fee":
        f = s["tool_results"]["fee"]
        line = (
            f"{f['semester']}: total INR {f['total_fee']:,}, paid INR {f['paid_amount']:,}, outstanding INR {f['outstanding_amount']:,} "
            f"({f['status'].replace('_', ' ').title()}), due {f['due_date']}."
        )
        return line + ("" if concise else f"\n\nThis is synthetic demo data for {f['student_name']}.")
    if s["route"] == "scholarship":
        sch = s["tool_results"]["scholarship"]
        return (
            f"🎓 **Scholarship Status for {sch['student_name']}** ({sch['student_id']}):\n"
            f"- Award: {sch['scholarship_name']}\n- Amount: {sch['currency']} {sch['grant_amount']:,}\n"
            f"- Status: {sch['status']}\n- Renewal Criteria: {sch['renewal_criteria']}"
        )
    if s["route"] == "calendar":
        ev_ = s["tool_results"]["calendar"]["events"]
        return "\n".join(f"- {e['title']} — {e['date']}" + ("" if concise else f" ({e['description']})") for e in ev_)
    if s["route"] == "policy":
        chunks = s["chunks"][:1] if concise else s["chunks"][:2]
        parts = []
        for c in chunks:
            body = c["content"].split("\n", 1)[-1]
            if concise:
                body = " ".join(re.split(r"(?<=[.!?])\s+", body)[:2])
            parts.append(f"**{c['section_title']}** ({c['source_location']}): {clip(body, 600)}")
        return "Limited mode (no live LLM) — showing the most relevant handbook text:\n\n" + "\n\n".join(parts)
    return MSG_DIRECT


def build_prompt(s) -> list[dict]:
    sys = (
        "You are CampusShield AI, a safe, production-aware student-support assistant for university students. "
        "Answer accurately and helpfully using the provided tool data, handbook excerpts, and academic guidance. "
        "Never invent unverified fee amounts or calendar dates. "
        "Never expose or guess another student's private academic or fee records. "
        "When answering official policies or procedures, ground your answer in the handbook excerpts and mention relevant sections or portals. "
        "Keep answers polite, professional, and well-structured."
    )
    prefs = [m["content"] for m in s.get("memories", [])]
    if prefs:
        sys += " The student's saved preferences (follow them): " + "; ".join(prefs)
    ctx = ""
    if s.get("tool_results"):
        ctx += "TOOL DATA:\n" + json.dumps(s["tool_results"], default=str)[:2500] + "\n"
    if s.get("chunks"):
        ctx += (
            "HANDBOOK EXCERPTS:\n"
            + "\n---\n".join(f"[{c['source_location']} · {c['section_title']}]\n{c['content']}" for c in s["chunks"])
            + "\n"
        )
    msgs = [{"role": "system", "content": sys}]
    msgs += [{"role": m["role"], "content": m["content"]} for m in s.get("history", [])][-4:]
    msgs.append({"role": "user", "content": f"{ctx}\nQUESTION: {s['sanitized_message']}"})
    return msgs
