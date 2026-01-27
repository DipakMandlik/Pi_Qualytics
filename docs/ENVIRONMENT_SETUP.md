# Environment Variable Setup Guide

## Overview

Pi-Qualytics requires several environment variables to function properly. This guide explains each one and how to set them up.

---

## Required Variables (Must Have)

### SNOWFLAKE_ACCOUNT
**Purpose**: Your Snowflake account identifier  
**Format**: 
- Account ID: `xyz12345` or `xyz12345.region`
- Full URL: `https://xyz12345.us-east-1.snowflakecomputing.com`

**How to find it**:
1. Log into Snowflake
2. Look at the URL in your browser
3. The account ID is the subdomain (e.g., `abc123def` from `abc123def.us-east-1.snowflakecomputing.com`)

**Example**:
```env
SNOWFLAKE_ACCOUNT=abc123def
SNOWFLAKE_ACCOUNT=abc123def.us-east-1
SNOWFLAKE_ACCOUNT=https://abc123def.us-east-1.snowflakecomputing.com
```

### SNOWFLAKE_USER
**Purpose**: Your Snowflake username  
**Example**:
```env
SNOWFLAKE_USER=john.doe@company.com
```

### SNOWFLAKE_PASSWORD
**Purpose**: Your Snowflake password or API token  
**Security**: 
- ⚠️ Never commit this to git
- ⚠️ Use strong passwords (12+ characters, special chars)
- ✅ Consider using API tokens instead for better security

**Example**:
```env
SNOWFLAKE_PASSWORD=YourSecurePassword123!
```

---

## Optional Variables (Recommended)

### SNOWFLAKE_WAREHOUSE
**Purpose**: Default Snowflake warehouse to use  
**Default**: `COMPUTE_WH`  
**Example**:
```env
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_WAREHOUSE=ANALYTICS_WH
```

### SNOWFLAKE_DATABASE
**Purpose**: Default Snowflake database (business data)  
**Default**: `BANKING_DW`  
**Example**:
```env
SNOWFLAKE_DATABASE=BANKING_DW
SNOWFLAKE_DATABASE=YOUR_BUSINESS_DB
```

### SNOWFLAKE_SCHEMA
**Purpose**: Default schema to use  
**Default**: `BRONZE`  
**Example**:
```env
SNOWFLAKE_SCHEMA=BRONZE
SNOWFLAKE_SCHEMA=SILVER
```

### DQ_DATABASE
**Purpose**: Data Quality framework database  
**Default**: `DATA_QUALITY_DB`  
**Note**: This database is created by the SQL setup scripts  
**Example**:
```env
DQ_DATABASE=DATA_QUALITY_DB
```

---

## AI & LLM Configuration (Optional)

### GEMINI_API_KEY
**Purpose**: Google Gemini API key for AI insights  
**Default**: Not set (Gemini features disabled)  
**When to use**: You want AI-powered insights and anomaly detection

**How to get it**:
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste into `.env`

**Example**:
```env
GEMINI_API_KEY=AIzaSyD...your_key_here...
```

**Disabling**:
```env
# Leave empty to disable
GEMINI_API_KEY=
```

### OLLAMA_BASE_URL
**Purpose**: Local LLM server for on-device AI  
**Default**: `http://localhost:11434`  
**When to use**: You want privacy-preserving local AI without API costs

**Installation**:

**Windows (PowerShell Admin)**:
```powershell
# Run the setup script
.\antigravity\setup_ollama.ps1
```

