# Local setup
See README "Run (macOS)". Troubleshooting: `Cannot reach the backend` → start uvicorn from `backend/`; CORS errors → check `CORS_ORIGINS`; `llm_model_not_found` in a trace → set `GROQ_MODEL` to a model id available in your Groq console.
