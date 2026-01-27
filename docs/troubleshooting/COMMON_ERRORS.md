# Common Errors and Solutions

## 🔴 Critical Errors

### 1. "Not connected to Snowflake"

**Error Message**:
```
Error: Not connected to Snowflake. Please connect first.
Status: 401
```

**Root Causes**:
- `.env` file missing or empty
- Environment variables not set correctly
- Server restarted (lost in-memory connection)
- Snowflake account/credentials invalid

**Solutions**:

**Option 1: Connect via UI**
1. Click "Connect to Snowflake" in the sidebar
2. Enter your credentials
3. Click "Connect"

**Option 2: Set environment variables**
```bash
# Create/edit .env
cp .env.example .env

# Fill in your Snowflake details
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password

# Restart server
npm run dev
```

**Option 3: Test connection**
```bash
# Check if connection is working
curl http://localhost:3000/api/snowflake/status

# Should return:
# {"success": true, "isConnected": true}
```

---

### 2. "Invalid account identifier" or "Connection failed"

**Error Message**:
```
Error: Invalid account identifier: [your-account]
or
Error: ECONNREFUSED
```

**Root Causes**:
- Wrong Snowflake account format
- Typo in account ID
- Network unreachable (firewall, VPN, offline)
- Snowflake service down

**Solutions**:

**1. Verify account format**:
```env
# Wrong formats
SNOWFLAKE_ACCOUNT=https://abc123def.us-east-1.snowflakecomputing.com
SNOWFLAKE_ACCOUNT=abc123def.snowflakecomputing.com

# Correct formats
SNOWFLAKE_ACCOUNT=abc123def
SNOWFLAKE_ACCOUNT=abc123def.us-east-1
```

**2. Find correct account ID**:
```
1. Log into Snowflake
2. Look at browser URL: https://abc123def.us-east-1.snowflakecomputing.com
3. Copy the subdomain: abc123def.us-east-1
4. Put in .env: SNOWFLAKE_ACCOUNT=abc123def.us-east-1
```

**3. Check network connectivity**:
```bash
# Test Snowflake connectivity
ping snowflake.com

# Test from command line
curl https://abc123def.us-east-1.snowflakecomputing.com

# If VPN required, make sure it's connected
```

---

### 3. "Incorrect username or password"

**Error Message**:
```
Error: Incorrect username or password
or
Error: Authentication failed
```

**Root Causes**:
- Wrong username or password
- Typo in .env
- Case sensitivity (Snowflake usernames are case-insensitive but passwords are case-sensitive)
- Account locked (too many failed attempts)

**Solutions**:

**1. Verify credentials manually**:
```
1. Go to: https://your-account.snowflakecomputing.com
2. Log in manually with same username/password
3. If login fails, reset password in Snowflake
```

**2. Check .env for typos**:
```bash
# Display env variables (hide password)
cat .env | grep SNOWFLAKE_

# Verify character-by-character in editor
# Watch for spaces, special characters
```

**3. Escape special characters**:
```env
# If password has special chars, may need escaping
SNOWFLAKE_PASSWORD="MyPassword!@#$%"

# Test by removing special chars first to isolate issue
```

**4. Reset password in Snowflake**:
```
1. Log into Snowflake as ACCOUNTADMIN
2. Go to Admin > Users
3. Find your user
4. Reset password
5. Update .env with new password
```

---

### 4. "Permission denied" or "access denied"

**Error Message**:
```
Error: Role '[ROLE]' does not have privileges to execute CALL on procedure
or
Error: User does not have access to [DATABASE/TABLE]
```

**Root Causes**:
- User doesn't have required role
- Role doesn't have required permissions
- Operating with wrong user account

**Solutions**:

**1. Check current role/user**:
```sql
-- In Snowflake SQL Editor
SELECT CURRENT_USER(), CURRENT_ROLE();
```

**2. Grant required privileges**:
```sql
-- As ACCOUNTADMIN, run:
GRANT USAGE ON DATABASE BANKING_DW TO ROLE [YOUR_ROLE];
GRANT USAGE ON DATABASE DATA_QUALITY_DB TO ROLE [YOUR_ROLE];
GRANT USAGE ON WAREHOUSE COMPUTE_WH TO ROLE [YOUR_ROLE];
GRANT SELECT ON ALL TABLES IN DATABASE BANKING_DW TO ROLE [YOUR_ROLE];
GRANT EXECUTE ON ALL PROCEDURES IN DATABASE DATA_QUALITY_DB TO ROLE [YOUR_ROLE];

-- Then grant role to user
GRANT ROLE [YOUR_ROLE] TO USER [YOUR_USER];
```

