#!/bin/bash

# ============================================================================
# Pre-Demo Warmup Script
# Run this 5 minutes before demo to ensure everything is ready
# ============================================================================

echo "🚀 Antigravity Pre-Demo Warmup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# ============================================================================
# 1. Check Ollama Service
# ============================================================================
echo "📡 Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Ollama is running"
else
    echo -e "${RED}✗${NC} Ollama is NOT running"
    echo "   Start it with: ollama serve"
    FAILURES=$((FAILURES + 1))
fi

# Check if model is loaded
echo "🤖 Checking Ollama model..."
MODEL_CHECK=$(curl -s http://localhost:11434/api/tags | grep -o "mixtral\|llama3" | head -1)
if [ -n "$MODEL_CHECK" ]; then
    echo -e "${GREEN}✓${NC} Model loaded: $MODEL_CHECK"
else
    echo -e "${RED}✗${NC} No model loaded"
    echo "   Pull a model: ollama pull mixtral:8x7b"
    FAILURES=$((FAILURES + 1))
fi

# ============================================================================
# 2. Check Application
# ============================================================================
echo "🌐 Checking application health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/antigravity/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} Application is healthy"
else
    echo -e "${RED}✗${NC} Application health check failed"
    echo "   Response: $HEALTH_RESPONSE"
    FAILURES=$((FAILURES + 1))
fi

# ============================================================================
# 3. Warm up Ollama (First query is always slower)
# ============================================================================
echo "🔥 Warming up Ollama model..."
WARMUP_START=$(date +%s)
curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mixtral:8x7b",
    "prompt": "Respond with OK",
    "stream": false
  }' > /dev/null 2>&1

WARMUP_END=$(date +%s)
WARMUP_TIME=$((WARMUP_END - WARMUP_START))

if [ $WARMUP_TIME -lt 30 ]; then
    echo -e "${GREEN}✓${NC} Model warmed up (${WARMUP_TIME}s)"
else
    echo -e "${YELLOW}⚠${NC} Model warmup slow (${WARMUP_TIME}s) - first demo query may be slow"
fi

# ============================================================================
# 4. Check Snowflake Connection (if configured)
# ============================================================================
echo "❄️  Checking Snowflake connection..."
if [ -f .env.local ] && grep -q "SNOWFLAKE_ACCOUNT" .env.local; then
    echo -e "${GREEN}✓${NC} Snowflake credentials configured"
    echo "   Note: Cannot test connection without running app query"
else
    echo -e "${YELLOW}⚠${NC} Snowflake credentials not found in .env.local"
    echo "   Make sure to configure before demo"
fi

# ============================================================================
# 5. Check System Resources
# ============================================================================
echo "💻 Checking system resources..."

# Check available memory (Linux/Mac)
if command -v free > /dev/null 2>&1; then
    AVAILABLE_MEM=$(free -g | awk '/^Mem:/{print $7}')
    if [ "$AVAILABLE_MEM" -gt 8 ]; then
        echo -e "${GREEN}✓${NC} Sufficient memory available (${AVAILABLE_MEM}GB free)"
    else
        echo -e "${YELLOW}⚠${NC} Low memory (${AVAILABLE_MEM}GB free) - may cause slow responses"
    fi
fi

# Check disk space
DISK_FREE=$(df -h . | awk 'NR==2 {print $4}')
echo "   Disk space available: $DISK_FREE"

# ============================================================================
# 6. Test End-to-End Flow (Optional but recommended)
# ============================================================================
echo "🧪 Testing end-to-end flow..."
echo "   Skipping (would take 20-30 seconds)"
echo "   Manually test by asking a question in the UI"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "================================"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for demo${NC}"
    echo ""
    echo "Recommended demo questions:"
    echo "  1. What is the current quality score?"
    echo "  2. How has quality changed over the last week?"
    echo "  3. Are there any anomalies detected?"
else
    echo -e "${RED}❌ $FAILURES check(s) failed${NC}"
    echo ""
    echo "Fix the issues above before demo"
    exit 1
fi

echo ""
echo "Pro tips:"
echo "  - Keep this terminal open to monitor for issues"
echo "  - Have 'docker-compose logs -f' ready in another terminal"
echo "  - Bookmark http://localhost:3000/api/antigravity/health"
echo ""
