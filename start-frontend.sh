#!/bin/bash
set -e

echo "=========================================="
echo "Starting CampusPilot AI Frontend..."
echo "=========================================="

cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies with npm..."
    npm install
fi

echo "Starting Next.js development server on http://localhost:3000..."
npm run dev
