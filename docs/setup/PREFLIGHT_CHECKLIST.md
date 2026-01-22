# Pre-Flight Checklist - New Snowflake Account Setup

## ✅ Complete This Checklist Before Testing

### 1. Snowflake Account Setup

#### 1.1 Create New Snowflake Account
- [ ] Sign up at https://signup.snowflake.com/
- [ ] Choose region (recommend same as your location)
- [ ] Add valid payment method
- [ ] Verify account is active

#### 1.2 Get Connection Details
```env
SNOWFLAKE_ACCOUNT=<your-account-identifier>  # e.g., abc12345.us-east-1
SNOWFLAKE_USER=<your-username>
SNOWFLAKE_PASSWORD=<your-password>
SNOWFLAKE_WAREHOUSE=COMPUTE_WH  # Default warehouse
```

#### 1.3 Update `.env.local`
```bash
cd "c:\Users\Dipak.Mandlik\OneDrive - PibyThree Consulting Services Private Limited\Desktop\Pi-Qualytics-main"
# Edit .env.local with new credentials
```

---

### 2. Database Setup in Snowflake

#### 2.1 Create Database
```sql
-- Execute in Snowflake worksheet
CREATE DATABASE IF NOT EXISTS DATA_QUALITY_DB;
USE DATABASE DATA_QUALITY_DB;
```

#### 2.2 Run Setup Script
```sql
-- Execute this file in Snowflake:
-- sql/setup_antigravity_observability.sql

-- This creates:
-- ✅ DB_METRICS schema
-- ✅ DQ_METRICS table
-- ✅ DQ_AI_INSIGHTS table
-- ✅ DQ_LLM_EXECUTION_LOG table (NEW - for Ollama)
-- ✅ DQ_INVESTIGATION_SESSIONS table
-- ✅ DQ_INVESTIGATION_ARTIFACTS table
```

#### 2.3 Verify Tables Created
```sql
SHOW TABLES IN SCHEMA DATA_QUALITY_DB.DB_METRICS;

-- Should show:
-- DQ_METRICS
-- DQ_AI_INSIGHTS
-- DQ_LLM_EXECUTION_LOG
-- DQ_INVESTIGATION_SESSIONS
-- DQ_INVESTIGATION_ARTIFACTS
-- DQ_DAILY_SUMMARY
-- DQ_CHECK_RESULTS
-- DQ_COLUMN_PROFILE
```

#### 2.4 Create Sample Data (Optional for Testing)
```sql
-- Insert test metric
INSERT INTO DATA_QUALITY_DB.DB_METRICS.DQ_METRICS (
    ASSET_ID,
    METRIC_NAME,
    METRIC_VALUE,
    METRIC_TIME
) VALUES (
    'BANKING_DW.BRONZE.STG_ACCOUNT',
    'quality_score',
    85.5,
    CURRENT_TIMESTAMP()
);

-- Verify
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.DQ_METRICS LIMIT 5;
```

---

### 3. Ollama Setup (Local LLM)

#### 3.1 Install Ollama
```powershell
# Run as Administrator
cd "c:\Users\Dipak.Mandlik\OneDrive - PibyThree Consulting Services Private Limited\Desktop\Pi-Qualytics-main"
.\antigravity\setup_ollama.ps1
```

**Expected Output**:
- ✅ Ollama installed
- ✅ Service started
- ✅ Model pulled (Mixtral 8x7b ~26GB or Llama3 8b ~4.7GB)
- ✅ Inference test passed

#### 3.2 Verify Ollama is Running
```bash
# Check service
curl http://localhost:11434/api/tags

# Should return JSON with available models
```

#### 3.3 Test Model
```bash
ollama run mixtral:8x7b "Respond with SUCCESS if you can read this"

# Expected: Model responds with "SUCCESS"
```

#### 3.4 Configure Model (Optional)
```env
# In .env.local
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=mixtral:8x7b  # or llama3:8b for faster responses
```

---

### 4. Application Configuration

#### 4.1 Install Dependencies
```bash
npm install
```

#### 4.2 Verify Environment Variables
Check `.env.local` has:
```env
# Snowflake (REQUIRED)
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH

# Ollama (OPTIONAL - uses defaults if not set)
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=mixtral:8x7b
```

#### 4.3 Build Application
```bash
npm run build
```

**Expected**: No build errors

---

### 5. API Endpoint Verification

#### 5.1 Start Dev Server
```bash
npm run dev
```

