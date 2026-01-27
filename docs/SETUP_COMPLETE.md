# 🎯 Pi-Qualytics Complete Setup Checklist

## ✅ Pre-Requisites

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **npm** installed (`npm --version`)
- [ ] **Snowflake Account** with ACCOUNTADMIN role access
- [ ] **Docker** (optional, for containerized deployment)

---

## 📋 Step 1: Environment Setup

### 1.1 Create Environment File

```bash
# Copy example env file
cp .env.example .env

# Edit with your credentials
nano .env  # or use your editor
```

### 1.2 Configure Required Variables

```env
# Snowflake Connection (REQUIRED)
SNOWFLAKE_ACCOUNT=xyz12345            # Your account identifier
SNOWFLAKE_USER=your_username          # Your Snowflake username
SNOWFLAKE_PASSWORD=your_password      # Your password or API token
SNOWFLAKE_WAREHOUSE=COMPUTE_WH        # Warehouse name
SNOWFLAKE_DATABASE=BANKING_DW         # Business data database
SNOWFLAKE_SCHEMA=BRONZE              # Initial schema

# Data Quality Database (REQUIRED)
DQ_DATABASE=DATA_QUALITY_DB           # DQ framework database

# AI Configuration (OPTIONAL but recommended)
GEMINI_API_KEY=your_key_here          # From https://ai.google.dev/
OLLAMA_BASE_URL=http://localhost:11434 # Local LLM (if using)
```

### 1.3 Validate Configuration

```bash
# The app will validate on startup and show any issues
npm run dev

# Check the console for validation messages
# Look for: "✅ All required environment variables are configured"
```

---

## 🗄️ Step 2: Snowflake Database Setup

### 2.1 Prerequisites

- [ ] Have ACCOUNTADMIN role in Snowflake
- [ ] Have SQL Editor access
- [ ] Network access from your machine to Snowflake

### 2.2 Execute Setup Scripts

```bash
# Navigate to SQL directory
cd sql/production

# Scripts must be executed IN ORDER in Snowflake SQL Editor
# 1. Run: 00_MASTER_SETUP.sql
# 2. Run: 01_Environment_Setup.sql
# 3. Run: 02_Data_Loading.sql
# 4. Run: 03_Silver_Layer_Setup.sql
# 5. Run: 04_Gold_Layer_Setup.sql
# 6. Run: 05_Config_Tables.sql
# 7. Run: 06_Metrics_Tables.sql
# 8. Run: 07_Populate_Configuration.sql
# 9. Run: 08_Execution_Engine.sql
# 10. Run: 09_Profiling_Custom_Scanning.sql
# 11. Run: 10_Scheduling_Tasks.sql
# 12. Run: 11_Observability_AI_Insights.sql
```

### 2.3 Verify Database Setup

In Snowflake SQL Editor, run:

```sql
-- Check if databases were created
SHOW DATABASES LIKE '%BANKING%';
SHOW DATABASES LIKE '%QUALITY%';

-- Check if key tables exist
USE DATABASE DATA_QUALITY_DB;
SHOW TABLES IN SCHEMA DQ_CONFIG;
SHOW TABLES IN SCHEMA DQ_METRICS;
SHOW TABLES IN SCHEMA DQ_ENGINE;

-- Test the execution engine
SELECT * FROM DQ_CONFIG.DQ_RULES LIMIT 1;
SELECT * FROM DQ_CONFIG.DATASET_CONFIG LIMIT 1;
```

**Expected Output**: Should see tables without errors

### 2.4 Create Snowflake User (Optional but Recommended)

```sql
-- Create a dedicated user for Pi-Qualytics (instead of ACCOUNTADMIN)
CREATE ROLE pi_qualytics_role;

-- Grant necessary privileges
GRANT USAGE ON DATABASE BANKING_DW TO ROLE pi_qualytics_role;
GRANT USAGE ON DATABASE DATA_QUALITY_DB TO ROLE pi_qualytics_role;
GRANT USAGE ON WAREHOUSE COMPUTE_WH TO ROLE pi_qualytics_role;

-- Create the user
CREATE USER pi_qualytics_user
  PASSWORD = 'your_secure_password'
  DEFAULT_ROLE = pi_qualytics_role;

-- Grant role to user
GRANT ROLE pi_qualytics_role TO USER pi_qualytics_user;

-- Update .env to use this user instead
```

