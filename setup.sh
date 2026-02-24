#!/bin/bash
# DialogFlow AI - Setup Script

echo "🚀 Setting up DialogFlow AI..."

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate venv
echo "✓ Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
playwright install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure LM Studio is running on http://localhost:1234"
echo "2. Run: source .venv/bin/activate"
echo "3. Frontend is at: http://localhost:3000"
echo ""
