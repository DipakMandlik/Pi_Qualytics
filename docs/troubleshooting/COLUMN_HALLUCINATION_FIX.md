# Ollama Column Hallucination Fix

## ✅ Fixed!

Updated the prompt template with **correct column names** from actual DQ tables.

### 🔧 Changes Made

**File**: `antigravity/prompts/plan_generation.prompt`

#### Incorrect Examples (Before)
```json
{
  "columns": ["CHECK_NAME", "CHECK_STATUS", "CHECK_TIME"]
}
```

#### Correct Examples (After)
```json
{
  "columns": ["RULE_NAME", "CHECK_STATUS", "CHECK_TIMESTAMP", "FAILED_RECORDS"]
}
```

### 📋 Added Explicit Rules

Added to prompt:
```
6. NEVER use CHECK_NAME - use RULE_NAME instead
7. NEVER use CHECK_TIME - use CHECK_TIMESTAMP instead
8. NEVER use ACCOUNT_ID unless it exists in the schema
```

### 🎯 Actual Column Names

From `DQ_CHECK_RESULTS` table:
- ✅ `RULE_NAME` (not CHECK_NAME)
- ✅ `CHECK_STATUS`
- ✅ `CHECK_TIMESTAMP` (not CHECK_TIME)
- ✅ `FAILED_RECORDS`
- ✅ `PASS_RATE`
- ✅ `DATABASE_NAME`, `SCHEMA_NAME`, `TABLE_NAME`
- ✅ `COLUMN_NAME`

From `DQ_METRICS` table:
- ✅ `ASSET_ID`
- ✅ `METRIC_NAME`
- ✅ `METRIC_VALUE`
- ✅ `METRIC_TIME`
- ✅ `COLUMN_NAME`

### 🚀 Next Steps

1. **Restart your app** to load the new prompt:
   ```powershell
   # Stop app (Ctrl+C)
   npm run dev
   ```

2. **Try generating insights again** - should work now!

3. **Test questions**:
   - "How has quality changed this week?"
   - "Which checks failed yesterday?"
   - "Show me the row count trend"

### 📊 Expected Improvement

- **Before**: TinyLlama hallucinated columns like `CHECK_NAME`, `ACCOUNT_ID`
- **After**: TinyLlama uses only real columns like `RULE_NAME`, `CHECK_TIMESTAMP`

---

**Status**: ✅ Prompt fixed with correct column names  
**Action**: Restart app and test insights
