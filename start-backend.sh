#!/bin/bash
set -e

echo "=========================================="
echo "Starting CampusPilot AI Backend..."
echo "=========================================="

cd "$(dirname "$0")/backend"

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment in backend/.venv..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt

echo "Running schema migrations and database checks..."
python -c "from app.db import ensure_schema, engine; ensure_schema(engine)"

echo "Starting Uvicorn server on http://localhost:8000..."
uvicorn app.main:app --reload --port 8000