---

## 📦 Step 3: Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list next react snowflake-sdk
```

**Expected Output**: All packages should be installed with correct versions

---

## 🤖 Step 4: AI Configuration (Optional)

### 4.1 Gemini Setup

```bash
# Get API key from: https://ai.google.dev/
# 1. Visit Google AI Studio
# 2. Click "Get API Key"
# 3. Create new API key
# 4. Copy to .env: GEMINI_API_KEY=your_key
```

### 4.2 Ollama Setup (Local LLM)

```bash
# Install Ollama from: https://ollama.com/

# Windows (PowerShell as Admin):
.\antigravity\setup_ollama.ps1

# macOS/Linux:
curl https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# In another terminal, pull a model
ollama pull mixtral:8x7b  # Or another model

# Verify it's running
curl http://localhost:11434/api/tags

# Update .env
OLLAMA_BASE_URL=http://localhost:11434
```

---

## 🚀 Step 5: Start Development Server

```bash
# Build and start
npm run build
npm run dev

# Or just dev mode with watch
npm run dev
```

**Expected Output**:
```
> pi_qualytics@0.1.0 dev
> next dev

  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
  - Environments: .env.local

  ✓ Ready in 3.2s
```

---

## 🔌 Step 6: Connect to Snowflake (First Time)

### 6.1 Open Application

1. Navigate to `http://localhost:3000`
2. You should see the Pi-Qualytics Dashboard

### 6.2 Connect Snowflake

1. Look for "Connect to Snowflake" button/dialog
2. Enter Snowflake credentials:
   - Account: `xyz12345` (or full URL)
   - Username: Your username
   - Password: Your password
   - Warehouse: `COMPUTE_WH`
   - Database: `BANKING_DW`
   - Schema: `BRONZE`
3. Click "Connect"
4. You should see: ✅ "Successfully connected to Snowflake!"

### 6.3 Verify Connection

- [ ] Dashboard loads with data
- [ ] You can see datasets in the sidebar
- [ ] Quality scores display on homepage
- [ ] No "Not connected" errors

---

## ✅ Step 7: Verify All Features

### 7.1 Data Quality Monitoring

- [ ] Dashboard shows quality scores
- [ ] Table checks are visible
- [ ] Can navigate to dataset details
- [ ] Activity history shows recent scans

### 7.2 Profiling & Scanning

- [ ] Can click "Run Scan" button
- [ ] Run Profiling completes successfully
- [ ] Check results appear in 30 seconds

### 7.3 Scheduling

- [ ] Can create schedules for tables
- [ ] Can set recurrence (daily/weekly/monthly)
- [ ] Can see schedule in list

### 7.4 Antigravity/AI Features (If Configured)

- [ ] Gemini API key is set
- [ ] Can click on "AI Insights" button
- [ ] Gets AI-generated insights about data quality
- [ ] Investigation mode works (if Ollama running)

---

## 🐛 Step 8: Troubleshooting

### Issue: "Not connected to Snowflake"

**Solution**:
```bash
# 1. Check .env file has valid credentials
cat .env | grep SNOWFLAKE

# 2. Verify Snowflake account identifier
# Go to: https://your-account.snowflakecomputing.com/

# 3. Check network connectivity
curl https://your-account.snowflakecomputing.com

# 4. Reconnect via the UI
# Click the Snowflake icon and re-enter credentials
```

### Issue: "Table does not exist" errors

**Solution**:
```bash
# 1. Verify all SQL scripts were run
# In Snowflake:
SELECT COUNT(*) FROM DATA_QUALITY_DB.DQ_CONFIG.DQ_RULES;

# 2. If tables missing, re-run setup scripts in order
# Start from: sql/production/00_MASTER_SETUP.sql

# 3. Check schema names match your setup
# Default: BANKING_DW.BRONZE
```

### Issue: "Ollama not responding"

