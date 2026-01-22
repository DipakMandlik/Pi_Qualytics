# ============================================================================
# OLLAMA DIAGNOSTIC SCRIPT
# ============================================================================
# This script helps diagnose Ollama installation and connectivity issues
# ============================================================================

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "OLLAMA DIAGNOSTIC SCRIPT" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check if Ollama is installed
Write-Host "[1/6] Checking if Ollama is installed..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "✓ Ollama is installed: $ollamaVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Ollama is NOT installed" -ForegroundColor Red
    Write-Host "   Download from: https://ollama.ai/download" -ForegroundColor Yellow
    Write-Host "   Or run: winget install Ollama.Ollama" -ForegroundColor Yellow
    exit 1
}

# 2. Check if Ollama service is running
Write-Host ""
Write-Host "[2/6] Checking if Ollama service is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Ollama service is running on port 11434" -ForegroundColor Green
}
catch {
    Write-Host "✗ Ollama service is NOT running" -ForegroundColor Red
    Write-Host "   Start it with: ollama serve" -ForegroundColor Yellow
    Write-Host "   Or run this script in a new terminal: Start-Process powershell -ArgumentList 'ollama serve'" -ForegroundColor Yellow
}

# 3. List installed models
Write-Host ""
Write-Host "[3/6] Checking installed models..." -ForegroundColor Yellow
try {
    $models = ollama list 2>&1
    Write-Host "Installed models:" -ForegroundColor Green
    Write-Host $models
}
catch {
    Write-Host "✗ Could not list models" -ForegroundColor Red
}

# 4. Check if recommended models are installed
Write-Host ""
Write-Host "[4/6] Checking for recommended models..." -ForegroundColor Yellow
$recommendedModels = @("mixtral:8x7b", "llama3:8b")
foreach ($model in $recommendedModels) {
    $installed = ollama list 2>&1 | Select-String -Pattern $model -Quiet
    if ($installed) {
        Write-Host "✓ $model is installed" -ForegroundColor Green
    }
    else {
        Write-Host "✗ $model is NOT installed" -ForegroundColor Yellow
        Write-Host "   Install with: ollama pull $model" -ForegroundColor Cyan
    }
}

# 5. Check environment variables
Write-Host ""
Write-Host "[5/6] Checking environment variables..." -ForegroundColor Yellow
$ollamaEndpoint = $env:OLLAMA_ENDPOINT
$ollamaModel = $env:OLLAMA_MODEL

if ($ollamaEndpoint) {
    Write-Host "✓ OLLAMA_ENDPOINT = $ollamaEndpoint" -ForegroundColor Green
}
else {
    Write-Host "⚠ OLLAMA_ENDPOINT not set (will use default: http://localhost:11434)" -ForegroundColor Yellow
}

if ($ollamaModel) {
    Write-Host "✓ OLLAMA_MODEL = $ollamaModel" -ForegroundColor Green
}
else {
    Write-Host "⚠ OLLAMA_MODEL not set (will use default from code)" -ForegroundColor Yellow
}

# 6. Test Ollama with a simple query
Write-Host ""
Write-Host "[6/6] Testing Ollama with a simple query..." -ForegroundColor Yellow
Write-Host "This may take a few seconds..." -ForegroundColor Gray

try {
    $testPrompt = "Say 'Hello' in one word"
    Write-Host "Sending test prompt: '$testPrompt'" -ForegroundColor Gray
    
    $response = ollama run llama3:8b "$testPrompt" 2>&1
    
    if ($response) {
        Write-Host "✓ Ollama responded successfully!" -ForegroundColor Green
        Write-Host "Response: $response" -ForegroundColor Cyan
    }
    else {
        Write-Host "✗ Ollama did not respond" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Failed to test Ollama" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If Ollama is not running, start it: ollama serve" -ForegroundColor White
Write-Host "2. If models are missing, install them: ollama pull mixtral:8x7b" -ForegroundColor White
Write-Host "3. Test your Next.js app: npm run dev" -ForegroundColor White
Write-Host "4. Check Antigravity health: http://localhost:3000/api/antigravity/health" -ForegroundColor White
Write-Host ""
