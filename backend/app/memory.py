from sqlalchemy import delete, select
from .models import Memory, iso


def to_dict(m: Memory) -> dict:
    return {"id": m.id, "category": m.category, "content": m.content, "enabled": m.enabled, "created_at": iso(m.created_at)}


def list_memories(db, student_id: str) -> list[dict]:
    return [to_dict(m) for m in db.scalars(select(Memory).where(Memory.student_id == student_id).order_by(Memory.created_at.desc()))]


def add_memory(db, student_id: str, category: str, content: str) -> tuple[dict, bool]:
    """Returns (memory, created). Duplicate content is not stored twice. Max 25 memories per student."""
    existing = db.scalars(select(Memory).where(Memory.student_id == student_id)).all()
    for m in existing:
        if m.content.strip().lower() == content.strip().lower():
            return to_dict(m), False
    if len(existing) >= 25:
        raise ValueError("memory_limit_reached")
    m = Memory(student_id=student_id, category=category, content=content.strip())
    db.add(m)
    db.commit()
    return to_dict(m), True


def delete_memory(db, student_id: str, memory_id: int) -> bool:
    res = db.execute(delete(Memory).where(Memory.id == memory_id, Memory.student_id == student_id))
    db.commit()
    return res.rowcount > 0


def clear_memories(db, student_id: str) -> int:
    res = db.execute(delete(Memory).where(Memory.student_id == student_id))
    db.commit()
    return res.rowcount
