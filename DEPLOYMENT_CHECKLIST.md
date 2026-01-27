# ✅ Pre-Deployment Checklist

Use this checklist to verify everything is working before deploying to production.

---

## 📋 Pre-Flight Checks

### Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `SNOWFLAKE_ACCOUNT` is set (e.g., `abc123def.us-east-1`)
- [ ] `SNOWFLAKE_USER` is set with valid username
- [ ] `SNOWFLAKE_PASSWORD` is set (strong password, not in git)
- [ ] `SNOWFLAKE_WAREHOUSE` is set or defaulting correctly
- [ ] `SNOWFLAKE_DATABASE` is set (typically `BANKING_DW`)
- [ ] `DQ_DATABASE` is set (typically `DATA_QUALITY_DB`)
- [ ] Optional: `GEMINI_API_KEY` configured for AI features
- [ ] Optional: `OLLAMA_BASE_URL` configured for local LLM
- [ ] `.env` file is in `.gitignore` (not committed)

### Environment Validation
- [ ] Run `npm run dev` and check validation message
- [ ] Confirm: `✅ All required environment variables are configured`
- [ ] No critical errors shown (warnings are OK)

---

## 🗄️ Database Setup

### Snowflake Configuration
- [ ] Snowflake account has ACCOUNTADMIN or elevated role
- [ ] Network access from application server to Snowflake (port 443)
- [ ] All 12 SQL setup scripts executed in order:
  - [ ] 00_MASTER_SETUP.sql
  - [ ] 01_Environment_Setup.sql
  - [ ] 02_Data_Loading.sql
  - [ ] 03_Silver_Layer_Setup.sql
  - [ ] 04_Gold_Layer_Setup.sql
  - [ ] 05_Config_Tables.sql
  - [ ] 06_Metrics_Tables.sql
  - [ ] 07_Populate_Configuration.sql
  - [ ] 08_Execution_Engine.sql
  - [ ] 09_Profiling_Custom_Scanning.sql
  - [ ] 10_Scheduling_Tasks.sql
  - [ ] 11_Observability_AI_Insights.sql

### Database Verification
```sql
-- Verify databases exist
SHOW DATABASES LIKE '%BANKING%';
SHOW DATABASES LIKE '%QUALITY%';

-- Verify tables exist in DQ database
USE DATABASE DATA_QUALITY_DB;
SHOW TABLES IN SCHEMA DQ_CONFIG;      -- Should show 6+ tables
SHOW TABLES IN SCHEMA DQ_METRICS;     -- Should show 10+ tables
SHOW TABLES IN SCHEMA DQ_ENGINE;      -- Should show procedures
```

- [ ] BANKING_DW database exists
- [ ] DATA_QUALITY_DB database exists
- [ ] DQ_CONFIG tables exist and populated
- [ ] DQ_METRICS tables exist
- [ ] DQ_ENGINE procedures exist
- [ ] Test data loaded (if applicable)

### User Permissions
- [ ] Dedicated database user created (optional but recommended)
- [ ] User has SELECT, INSERT, EXECUTE privileges
- [ ] User has access to COMPUTE_WH warehouse
- [ ] Tested connection with actual credentials

---

## 💻 Application Setup

### Dependencies
- [ ] `npm install` completed without errors
- [ ] All packages installed: `npm list next react snowflake-sdk`
- [ ] Node version is 18+ (`node --version`)
- [ ] npm version is 8+ (`npm --version`)

### Build Process
- [ ] `npm run build` succeeds without errors
- [ ] Build generates `.next` directory
- [ ] No TypeScript errors shown

### Development Testing
- [ ] `npm run dev` starts without errors
- [ ] Application accessible at `http://localhost:3000`
- [ ] Dashboard loads
- [ ] No console errors in browser (F12 > Console)
- [ ] No console errors in terminal

---

## 🔌 Connection Verification

### Snowflake Connection
- [ ] Click "Connect to Snowflake" in application
- [ ] Enter credentials
- [ ] Connection succeeds with message: "Successfully connected to Snowflake!"
- [ ] Dashboard populates with data
- [ ] Sidebar shows database hierarchy

### API Endpoints
- [ ] `GET /api/snowflake/status` returns `{"isConnected": true}`
- [ ] `GET /api/dq/overall-score` returns quality score
- [ ] `GET /api/dq/kpis` returns KPI data
- [ ] `GET /api/snowflake/databases` returns list of databases

### Database Queries
```sql
-- Run from Snowflake to verify connectivity
SELECT COUNT(*) FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL;
-- Should return a number (0 is OK initially)

SELECT * FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG LIMIT 1;
-- Should return at least 1 row

SELECT * FROM DATA_QUALITY_DB.DQ_CONFIG.DQ_RULES LIMIT 1;
-- Should return at least 1 row
```

- [ ] Above queries execute successfully in Snowflake

---

## 📊 Feature Testing