#### 5.2 Test Health Endpoint
```bash
curl http://localhost:3000/api/antigravity/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "ollama",
  "endpoint": "http://localhost:11434",
  "model": "mixtral:8x7b",
  "availableModels": ["mixtral:8x7b"],
  "message": "Ollama is running and ready"
}
```

**If Unhealthy**:
- Check Ollama is running: `ollama serve`
- Check model is loaded: `ollama list`

#### 5.3 Test Snowflake Connection
Navigate to: `http://localhost:3000`

**Expected**: Overview page loads without errors

**If Errors**:
- Check Snowflake credentials in `.env.local`
- Check database exists: `SHOW DATABASES LIKE 'DATA_QUALITY_DB'`
- Check warehouse is running: `SHOW WAREHOUSES`

---

### 6. AI Components Verification

#### 6.1 Schema Registry
```bash
# Test schema introspection
cd antigravity/ide/notebooks
jupyter notebook 01_schema_registry.ipynb
# Run all cells
```

**Expected**:
- ✅ Connects to Snowflake
- ✅ Fetches schema from INFORMATION_SCHEMA
- ✅ Builds registry with DB_METRICS tables
- ✅ Exports schema_registry.json

#### 6.2 LLM Router
Test in browser console or create test file:
```typescript
import { OllamaRouter } from '@/antigravity/engine/llm_router';

const router = new OllamaRouter();
const health = await router.healthCheck();
console.log(health); // Should be { healthy: true, ... }
```

#### 6.3 Plan Validator
```typescript
import { validatePlan } from '@/antigravity/engine/plan_validator';
import { introspectSchema } from '@/lib/antigravity/schema-reader';

const schema = await introspectSchema('DATA_QUALITY_DB', ['DB_METRICS']);
const testPlan = {
    intent: 'TREND_ANALYSIS',
    tables: ['DATA_QUALITY_DB.DB_METRICS.DQ_METRICS'],
    columns: ['METRIC_TIME', 'METRIC_VALUE'],
    metrics: ['METRIC_VALUE'],
    filters: { asset: 'BANKING_DW.BRONZE.STG_ACCOUNT' },
    group_by: ['METRIC_TIME'],
    limit: 100
};

const validation = validatePlan(testPlan, schema);
console.log(validation); // Should be { valid: true, errors: [], warnings: [] }
```

#### 6.4 SQL Builder
```typescript
import { buildSQLFromPlan } from '@/antigravity/engine/sql_builder';

const { sql, params, estimatedComplexity } = buildSQLFromPlan(testPlan, 'BANKING_DW.BRONZE.STG_ACCOUNT');
console.log(sql); // Should be valid SQL
console.log(estimatedComplexity); // Should be 'LOW', 'MEDIUM', or 'HIGH'
```

#### 6.5 Execution Engine (Full Pipeline)
```typescript
import { executeWithOllama } from '@/antigravity/engine/ollama_execution_engine';
import { introspectSchema } from '@/lib/antigravity/schema-reader';

const schema = await introspectSchema('DATA_QUALITY_DB', ['DB_METRICS']);
const result = await executeWithOllama(
    "What is the current quality score?",
    "BANKING_DW.BRONZE.STG_ACCOUNT",
    schema
);

console.log(result.status); // Should be 'SUCCESS'
console.log(result.interpretation); // Should have whatHappened, whyItHappened, etc.
```

---

### 7. End-to-End Testing

#### 7.1 Test Ask Question Flow
1. Navigate to `http://localhost:3000`
2. Go to Investigation Mode
3. Select asset: `BANKING_DW.BRONZE.STG_ACCOUNT`
4. Click "Ask a Question"
5. Enter: "How has quality changed this week?"
6. Wait 20-40 seconds

**Expected**:
- ✅ Question accepted
- ✅ Ollama generates plan
- ✅ Plan validated against schema
- ✅ SQL executed on Snowflake
- ✅ Results interpreted by Ollama
- ✅ Business-first answer displayed

**Check Audit Log**:
```sql
SELECT
    EXECUTION_ID,
    USER_QUESTION,
    EXECUTION_STATUS,
    TOTAL_EXECUTION_TIME_MS,
    CREATED_AT
FROM DATA_QUALITY_DB.DB_METRICS.DQ_LLM_EXECUTION_LOG
ORDER BY CREATED_AT DESC
LIMIT 1;
```

#### 7.2 Test Generate Insights
1. Navigate to asset detail page
2. Click "Generate AI Insights"
3. Wait for response

