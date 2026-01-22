# Ollama Timeout Fix

## Issue
Antigravity insights timing out with error:
```
The operation was aborted due to timeout
```

## Root Cause
1. **Model not pulled** - `llama3.2:3b` hasn't been downloaded yet
2. **Cold start** - First request loads model into memory (slow)
3. **Timeout too short** - Was 120s, now increased to 300s

## Fixes Applied

### 1. Increased Timeout
**File**: `antigravity/engine/llm_router.ts`
- **Before**: 120 seconds
- **After**: 300 seconds (5 minutes)

### 2. Pull the Model
Run this command to download the model:

```powershell
ollama pull llama3.2:3b
```

**Expected output**:
```
pulling manifest
pulling 8934d96d3f08... 100% ▕████████████████▏ 2.0 GB
pulling 8c17c2ebb0ea... 100% ▕████████████████▏ 7.0 KB
pulling 7c23fb36d801... 100% ▕████████████████▏ 4.8 KB
pulling 2e0493f67d0c... 100% ▕████████████████▏   59 B
pulling fa8235e5b48f... 100% ▕████████████████▏  485 B
verifying sha256 digest
writing manifest
success
```

### 3. Warm Up the Model
After pulling, warm it up with a test query:

```powershell
ollama run llama3.2:3b "Say hello"
```

This loads the model into memory. Subsequent requests will be much faster!

## Verification Steps

### 1. Check if Model is Pulled
```powershell
ollama list
```

**Expected**: You should see `llama3.2:3b` in the list

### 2. Check Ollama Service
```powershell
curl http://localhost:11434/api/tags
```

**Expected**: JSON response with models list

### 3. Test Model Directly
```powershell
ollama run llama3.2:3b "What is 2+2?"
```

**Expected**: Model responds with "4" or similar

### 4. Restart Your App
```powershell
# Stop the app (Ctrl+C)
# Start it again
npm run dev
```

### 5. Try Antigravity Again
Visit your app and try generating insights for `STG_ACCOUNT`

## Expected Timeline

| Step | Time |
|------|------|
| Pull model | 2-5 minutes (depending on internet) |
| First warm-up | 10-30 seconds |
| Subsequent requests | 2-10 seconds |

## Troubleshooting

### Still Timing Out?

1. **Check model is loaded**:
   ```powershell
   ollama ps
   ```
   Should show `llama3.2:3b` if loaded

2. **Check system resources**:
   - RAM usage (should have 4GB+ free)
   - CPU usage
   - Disk space

3. **Try even smaller model**:
   ```powershell
   ollama pull llama3.2:1b
   ```
   Then update `.env.local`:
   ```
   OLLAMA_MODEL=llama3.2:1b
   ```

### Model Too Slow?

If `llama3.2:3b` is still too slow, use the tiny model:

```powershell
# Pull tiny model (~700MB)
ollama pull llama3.2:1b

# Set in environment
$env:OLLAMA_MODEL = "llama3.2:1b"

# Restart app
npm run dev
```

## Performance Tips

1. **Keep Ollama running** - Don't stop `ollama serve`
2. **Warm up before demos** - Run a test query first
3. **Use smaller prompts** - Less context = faster responses
4. **Monitor RAM** - Close other apps if needed

---

**Status**: Timeout increased to 300s  
**Next**: Pull model with `ollama pull llama3.2:3b`
