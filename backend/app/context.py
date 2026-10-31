"""Bounded, explainable context selection. Pure functions; no I/O."""
from .retrieval import tokenize


def select_history(messages: list[dict], max_messages: int = 6, max_chars: int = 1500) -> tuple[list[dict], bool]:
    """Most recent messages, newest kept first, within a character budget. Returns (chronological list, truncated)."""
    picked, used = [], 0
    for m in reversed(messages):
        if len(picked) >= max_messages or used + len(m["content"]) > max_chars:
            break
        picked.append(m)
        used += len(m["content"])
    return list(reversed(picked)), len(picked) < len(messages)


def select_memories(memories: list[dict], query: str, limit: int = 3) -> list[dict]:
    """Style/language preferences always apply; others only if they share a term with the query."""
    q = set(tokenize(query))
    scored = []
    for m in memories:
        if not m.get("enabled", True):
            continue
        overlap = len(q & set(tokenize(m["content"])))
        always = m["category"] in ("response_style", "language")
        if always or overlap:
            scored.append((1 if always else 0, overlap, m))
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return [m for _, _, m in scored[:limit]]


def budget_chunks(chunks: list[dict], max_chars: int = 2500) -> tuple[list[dict], bool]:
    out, used = [], 0
    for c in chunks:
        if used + len(c["content"]) > max_chars:
            return out, True
        out.append(c)
        used += len(c["content"])
    return out, False


def clip(text: str, limit: int = 1500) -> str:
    return text if len(text) <= limit else text[:limit] + "…"