**Manual Installation**:
1. Download from [ollama.com](https://ollama.com/)
2. Install and start the service
3. Pull a model: `ollama pull mixtral:8x7b`
4. Update `.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
```

**Verify Installation**:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return a JSON list of available models
```

---

## Application Configuration (Optional)

### NODE_ENV
**Purpose**: Application environment  
**Values**: `development` | `production`  
**Default**: `development`

**Example**:
```env
NODE_ENV=development   # More verbose logging, no optimization
NODE_ENV=production    # Optimized, strict error handling
```

### PORT
**Purpose**: Application port  
**Default**: `3000`

**Example**:
```env
PORT=3000
PORT=8080
```

### DEBUG
**Purpose**: Enable detailed logging  
**Default**: Not set  

**Example**:
```env
# Enable all Pi-Qualytics logging
DEBUG=pi-qualytics:*

# Enable specific module logging
DEBUG=pi-qualytics:snowflake
DEBUG=pi-qualytics:api
```

---

## Setup Instructions

### Step 1: Create .env file

```bash
# Copy the example
cp .env.example .env

# Edit with your editor
nano .env
# or
code .env
```

### Step 2: Get Snowflake Credentials

1. **Account ID**:
   - Log into Snowflake
   - Check the URL: `https://abc123def.us-east-1.snowflakecomputing.com`
   - Your account ID is `abc123def` or `abc123def.us-east-1`

2. **Username**: Your Snowflake username or email

3. **Password**: Your Snowflake password (or API token)

### Step 3: Verify Configuration

```bash
# Start the app - it will validate environment
npm run dev

# Look for:
# ✅ All required environment variables are configured
```

---

## Troubleshooting

### "Not connected to Snowflake"

1. **Check .env file**:
   ```bash
   grep SNOWFLAKE_ .env
   ```

2. **Verify credentials** in Snowflake:
   - Log in successfully
   - Confirm password is correct
   - Check username spelling

3. **Test connection**:
   ```bash
   # From Snowflake SQL Editor:
   SELECT CURRENT_VERSION();
   ```

### "Invalid account identifier"

**Error message**: `Invalid account identifier`

**Solution**:
```env
# Wrong format
SNOWFLAKE_ACCOUNT=https://abc123def.us-east-1.snowflakecomputing.com

# Correct format
SNOWFLAKE_ACCOUNT=abc123def
SNOWFLAKE_ACCOUNT=abc123def.us-east-1
```

### "Unauthorized: user not authorized"

**Error message**: `User not authorized`

**Solution**:
1. Check username spelling in `.env`
2. Verify user exists in Snowflake
3. Check user has necessary role privileges
4. Reset password if needed

### "Ollama not responding"

**Error message**: `Failed to connect to Ollama`

**Solution**:
```bash
# 1. Verify Ollama is installed
ollama --version

# 2. Start Ollama service
ollama serve

# 3. In another terminal, verify it's running
curl http://localhost:11434/api/tags

# 4. Check firewall isn't blocking port 11434
# 5. Update .env if using different port
```

### "GEMINI_API_KEY invalid"

**Error message**: `Invalid API key`

**Solution**:
1. Get new key from [Google AI Studio](https://ai.google.dev/)
2. Copy the ENTIRE key (including `AIzaSy...`)
3. Update `.env`:
   ```env
   GEMINI_API_KEY=AIzaSyD...the_full_key...
   ```
4. Restart app: `npm run dev`

---

## Security Best Practices

### 1. Never Commit .env

```bash
# Already in .gitignore, but verify
cat .gitignore | grep env
```

### 2. Use Strong Passwords

```
❌ Bad:  password123, admin, 123456
✅ Good: MyP@ssw0rd!2024xyz
```

### 3. Rotate Credentials Regularly

```bash
# Every 90 days:
# 1. Generate new Snowflake password
# 2. Update .env
# 3. Restart application
```

### 4. Use API Tokens (Not Passwords)

In Snowflake:
```sql
-- Create API integration
CREATE OR REPLACE INTEGRATION pi_qualytics_api
  TYPE = API
  API_PROVIDER = SERVICE_NOW;

-- Create security integration
CREATE OR REPLACE SECURITY INTEGRATION pi_qualytics_auth
  TYPE = API;
```

### 5. Restrict IAM Roles

```sql
-- Create minimal role
CREATE ROLE pi_qualytics_role;

-- Grant only needed privileges
GRANT USAGE ON DATABASE BANKING_DW TO pi_qualytics_role;
GRANT USAGE ON DATABASE DATA_QUALITY_DB TO pi_qualytics_role;
GRANT SELECT ON ALL TABLES IN SCHEMA BANKING_DW.BRONZE TO pi_qualytics_role;
```

---

## Environment Validation

The application automatically validates environment variables on startup.

### Success Message
```
✅ All required environment variables are configured
```

### Error Example
```
❌ Missing required environment variable: SNOWFLAKE_ACCOUNT
❌ Missing required environment variable: SNOWFLAKE_USER
```

### Warning Example
```
⚠️  GEMINI_API_KEY not set. Gemini AI insights will not be available.
⚠️  OLLAMA_BASE_URL not set. Using default: http://localhost:11434
```

---

## Example .env File

```env
# ==========================================
# SNOWFLAKE CONFIGURATION (REQUIRED)
# ==========================================
SNOWFLAKE_ACCOUNT=abc123def.us-east-1
SNOWFLAKE_USER=john.doe@company.com
SNOWFLAKE_PASSWORD=MySecurePassword123!
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=BANKING_DW
SNOWFLAKE_SCHEMA=BRONZE

# ==========================================
# DATA QUALITY (REQUIRED)
# ==========================================
DQ_DATABASE=DATA_QUALITY_DB

# ==========================================
# AI CONFIGURATION (OPTIONAL)
# ==========================================
GEMINI_API_KEY=AIzaSyD...your_key...
OLLAMA_BASE_URL=http://localhost:11434

# ==========================================
# APPLICATION
# ==========================================
NODE_ENV=development
PORT=3000
DEBUG=pi-qualytics:*
```

---

## Support

For issues:
1. Check [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for full setup guide
2. Review [troubleshooting docs](./troubleshooting/)
3. Open an issue on GitHub with your error message (remove sensitive data)

---

**Last Updated**: January 23, 2026
