# Terminal Troubleshooting Guide

## Issue: Terminal Not Working

### Common Causes & Solutions

#### 1. **PowerShell Execution Policy**
**Symptom**: Scripts won't run, "cannot be loaded because running scripts is disabled"

**Fix**:
```powershell
# Check current policy
Get-ExecutionPolicy

# Set to allow scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. **Ollama Command Not Found**
**Symptom**: `ollama : The term 'ollama' is not recognized`

**Fix**:
```powershell
# Option 1: Install Ollama
winget install Ollama.Ollama

# Option 2: Download manually
# Visit: https://ollama.ai/download

# Option 3: Add to PATH (if already installed)
$env:PATH += ";C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama"
```

#### 3. **Port 11434 Already in Use**
**Symptom**: `bind: address already in use`

**Fix**:
```powershell
# Find process using port 11434
netstat -ano | findstr :11434

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Then restart Ollama
ollama serve
```

#### 4. **Ollama Service Won't Start**
**Symptom**: `ollama serve` command hangs or fails

**Fix**:
```powershell
# Stop any running Ollama processes
Get-Process ollama -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear Ollama cache (if needed)
Remove-Item -Path "$env:USERPROFILE\.ollama\*" -Recurse -Force -ErrorAction SilentlyContinue

# Restart Ollama
ollama serve
```

#### 5. **Node/NPM Commands Not Working**
**Symptom**: `npm : The term 'npm' is not recognized`

**Fix**:
```powershell
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
# Or install via winget
winget install OpenJS.NodeJS

# Restart terminal after installation
```

#### 6. **Terminal Freezes/Hangs**
**Symptom**: Terminal becomes unresponsive

**Fix**:
- Press `Ctrl+C` to cancel current command
- Close and reopen terminal
- Use Task Manager to kill PowerShell process if needed

---

## Quick Diagnostic Steps

### Step 1: Run Diagnostic Script
```powershell
# Navigate to project directory
cd "C:\Users\Dipak.Mandlik\OneDrive - PibyThree Consulting Services Private Limited\Desktop\Pi-Qualytics-main"

# Run diagnostic
.\scripts\diagnose-ollama.ps1
```

### Step 2: Check Ollama Status
```powershell
# Test if Ollama is accessible
curl http://localhost:11434/api/tags

# Should return JSON with models list
```

### Step 3: Start Ollama (if not running)
```powershell
# Option 1: Start in current terminal (blocks terminal)
ollama serve

# Option 2: Start in background (new window)
Start-Process powershell -ArgumentList "ollama serve"

# Option 3: Start as Windows service (if installed)
net start ollama
```

### Step 4: Pull Required Model
```powershell
# Pull Llama3 (faster, smaller - 4.7GB)
ollama pull llama3:8b

# OR pull Mixtral (better quality - 26GB)
ollama pull mixtral:8x7b
```

### Step 5: Test Ollama
```powershell
# Simple test
ollama run llama3:8b "Say hello"

# Should respond with a greeting
```

---

## Specific Error Messages

### Error: "Ollama is not available"
**Cause**: Ollama service not running or not accessible

**Solution**:
1. Start Ollama: `ollama serve`
2. Verify it's running: `curl http://localhost:11434/api/tags`
3. Check firewall isn't blocking port 11434

### Error: "Model not found"
**Cause**: Required model not pulled

**Solution**:
```powershell
# List installed models
ollama list

# Pull missing model
ollama pull llama3:8b
```

### Error: "Connection refused"
**Cause**: Ollama not listening on expected port

**Solution**:
1. Check if Ollama is running: `Get-Process ollama`
2. Verify port: `netstat -ano | findstr :11434`
3. Restart Ollama service

---

## Environment Setup

### Set Environment Variables (Optional)
```powershell
# Set Ollama endpoint (if using non-default)
$env:OLLAMA_ENDPOINT = "http://localhost:11434"

# Set default model
$env:OLLAMA_MODEL = "llama3:8b"

# Make permanent (add to PowerShell profile)
Add-Content $PROFILE "`n`$env:OLLAMA_ENDPOINT = 'http://localhost:11434'"
Add-Content $PROFILE "`$env:OLLAMA_MODEL = 'llama3:8b'"
```

---

## Still Having Issues?

### Check System Requirements
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8GB minimum (16GB recommended for Mixtral)
- **Disk**: 10GB free space minimum
- **GPU**: Optional (NVIDIA GPU with CUDA for faster inference)

### Enable Detailed Logging
```powershell
# Run Ollama with debug logging
$env:OLLAMA_DEBUG = "1"
ollama serve
```

### Alternative: Use Docker
If native installation fails, try Docker:
```powershell
# Pull Ollama Docker image
docker pull ollama/ollama

# Run Ollama in Docker
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull model in Docker
docker exec -it ollama ollama pull llama3:8b
```

---

## Contact Points

If all else fails:
1. Check Ollama documentation: https://github.com/ollama/ollama
2. Check project's `CRITICAL_SNOWFLAKE_SUSPENDED.md` for known issues
3. Review `demo_safety_checklist.md` for pre-demo verification steps

---

**Last Updated**: 2026-01-21  
**Status**: Ready for troubleshooting
