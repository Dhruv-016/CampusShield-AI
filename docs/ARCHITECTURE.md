# Architecture
Frontend (Next.js, port 3000) calls FastAPI (`/api/v1`, port 8000). `api.py` routes → `service.run_chat` → LangGraph (`agent.py`) → tools (`tools.py`) / retriever (`retrieval_service.py`) / memory (`memory.py`) / optional Groq (`llm.py`). SQLAlchemy models in `models.py` (SQLite default). Traces, messages, memories, eval runs are all persisted.
