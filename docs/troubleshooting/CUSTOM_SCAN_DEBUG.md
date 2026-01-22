# Custom Scan Debugging Guide

## Issue Observed
Custom scan shows:
- ✅ Status: PASSED
- ❌ Pass Rate: 0.0%
- ❌ Records: 0
- ❌ Checks Breakdown: All 0 (Passed: 0, Failed: 0, Warnings: 0, Skipped: 0)
- Run ID: `DQ_CUSTOM_20260120_224500_d2e01d68`

## Root Cause Analysis

### Possible Causes

1. **No Rules Configured**
   - The table `STG_ACCOUNT` might not have any custom rules configured in `DATASET_RULE_CONFIG`
   
2. **Rule Not Active**
   - The `COMPLETENESS_CHECK` rule might be inactive (`IS_ACTIVE = FALSE`)

3. **Column Mismatch**
   - The column `CUSTOMER_ID` might not exist or have wrong name in config

4. **Stored Procedure Issue**
   - The `sp_run_custom_rule` might be failing silently

## Diagnostic Queries

Run these in Snowflake to diagnose:

### 1. Check if Dataset Exists
```sql
SELECT * 
FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG
WHERE SOURCE_DATABASE = 'BANKING_DW'
  AND SOURCE_SCHEMA = 'BRONZE'
  AND SOURCE_TABLE = 'STG_ACCOUNT';
```

### 2. Check Configured Rules
```sql
SELECT 
    drc.RULE_NAME,
    drc.COLUMN_NAME,
    drc.THRESHOLD_VALUE,
    drc.IS_ACTIVE,
    rm.RULE_ID,
    rm.IS_ACTIVE as RULE_MASTER_ACTIVE
FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_RULE_CONFIG drc
LEFT JOIN DATA_QUALITY_DB.DQ_CONFIG.RULE_MASTER rm 
    ON UPPER(drc.RULE_NAME) = UPPER(rm.RULE_NAME)
WHERE drc.DATASET_ID = (
    SELECT DATASET_ID 
    FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG
    WHERE SOURCE_DATABASE = 'BANKING_DW'
      AND SOURCE_SCHEMA = 'BRONZE'
      AND SOURCE_TABLE = 'STG_ACCOUNT'
);
```

### 3. Check Run Control Logs
```sql
SELECT *
FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL
WHERE RUN_ID = 'DQ_CUSTOM_20260120_224500_d2e01d68';
```

### 4. Check Check Results
```sql
SELECT *
FROM DATA_QUALITY_DB.DQ_METRICS.DQ_CHECK_RESULTS
WHERE RUN_ID = 'DQ_CUSTOM_20260120_224500_d2e01d68';
```

### 5. Check if Table Has Data
```sql
SELECT COUNT(*) as ROW_COUNT
FROM BANKING_DW.BRONZE.STG_ACCOUNT;
```

## Common Fixes

### Fix 1: Add Rule Configuration
If no rules are configured:

```sql
-- Get dataset_id
SET dataset_id = (
    SELECT DATASET_ID 
    FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG
    WHERE SOURCE_DATABASE = 'BANKING_DW'
      AND SOURCE_SCHEMA = 'BRONZE'
      AND SOURCE_TABLE = 'STG_ACCOUNT'
);

-- Add completeness check
INSERT INTO DATA_QUALITY_DB.DQ_CONFIG.DATASET_RULE_CONFIG (
    DATASET_ID,
    RULE_ID,
    RULE_NAME,
    COLUMN_NAME,
    THRESHOLD_VALUE,
    IS_ACTIVE
)
SELECT 
    $dataset_id,
    RULE_ID,
    'COMPLETENESS_CHECK',
    'CUSTOMER_ID',
    95.0,
    TRUE
FROM DATA_QUALITY_DB.DQ_CONFIG.RULE_MASTER
WHERE RULE_NAME = 'COMPLETENESS_CHECK';
```

### Fix 2: Activate Inactive Rules
If rules exist but are inactive:

```sql
UPDATE DATA_QUALITY_DB.DQ_CONFIG.DATASET_RULE_CONFIG
SET IS_ACTIVE = TRUE
WHERE DATASET_ID = (
    SELECT DATASET_ID 
    FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG
    WHERE SOURCE_DATABASE = 'BANKING_DW'
      AND SOURCE_SCHEMA = 'BRONZE'
      AND SOURCE_TABLE = 'STG_ACCOUNT'
);
```

### Fix 3: Check Column Name
Verify column exists:

```sql
SELECT COLUMN_NAME
FROM BANKING_DW.INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'BRONZE'
  AND TABLE_NAME = 'STG_ACCOUNT'
  AND COLUMN_NAME LIKE '%CUSTOMER%';
```

## Manual Test

Test the stored procedure directly:

```sql
-- Get dataset_id first
SET dataset_id = (
    SELECT DATASET_ID 
    FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG
    WHERE SOURCE_DATABASE = 'BANKING_DW'
      AND SOURCE_SCHEMA = 'BRONZE'
      AND SOURCE_TABLE = 'STG_ACCOUNT'
);

-- Call procedure manually
CALL DATA_QUALITY_DB.DQ_ENGINE.sp_run_custom_rule(
    $dataset_id,           -- dataset_id
    'COMPLETENESS_CHECK',  -- rule_name
    'CUSTOMER_ID',         -- column_name
    95.0,                  -- threshold
    'ADHOC'                -- run_mode
);
```

## Expected vs Actual

### Expected Behavior
- Pass Rate: 95-100%
- Records: 300 (matching table row count)
- Checks: At least 1 check executed
- Status: PASSED or FAILED (not empty)

### Actual Behavior
- Pass Rate: 0.0%
- Records: 0
- Checks: 0
- Suggests no checks were actually executed

## Next Steps

1. Run diagnostic queries above
2. Check if rules are configured
3. Verify column names match
4. Test stored procedure manually
5. Check application logs for errors

---

**Status**: Investigation needed  
**Priority**: High  
**Impact**: Custom scans not working
