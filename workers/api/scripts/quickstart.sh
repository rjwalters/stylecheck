#!/bin/bash
# VibeCov API Quick Start Script
#
# Sets up the development environment with one command
# Usage: ./scripts/quickstart.sh [github-token]

set -e

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$API_DIR"

echo "🚀 VibeCov API Quick Start"
echo ""

# Check if GitHub token provided
GITHUB_TOKEN="$1"
if [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️  No GitHub token provided"
  echo "Usage: ./scripts/quickstart.sh <github-token>"
  echo ""
  echo "To create a GitHub Personal Access Token:"
  echo "1. Go to https://github.com/settings/tokens"
  echo "2. Click 'Generate new token (classic)'"
  echo "3. Select scopes: read:user, user:email"
  echo "4. Copy the token and run this script again"
  echo ""
  exit 1
fi

# Step 1: Install dependencies
echo "1️⃣  Installing dependencies..."
pnpm install
echo "   ✅ Dependencies installed"
echo ""

# Step 2: Start the API server in the background
echo "2️⃣  Starting API server..."
pnpm dev > /tmp/vibecov-api.log 2>&1 &
API_PID=$!
echo "   ✅ API server started (PID: $API_PID)"
echo "   📝 Logs: /tmp/vibecov-api.log"
echo ""

# Wait for server to be ready
echo "3️⃣  Waiting for API server to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:8787/ > /dev/null 2>&1; then
    echo "   ✅ API server is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "   ❌ API server failed to start"
    kill $API_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done
echo ""

# Step 4: Authenticate with CLI
echo "4️⃣  Authenticating with GitHub token..."
pnpm cli login "$GITHUB_TOKEN"
echo ""

# Step 5: Seed database
echo "5️⃣  Seeding database..."
pnpm cli seed
echo ""

# Step 6: Check status
echo "6️⃣  Checking status..."
pnpm cli me
echo ""

echo "✅ Quick start complete!"
echo ""
echo "📌 What's next?"
echo ""
echo "   • API server is running at http://localhost:8787"
echo "   • Session saved to .vibecov-session"
echo "   • Database seeded with test data"
echo ""
echo "   Try these commands:"
echo "   - pnpm cli me              # Check current user"
echo "   - pnpm cli request GET /   # Make API request"
echo "   - pnpm dev                 # Restart API server (if needed)"
echo "   - kill $API_PID             # Stop API server"
echo ""
echo "   Or run the examples:"
echo "   - pnpm tsx examples/client-usage.ts    # Client library example"
echo "   - pnpm tsx examples/test-fixtures.ts   # Test fixtures example"
echo ""
