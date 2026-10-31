"""Ingestion + cached retriever. Replace the handbook by changing HANDBOOK path and re-running ingest."""
import threading
from pathlib import Path
from sqlalchemy import select, delete
from .config import settings
from .models import PolicyChunk, PolicyDocument, utcnow
from .retrieval import Retriever, chunk_markdown

_lock = threading.Lock()
_retriever: Retriever | None = None
DOC_ID = "handbook-1"


def ingest_handbook(db, path: str | None = None) -> dict:
    global _retriever
    text = Path(path or settings.handbook_path).read_text(encoding="utf-8")
    title = next((l[2:].strip() for l in text.splitlines() if l.startswith("# ")), "Handbook")
    chunks = chunk_markdown(text, DOC_ID, title)
    db.execute(delete(PolicyChunk).where(PolicyChunk.document_id == DOC_ID))
    doc = db.get(PolicyDocument, DOC_ID) or PolicyDocument(id=DOC_ID, title=title)
    doc.title, doc.status, doc.ingested_at, doc.chunk_count = title, "indexed", utcnow(), len(chunks)
    db.merge(doc)
    db.flush()
    db.add_all([PolicyChunk(**c) for c in chunks])
    db.commit()
    with _lock:
        _retriever = None
    return {"document_id": DOC_ID, "title": title, "chunks": len(chunks)}


def get_retriever(db) -> Retriever:
    global _retriever
    with _lock:
        if _retriever is None:
            rows = db.scalars(select(PolicyChunk).order_by(PolicyChunk.chunk_index)).all()
            _retriever = Retriever([{
                "chunk_id": r.chunk_id, "document_id": r.document_id, "document_title": r.document_title,
                "section_title": r.section_title, "content": r.content,
                "source_location": r.source_location, "chunk_index": r.chunk_index} for r in rows])
        return _retriever
