# Quick Ollama Setup - Small Model

## ✅ What We Changed
Updated default model from `mixtral:8x7b` (26GB) to `llama3.2:3b` (~2GB)

## 🚀 Setup Steps

### 1. Pull the Small Model
```powershell
ollama pull llama3.2:3b
```
**Download size**: ~2GB (much faster!)

### 2. Verify Model is Downloaded
```powershell
ollama list
```
You should see `llama3.2:3b` in the list.

### 3. Test the Model
```powershell
ollama run llama3.2:3b "Say hello"
```

### 4. Start Your App
```powershell
npm run dev
```

## 🎯 Model Comparison

| Model | Size | Speed | Quality | Recommended For |
|-------|------|-------|---------|----------------|
| `llama3.2:1b` | ~700MB | ⚡⚡⚡ | ⭐⭐ | Testing only |
| **`llama3.2:3b`** | **~2GB** | **⚡⚡** | **⭐⭐⭐** | **Production (RECOMMENDED)** |
| `llama3:8b` | ~4.7GB | ⚡ | ⭐⭐⭐⭐ | High quality needed |
| `mixtral:8x7b` | ~26GB | 🐌 | ⭐⭐⭐⭐⭐ | Maximum quality |

## 🔧 Override Model (Optional)

You can override the model without changing code:

### Option 1: Environment Variable
```powershell
# Set in .env.local
OLLAMA_MODEL=llama3.2:1b
```

### Option 2: Command Line
```powershell
$env:OLLAMA_MODEL = "llama3.2:1b"
npm run dev
```

## ✅ Current Status

- ✅ Ollama installed (v0.14.2)
- ✅ Ollama service running (port 11434)
- ✅ Default model changed to `llama3.2:3b`
- ⏳ **Next**: Pull the model and test!

## 📝 Commands to Run Now

```powershell
# 1. Pull the model
ollama pull llama3.2:3b

# 2. Start your app
npm run dev

# 3. Test Antigravity at:
# http://localhost:3000
```

That's it! Much faster and lighter than the 26GB Mixtral model! 🎉