**Solution**:
```bash
# 1. Verify Ollama is installed
ollama --version

# 2. Start Ollama service
ollama serve

# 3. In another terminal, verify it's running
curl http://localhost:11434/api/tags

# 4. If failing, check firewall settings
# Ollama needs to listen on port 11434
```

### Issue: "Gemini API key invalid"

**Solution**:
```bash
# 1. Get new key from: https://ai.google.dev/
# 2. Update .env: GEMINI_API_KEY=your_key
# 3. Restart the server: npm run dev
# 4. Try AI feature again
```

---

## 🔒 Step 9: Security Hardening (Production)

### 9.1 Secure Environment Variables

```bash
# Never commit .env file
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use a secrets management service:
# - AWS Secrets Manager
# - Azure Key Vault
# - HashiCorp Vault
# - GitHub Secrets (for CI/CD)
```

### 9.2 Database User Permissions

```sql
-- Create dedicated Snowflake user (not ACCOUNTADMIN)
-- See Step 2.4 above

-- Grant minimal required privileges
GRANT SELECT, INSERT ON ALL TABLES IN DATABASE DATA_QUALITY_DB TO ROLE pi_qualytics_role;
GRANT EXECUTE ON ALL PROCEDURES IN DATABASE DATA_QUALITY_DB TO ROLE pi_qualytics_role;
```

### 9.3 Network Security

- [ ] Use VPN/private network for Snowflake
- [ ] Enable IP whitelisting in Snowflake
- [ ] Use HTTPS for all connections (default with Next.js)
- [ ] Set strong passwords (min 12 chars, special chars)

### 9.4 API Security

```bash
# Update next.config.ts for production
# - Set output: 'standalone'
# - Enable security headers
# - Configure CORS if needed
```

---

## 📊 Step 10: Post-Deployment Verification

### 10.1 Health Checks

```bash
# Test Snowflake connection
curl http://localhost:3000/api/snowflake/status

# Test DQ API
curl http://localhost:3000/api/dq/overall-score

# Test Ollama (if configured)
curl http://localhost:11434/api/tags
```

### 10.2 Monitor Logs

```bash
# Check application logs for errors
# Dashboard should show:
# - No red errors
# - Data loading correctly
# - Scheduled jobs running

# Server logs should show:
# - "✅ All required environment variables are configured"
# - "✓ Ready in X.Xs"
# - Successful Snowflake queries
```

### 10.3 Database Health

```bash
# In Snowflake, check recent executions
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL 
ORDER BY START_TS DESC LIMIT 5;

# Should show recent runs with status 'COMPLETED'
```

---

## 🚢 Step 11: Docker Deployment (Optional)

### 11.1 Build Docker Image

```bash
# Build the image
docker build -t pi-qualytics:latest .

# Verify image was created
docker images | grep pi-qualytics
```

### 11.2 Run Docker Container

```bash
# Run with environment file
docker run -p 3000:3000 \
  --env-file .env \
  --name pi-qualytics \
  pi-qualytics:latest

# Or with docker-compose
docker-compose up -d
```

### 11.3 Verify Container

```bash
# Check container is running
docker ps | grep pi-qualytics

# View logs
docker logs -f pi-qualytics

# Test the app
curl http://localhost:3000
```

---

## 📚 Step 12: Documentation & Resources

- [ ] Read [README.md](../README.md) for project overview
- [ ] Check [docs/troubleshooting/](../docs/troubleshooting/) for common issues
- [ ] Review [sql/production/README.md](../sql/production/README.md) for database docs
- [ ] Check [antigravity/README.md](../antigravity/README.md) for AI features

---

## ✨ You're All Set!

Congratulations! Pi-Qualytics is now fully configured and running. 🎉

### Next Steps:

1. **Explore the Dashboard**: View data quality metrics
2. **Configure Datasets**: Add your data sources to the system
3. **Create Schedules**: Set up automated quality scans
4. **Set Up Alerts**: Configure notifications for failures
5. **Invite Team Members**: Share access with your team

### Support

For issues or questions:
- 📖 Check [docs/troubleshooting/](../docs/troubleshooting/)
- 🐛 Open an issue on GitHub
- 💬 Contact the team

---

**Last Updated**: January 23, 2026  
**Version**: 1.0.0  
**Maintained By**: Pi-Qualytics Team
