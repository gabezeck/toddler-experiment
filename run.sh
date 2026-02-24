#!/bin/bash
# DialogFlow AI - Run Script

echo "🚀 Starting DialogFlow AI..."

# Check if venv is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "✓ Activating virtual environment..."
    source .venv/bin/activate
fi

# Start frontend
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd frontend && pnpm run dev