**Expected**:
- ✅ Context built from observability data
- ✅ Ollama generates insight
- ✅ Insight stored in DQ_AI_INSIGHTS
- ✅ Insight displayed in UI

**Verify Storage**:
```sql
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.DQ_AI_INSIGHTS
ORDER BY CREATED_AT DESC
LIMIT 1;
```

#### 7.3 Test Error Handling
1. Stop Ollama: Close Ollama service
2. Try asking a question

**Expected**:
- ❌ Error message: "Ollama is not available"
- ❌ HTTP 503 status
- ✅ Error logged in DQ_LLM_EXECUTION_LOG with status 'OLLAMA_UNAVAILABLE'

3. Restart Ollama: `ollama serve`
4. Try again - should work

---

### 8. Performance Validation

#### 8.1 Measure Response Times
```sql
SELECT
    AVG(TOTAL_EXECUTION_TIME_MS) as avg_total_ms,
    AVG(LLM_RESPONSE_TIME_MS) as avg_llm_ms,
    COUNT(*) as total_executions
FROM DATA_QUALITY_DB.DB_METRICS.DQ_LLM_EXECUTION_LOG
WHERE EXECUTION_STATUS = 'SUCCESS'
    AND CREATED_AT >= DATEADD('HOUR', -1, CURRENT_TIMESTAMP());
```

**Expected (Mixtral 8x7b)**:
- Total: 20,000 - 40,000 ms (20-40 seconds)
- LLM: 15,000 - 30,000 ms (15-30 seconds)

**Expected (Llama3 8b)**:
- Total: 6,000 - 15,000 ms (6-15 seconds)
- LLM: 4,000 - 10,000 ms (4-10 seconds)

#### 8.2 Check Success Rate
```sql
SELECT
    EXECUTION_STATUS,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM DATA_QUALITY_DB.DB_METRICS.DQ_LLM_EXECUTION_LOG
GROUP BY EXECUTION_STATUS;
```

**Target**: >80% SUCCESS rate

---

### 9. Common Issues & Fixes

#### Issue: "Ollama is not available"
**Fix**:
```bash
ollama serve
# Wait 5 seconds
curl http://localhost:11434/api/tags
```

#### Issue: "Schema validation failed"
**Fix**:
```bash
# Refresh schema registry
cd antigravity/ide/notebooks
jupyter notebook 01_schema_registry.ipynb
# Run all cells
```

#### Issue: "SQL compilation error"
**Fix**: Check column names in error message, verify they exist:
```sql
SELECT COLUMN_NAME
FROM DATA_QUALITY_DB.INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'DB_METRICS'
    AND TABLE_NAME = '<table_from_error>';
```

#### Issue: Slow responses (>60 seconds)
**Fix**: Switch to Llama3:
```env
OLLAMA_MODEL=llama3:8b
```
```bash
ollama pull llama3:8b
```

---

### 10. Final Verification Checklist

Before declaring success, verify:

- [ ] Snowflake account active with payment method
- [ ] All tables created in DATA_QUALITY_DB.DB_METRICS
- [ ] Ollama running with model loaded
- [ ] Health endpoint returns "healthy"
- [ ] Overview page loads data
- [ ] Ask question completes successfully
- [ ] Generate insights works
- [ ] Audit log has entries
- [ ] No Gemini API errors in logs
- [ ] Response times acceptable (<40s for Mixtral, <15s for Llama3)

---

## Success Criteria

✅ **Infrastructure**: Snowflake + Ollama both running  
✅ **Database**: All tables created and accessible  
✅ **API**: All 3 endpoints working (ask-question, generate-insights, health)  
✅ **AI Pipeline**: Plan → Validate → SQL → Execute → Interpret  
✅ **Audit**: All executions logged  
✅ **Performance**: Response times within expected range  

---

## Next Steps After Verification

1. **Production Deployment**:
   - Set up production Snowflake account
   - Deploy Ollama on server (not localhost)
   - Configure environment variables
   - Run `npm run build && npm start`

2. **Monitoring**:
   - Set up Snowflake query monitoring
   - Monitor Ollama resource usage
   - Track success rates in DQ_LLM_EXECUTION_LOG

3. **Optimization**:
   - Tune prompts based on audit logs
   - Adjust model based on performance needs
   - Optimize SQL queries if slow

---

**Status**: Ready for new Snowflake account setup  
**Estimated Setup Time**: 45-60 minutes  
**Support**: See QUICKSTART.md and walkthrough.md for details