### Data Quality Dashboard
- [ ] Homepage loads
- [ ] Quality score displays (even if 0)
- [ ] Check counts visible
- [ ] SLA compliance shows
- [ ] Risk card displays

### Scanning
- [ ] "Run Scan" button clickable
- [ ] Scan completes without errors
- [ ] Results appear in dashboard (30-60 seconds)
- [ ] Historical data shows trends

### Scheduling
- [ ] Can navigate to dataset detail page
- [ ] Can create a new schedule
- [ ] Schedule saves successfully
- [ ] Schedule appears in schedule list

### Profiling
- [ ] "Run Profiling" button works
- [ ] Profile completes without errors
- [ ] Column statistics appear

---

## 🤖 AI Features (Optional)

### Gemini Setup
- [ ] GEMINI_API_KEY is set in `.env`
- [ ] API key is valid (tested with curl)
- [ ] "Generate Insights" button clickable
- [ ] Insights generate without errors

### Ollama Setup (If configured)
- [ ] Ollama service is running (`ollama serve`)
- [ ] Model is pulled (`ollama pull mixtral:8x7b`)
- [ ] `curl http://localhost:11434/api/tags` returns models
- [ ] Investigation mode works without timeouts

---

## 🔒 Security Checks

### Credentials & Secrets
- [ ] `.env` is in `.gitignore`
- [ ] No passwords in code or logs
- [ ] API keys not exposed in frontend (only backend)
- [ ] Database user has minimal required permissions

### Network Security
- [ ] HTTPS configured for production domain
- [ ] Snowflake connection uses TLS
- [ ] No sensitive data in error messages
- [ ] CORS configured appropriately (if applicable)

### Access Control
- [ ] Database user is not ACCOUNTADMIN (for production)
- [ ] Users only see data they have access to
- [ ] API endpoints validate connections

---

## 📝 Monitoring & Logging

### Logging
- [ ] Application logs show successful connections
- [ ] No ERROR level logs on startup
- [ ] WARN level logs are expected and documented
- [ ] Failed queries are logged with details

### Monitoring Setup (Production)
- [ ] Application logs are captured
- [ ] Error tracking configured (optional: Sentry, DataDog)
- [ ] Database query logs enabled in Snowflake
- [ ] Dashboard uptime monitoring configured

---

## 🚀 Deployment Ready

### Production Build
- [ ] `npm run build` generates optimized build
- [ ] `.next/standalone` directory exists
- [ ] All assets in `.next/static`
- [ ] No build warnings

### Docker (If applicable)
- [ ] `docker build -t pi-qualytics:latest .` succeeds
- [ ] Image created: `docker images | grep pi-qualytics`
- [ ] Container starts: `docker run -p 3000:3000 pi-qualytics:latest`
- [ ] Container logs show successful startup
- [ ] Container accessible at `http://localhost:3000`

### Performance
- [ ] Dashboard loads in < 3 seconds
- [ ] API responses < 1 second (normal network)
- [ ] No memory leaks (check process memory over time)
- [ ] CPU usage is reasonable (<50% idle baseline)

---

## 📚 Documentation

### User Documentation
- [ ] README.md is current
- [ ] SETUP_COMPLETE.md covers all steps
- [ ] ENVIRONMENT_SETUP.md explains all variables
- [ ] QUICKSTART.md is accessible
- [ ] Troubleshooting docs are complete

### Internal Documentation
- [ ] API endpoints are documented
- [ ] Database schema is documented
- [ ] Deployment procedure is documented
- [ ] Runbooks exist for common tasks

---

## 🎯 Go/No-Go Decision

### Go Criteria (All must be checked)
- [ ] Environment validation passes
- [ ] Database setup complete and verified
- [ ] Application builds without errors
- [ ] Connection to Snowflake successful
- [ ] Core features tested (scan, profile, schedule)
- [ ] No critical errors in logs
- [ ] Documentation complete
- [ ] Security checks passed

### No-Go Criteria (Any ONE blocks deployment)
- ❌ Required environment variable missing
- ❌ Database setup incomplete or failed
- ❌ Application build fails
- ❌ Cannot connect to Snowflake
- ❌ Critical runtime errors
- ❌ Failed security checks
- ❌ Poor performance observed

---

## 📋 Sign-Off

**Checked By**: ___________________________  
**Date**: ___________________________  
**Status**: ☐ GO  ☐ NO-GO  

**Notes/Issues Found**:
```
[Add any issues found during checklist]
```

**Resolution Steps**:
```
[Add steps taken to resolve issues]
```

**Approval**:
- [ ] QA Lead approved
- [ ] DevOps approved
- [ ] Product Owner approved

---

## 🔄 Post-Deployment

After successful deployment:
- [ ] Monitor application logs for 1 hour
- [ ] Verify dashboard accessible to all users
- [ ] Run first automated scan
- [ ] Check data appears correctly
- [ ] Create incident response runbook if not exists
- [ ] Update deployment log with timestamp and status

---

**Last Updated**: January 23, 2026  
**Version**: 1.0.0