**3. Verify privileges**:
```sql
-- Check user's roles
SELECT * FROM INFORMATION_SCHEMA.ENABLED_ROLES 
WHERE GRANTEE_NAME = 'YOUR_USER';

-- Check role privileges
SHOW GRANTS ON DATABASE DATA_QUALITY_DB TO ROLE [YOUR_ROLE];
```

---

## ⚠️ Data-Related Errors

### 5. "Table does not exist"

**Error Message**:
```
Error: SQL compilation error: Object does not exist or not authorized: 'DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL'
```

**Root Causes**:
- Setup SQL scripts not executed
- Wrong database/schema name
- Typo in table name
- User doesn't have SELECT privilege

**Solutions**:

**1. Check if tables exist**:
```sql
-- In Snowflake SQL Editor
USE DATABASE DATA_QUALITY_DB;
SHOW TABLES IN SCHEMA DQ_METRICS;

-- Should list: DQ_RUN_CONTROL, DQ_CHECK_RESULTS, etc.
```

**2. Run setup scripts in order**:
```bash
cd sql/production/

# Execute all scripts in Snowflake SQL Editor
# 00_MASTER_SETUP.sql (contains CREATE DATABASE statements)
# 01_Environment_Setup.sql
# ... through ...
# 11_Observability_AI_Insights.sql
```

**3. Check table location**:
```sql
-- Find the actual location
SELECT TABLE_NAME, TABLE_SCHEMA, TABLE_CATALOG 
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%DQ_RUN%';
```

**4. Grant privileges**:
```sql
-- Allow user to read/write tables
GRANT SELECT, INSERT ON ALL TABLES IN DATABASE DATA_QUALITY_DB TO ROLE [YOUR_ROLE];
```

---

### 6. "No data found" or empty results

**Error Message**:
```
Dashboard shows "No data" or empty charts
or
API returns: {"success": true, "data": []}
```

**Root Causes**:
- No DQ scans have been run yet
- Scans ran but didn't store results
- Looking at wrong database/schema
- Date filter excludes the data

**Solutions**:

**1. Run your first scan**:
```
1. Go to Dashboard
2. Click "Run Scan" button
3. Wait 30-60 seconds
4. Refresh the page
5. Data should appear
```

**2. Check data exists**:
```sql
-- Check if any scans have been run
SELECT COUNT(*) FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL;

-- Check for recent checks
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_CHECK_RESULTS 
ORDER BY CHECK_TIMESTAMP DESC LIMIT 10;

-- Check daily summaries
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_DAILY_SUMMARY
WHERE SUMMARY_DATE >= CURRENT_DATE - 7
ORDER BY SUMMARY_DATE DESC;
```

**3. Verify scan configuration**:
```sql
-- Check if datasets are registered
SELECT * FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG LIMIT 5;

-- Check if rules exist
SELECT * FROM DATA_QUALITY_DB.DQ_CONFIG.DQ_RULES LIMIT 5;
```

**4. Check for scan errors**:
```sql
-- Look for failed scans
SELECT RUN_ID, RUN_STATUS, ERROR_MESSAGE 
FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL
WHERE RUN_STATUS = 'FAILED'
ORDER BY START_TS DESC LIMIT 5;
```

---

## 🤖 AI & LLM Errors

### 7. "Ollama not responding"

**Error Message**:
```
Error: Ollama call failed after 3 attempts
or
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Root Causes**:
- Ollama not installed
- Ollama service not running
- Wrong port configured
- Firewall blocking port 11434

**Solutions**:

**1. Verify Ollama is installed**:
```bash
# Check if installed
ollama --version

# If not installed, download from https://ollama.com/
```

**2. Start Ollama service**:
```bash
# Windows
ollama serve

# macOS/Linux
ollama serve  # or systemctl start ollama
```

**3. Verify it's running**:
```bash
# Test connection
curl http://localhost:11434/api/tags

# Should return JSON with available models
```

**4. Check port is correct**:
```env
# .env
OLLAMA_BASE_URL=http://localhost:11434

