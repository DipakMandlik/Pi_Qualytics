# SQL Setup Execution Order

## Overview
This document provides the correct order to execute all SQL setup scripts for the robust DQ system with Antigravity integration.

## Prerequisites
- ✅ Snowflake account active (with payment method)
- ✅ Appropriate warehouse created (e.g., `DQ_ANALYTICS_WH`)
- ✅ Sufficient permissions (ACCOUNTADMIN or equivalent)

## Execution Order

### Step 1: Core DQ Schema Setup
**File**: `sql/setup_antigravity_observability.sql` (original)  
**Purpose**: Creates base DQ schemas and tables  
**Estimated Time**: 2-3 minutes

```sql
-- Execute in Snowflake
@sql/setup_antigravity_observability.sql
```

**Creates**:
- `DQ_CONFIG` schema (configuration tables)
- `DQ_METRICS` schema (results and metrics)
- `DQ_ENGINE` schema (stored procedures)
- Core tables: `DATASET_CONFIG`, `RULE_MASTER`, `DQ_CHECK_RESULTS`, etc.

---

### Step 2: Scan Schedules Table
**File**: `sql/create_scan_schedules_table.sql`  
**Purpose**: Creates scheduling infrastructure  
**Estimated Time**: 1 minute

```sql
@sql/create_scan_schedules_table.sql
```

**Creates**:
- `SCAN_SCHEDULES` table
- Helper procedures: `SP_CREATE_SCHEDULE`, `SP_UPDATE_SCHEDULE_STATUS`

---

### Step 3: Robust Profiling Procedure
**File**: `sql/sp_profile_dataset_robust.sql`  
**Purpose**: Hardened profiling procedure  
**Estimated Time**: 1 minute

```sql
@sql/sp_profile_dataset_robust.sql
```

**Creates**:
- `sp_profile_dataset` (robust version)

---

### Step 4: Robust Custom Scanning Procedure
**File**: `sql/sp_run_custom_rule_robust.sql`  
**Purpose**: Hardened custom rule execution  
**Estimated Time**: 1 minute

```sql
@sql/sp_run_custom_rule_robust.sql
```

**Creates**:
- `sp_run_custom_rule` (robust version)

---

### Step 5: Scheduling System
**File**: `sql/setup_scheduling_robust.sql`  
**Purpose**: Automated scheduling system  
**Estimated Time**: 2 minutes

```sql
@sql/setup_scheduling_robust.sql
```

**Creates**:
- `SP_RUN_CUSTOM_CHECKS_BATCH` procedure
- `SP_PROCESS_DUE_SCHEDULES` procedure
- `DQ_SCHEDULE_PROCESSOR_TASK` (runs every minute)

---

### Step 6: Antigravity Observability (Enhanced)
**File**: `sql/setup_antigravity_observability_robust.sql`  
**Purpose**: AI-driven observability layer  
**Estimated Time**: 2 minutes

```sql
@sql/setup_antigravity_observability_robust.sql
```

**Creates**:
- Enhanced `DQ_METRICS` table (for Antigravity)
- `DQ_AI_INSIGHTS` table
- `V_SCHEMA_REGISTRY` view
- `SP_INGEST_METRIC`, `SP_BACKFILL_METRICS`, `SP_STORE_INSIGHT` procedures
- Aggregation views: `V_LATEST_METRICS`, `V_METRIC_TRENDS`

---

### Step 7: Backfill Metrics (Optional but Recommended)
**Purpose**: Populate metrics from existing DQ data  
**Estimated Time**: 5-10 minutes (depending on data volume)

```sql
-- Backfill last 30 days
CALL DATA_QUALITY_DB.DB_METRICS.SP_BACKFILL_METRICS(30);
```

---

### Step 8: Seed Demo Data (Optional - for testing)
**File**: `sql/seed_demo_data.sql`  
**Purpose**: Create demo data for testing  
**Estimated Time**: 2 minutes

```sql
@sql/seed_demo_data.sql
```

---

## Verification Steps

### 1. Verify Schemas
```sql
SHOW SCHEMAS IN DATABASE DATA_QUALITY_DB;
```

**Expected**: `DQ_CONFIG`, `DQ_METRICS`, `DQ_ENGINE`, `DB_METRICS`

### 2. Verify Core Tables
```sql
SHOW TABLES IN SCHEMA DATA_QUALITY_DB.DQ_CONFIG;
SHOW TABLES IN SCHEMA DATA_QUALITY_DB.DQ_METRICS;
SHOW TABLES IN SCHEMA DATA_QUALITY_DB.DB_METRICS;
```

**Expected Tables**:
- DQ_CONFIG: `DATASET_CONFIG`, `RULE_MASTER`, `DATASET_RULE_CONFIG`, `SCAN_SCHEDULES`
- DQ_METRICS: `DQ_CHECK_RESULTS`, `DQ_COLUMN_PROFILE`, `DQ_DAILY_SUMMARY`, `DQ_RUN_CONTROL`, `DQ_LLM_EXECUTION_LOG`
- DB_METRICS: `DQ_METRICS`, `DQ_AI_INSIGHTS`

