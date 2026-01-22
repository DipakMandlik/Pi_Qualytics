# Quick Fix: Switch to Fastest Model

## Problem
`llama3.2:3b` is still too slow and timing out.

## Solution
Switch to **TinyLlama** - the fastest, smallest model.

## Steps

### 1. Pull TinyLlama
```powershell
ollama pull tinyllama
```

**Size**: Only ~637MB (vs 2GB for llama3.2:3b)  
**Speed**: 2-5x faster responses  
**Quality**: Good enough for structured data analysis

### 2. Restart Your App
```powershell
# Stop app (Ctrl+C)
npm run dev
```

### 3. Test
Try generating insights again - should be much faster!

## Performance Comparison

| Model | Size | Speed | Quality | Recommended |
|-------|------|-------|---------|-------------|
| **tinyllama** | **637MB** | **⚡⚡⚡ Very Fast** | **⭐⭐ Good** | **✅ YES (for now)** |
| llama3.2:1b | 700MB | ⚡⚡ Fast | ⭐⭐⭐ Better | If tinyllama too basic |
| llama3.2:3b | 2GB | ⚡ Slow | ⭐⭐⭐⭐ Great | If you have time/RAM |

## What Changed

**File**: `antigravity/engine/llm_router.ts`
- Default model: `llama3.2:3b` → `tinyllama`

## Expected Performance

- **First request**: 5-10 seconds
- **Subsequent**: 1-3 seconds
- **RAM usage**: ~1-2GB (vs 4GB+ for llama3.2:3b)

## Alternative: Disable Antigravity Temporarily

If even TinyLlama is too slow, you can disable Antigravity insights:

```typescript
// In .env.local
DISABLE_ANTIGRAVITY=true
```

Or just skip the insights feature for now and focus on the core DQ functionality.

---

**Run now**: `ollama pull tinyllama` then restart app