# If using different port:
OLLAMA_BASE_URL=http://localhost:5000  # Example
```

**5. Pull a model**:
```bash
# Download a model (first time only)
ollama pull mixtral:8x7b

# Or smaller models for faster response
ollama pull neural-chat:latest
ollama pull dolphin-mixtral:latest

# List available models
ollama list
```

---

### 8. "Gemini API key invalid"

**Error Message**:
```
Error: Invalid API key
or
Error: API key not found
or
401 Unauthorized
```

**Root Causes**:
- API key not set in .env
- Wrong API key
- API key has wrong permissions
- API key expired or revoked

**Solutions**:

**1. Get new API key**:
```
1. Visit: https://ai.google.dev/
2. Click "Get API Key"
3. Select or create a project
4. Generate new API key
5. Copy the full key
```

**2. Update .env**:
```env
# Paste full key (including AIzaSy... prefix)
GEMINI_API_KEY=AIzaSyD...the_full_key_from_google...

# Do NOT truncate or edit the key
```

**3. Restart application**:
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

**4. Verify key has correct permissions**:
```
1. Go to Google Cloud Console
2. Select your project
3. Go to APIs & Services
4. Check "Generative Language API" is enabled
5. Check API key restrictions aren't too strict
```

**5. Test API key**:
```bash
# Make a test request
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'

# Should return a response, not an error
```

---

## 🔧 Configuration Errors

### 9. "Environment variable missing"

**Error Message**:
```
❌ Missing required environment variable: SNOWFLAKE_ACCOUNT
or
⚠️ GEMINI_API_KEY not set
```

**Root Causes**:
- .env file not created
- Environment variable not in .env
- .env file not loaded

**Solutions**:

**1. Create .env file**:
```bash
# Copy example
cp .env.example .env

# Verify it was created
cat .env | head -5
```

**2. Add missing variables**:
```bash
# Open .env in your editor
nano .env  # or code .env

# Add the missing variable:
# SNOWFLAKE_ACCOUNT=your_value
```

**3. Verify .env is loaded**:
```bash
# Check application startup logs
npm run dev

# Should show: "✅ All required environment variables are configured"
```

**4. Check for shell/profile issues**:
```bash
# If using system environment (not .env file)
export SNOWFLAKE_ACCOUNT=your_value
export SNOWFLAKE_USER=your_user
export SNOWFLAKE_PASSWORD=your_password

# Then run app
npm run dev
```

---

### 10. "Port already in use"

**Error Message**:
```
Error: listen EADDRINUSE :::3000
or
Port 3000 is already in use
```

**Root Causes**:
- Another app using port 3000
- Previous npm dev process still running
- Multiple npm dev instances

**Solutions**:

**1. Use different port**:
```env
# .env
PORT=3001
# or
PORT=8080
```

**2. Kill existing process**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux
lsof -i :3000
kill -9 [PID]
```

**3. Restart from clean state**:
```bash
# Stop the app (Ctrl+C)
# Wait a few seconds
# Start again
npm run dev
```

---

## 📋 Debugging Checklist

When encountering an error:

- [ ] **Check error message carefully** - It usually contains the root cause
- [ ] **Check the logs** - Look at server console output
- [ ] **Verify .env file** - Run `cat .env | grep SNOWFLAKE_`
- [ ] **Test Snowflake connection** - Try login manually
- [ ] **Check network** - Verify internet and VPN connection
- [ ] **Restart the app** - `npm run dev` after fixes
- [ ] **Clear cache** - Delete `.next` folder, restart
- [ ] **Check permissions** - Verify user has required Snowflake roles
- [ ] **Review logs** - Check browser console for client-side errors
- [ ] **Check database** - Query tables directly in Snowflake

---

## Getting Help

If stuck:

1. **Search existing issues**: Check GitHub issues for similar problems
2. **Check documentation**: Review [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) and [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
3. **Collect debug info**:
   ```bash
   # Get version info
   node --version
   npm --version
   
   # Check Snowflake connectivity
   curl https://your-account.snowflakecomputing.com
   
   # Get app logs
   npm run dev 2>&1 | head -50
   ```
4. **Open an issue** on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment (Windows/Mac/Linux)
   - npm version
   - Node version
   - **Remove sensitive data** (passwords, API keys)

---

**Last Updated**: January 23, 2026  
**Status**: Comprehensive
