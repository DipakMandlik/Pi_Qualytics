# Disable Antigravity AI (Temporary)

## Issue
- TinyLlama: Too fast but hallucinates (makes up columns)
- Llama3.2:3b: Accurate but too slow (timeouts)
- System resources: Not enough for larger models

## Solution: Disable AI Features Temporarily

### Option 1: Environment Variable (Recommended)

Create/edit `.env.local`:

```bash
# Disable Antigravity AI features
DISABLE_ANTIGRAVITY=true
```

Then restart:
```powershell
npm run dev
```

### Option 2: Use Mock/Fallback Mode

The app should gracefully handle Ollama failures and show:
- ✅ Core DQ features still work
- ✅ Profiling still works
- ✅ Custom scans still work
- ❌ AI insights temporarily unavailable

## What Still Works

All core functionality works without AI:
- ✅ Dataset profiling
- ✅ Custom rule execution  
- ✅ Scheduling
- ✅ Quality scores
- ✅ Dashboards
- ✅ Anomaly detection (rule-based)

## What Doesn't Work

Only AI-powered features affected:
- ❌ Natural language questions ("When was this table last updated?")
- ❌ AI-generated insights
- ❌ Automated root cause analysis

## When to Re-enable

Re-enable Antigravity when you have:
1. **Better hardware** (16GB+ RAM, faster CPU)
2. **Cloud deployment** (with GPU support)
3. **API access** (Gemini, OpenAI, etc.)

## Alternative: Use Gemini API

If you have a Gemini API key, you can use that instead:

```bash
# In .env.local
GEMINI_API_KEY=your_api_key_here
USE_GEMINI=true
```

This will use Google's cloud API instead of local Ollama.

## Summary

**For now**: Focus on core DQ features (profiling, custom scans, scheduling)  
**Later**: Add AI when you have better resources or cloud deployment

---

**Recommendation**: Disable Antigravity for now, focus on robust DQ system we built today!