### 3. Verify Procedures
```sql
SHOW PROCEDURES IN SCHEMA DATA_QUALITY_DB.DQ_ENGINE;
SHOW PROCEDURES IN SCHEMA DATA_QUALITY_DB.DQ_METRICS;
SHOW PROCEDURES IN SCHEMA DATA_QUALITY_DB.DB_METRICS;
SHOW PROCEDURES IN SCHEMA DATA_QUALITY_DB.DQ_CONFIG;
```

**Expected Procedures**:
- `sp_profile_dataset`
- `sp_run_custom_rule`
- `SP_RUN_CUSTOM_CHECKS_BATCH`
- `SP_PROCESS_DUE_SCHEDULES`
- `SP_INGEST_METRIC`
- `SP_BACKFILL_METRICS`
- `SP_STORE_INSIGHT`
- `SP_CREATE_SCHEDULE`
- `SP_UPDATE_SCHEDULE_STATUS`

### 4. Verify Task
```sql
SHOW TASKS LIKE 'DQ_SCHEDULE_PROCESSOR_TASK';
```

**Expected**: Task should be in `started` state

### 5. Verify Views
```sql
SHOW VIEWS IN SCHEMA DATA_QUALITY_DB.DB_METRICS;
```

**Expected**: `V_SCHEMA_REGISTRY`, `V_LATEST_METRICS`, `V_METRIC_TRENDS`

### 6. Test Data Presence
```sql
-- Check if metrics were backfilled
SELECT COUNT(*) FROM DATA_QUALITY_DB.DB_METRICS.DQ_METRICS;

-- Check schema registry
SELECT COUNT(*) FROM DATA_QUALITY_DB.DB_METRICS.V_SCHEMA_REGISTRY;

-- Check latest metrics
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.V_LATEST_METRICS LIMIT 5;
```

---

## Troubleshooting

### Error: "Object does not exist"
**Cause**: Scripts executed out of order  
**Solution**: Follow the execution order above strictly

### Error: "Insufficient privileges"
**Cause**: User lacks permissions  
**Solution**: Run as ACCOUNTADMIN or grant appropriate permissions

### Error: "Warehouse suspended"
**Cause**: Warehouse not running  
**Solution**: 
```sql
ALTER WAREHOUSE DQ_ANALYTICS_WH RESUME;
```

### Error: "Table already exists"
**Cause**: Re-running setup scripts  
**Solution**: Scripts use `CREATE OR REPLACE` - safe to re-run

### No metrics in DQ_METRICS table
**Cause**: Backfill not run or no source data  
**Solution**: 
```sql
-- Check source tables have data
SELECT COUNT(*) FROM DATA_QUALITY_DB.DQ_METRICS.DQ_CHECK_RESULTS;

-- Run backfill
CALL DATA_QUALITY_DB.DB_METRICS.SP_BACKFILL_METRICS(30);
```

---

## Post-Setup Configuration

### 1. Create Your First Schedule
```sql
CALL DATA_QUALITY_DB.DQ_CONFIG.SP_CREATE_SCHEDULE(
    'BANKING_DW',           -- Database
    'BRONZE',               -- Schema
    'STG_ACCOUNT',          -- Table
    'profiling',            -- Scan type
    'daily'                 -- Schedule type
);
```

### 2. Verify Schedule Created
```sql
SELECT * FROM DATA_QUALITY_DB.DQ_CONFIG.SCAN_SCHEDULES
WHERE STATUS = 'active';
```

### 3. Manually Trigger Scheduler (for testing)
```sql
CALL SP_PROCESS_DUE_SCHEDULES();
```

---

## Complete Setup Checklist

- [ ] Step 1: Core DQ schema setup
- [ ] Step 2: Scan schedules table
- [ ] Step 3: Robust profiling procedure
- [ ] Step 4: Robust custom scanning procedure
- [ ] Step 5: Scheduling system
- [ ] Step 6: Antigravity observability
- [ ] Step 7: Backfill metrics
- [ ] Step 8: Seed demo data (optional)
- [ ] Verification: All schemas exist
- [ ] Verification: All tables exist
- [ ] Verification: All procedures exist
- [ ] Verification: Task is running
- [ ] Verification: Metrics populated
- [ ] Configuration: First schedule created
- [ ] Testing: Manual scheduler trigger

---

## Estimated Total Time
- **Minimum**: 10-15 minutes (without demo data)
- **With demo data**: 15-20 minutes
- **With large backfill**: 20-30 minutes

---

## Next Steps After Setup

1. ✅ Configure Ollama (see `QUICKSTART.md`)
2. ✅ Test Antigravity API endpoints
3. ✅ Create schedules for your tables
4. ✅ Monitor task execution
5. ✅ Review generated insights

---

**Status**: Ready for execution  
**Support**: See `CRITICAL_SNOWFLAKE_SUSPENDED.md` if account issues  
**Demo Prep**: See `demo_safety_checklist.md`
