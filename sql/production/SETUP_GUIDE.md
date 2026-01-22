# Pi-Qualytics Production Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Active Snowflake account with payment method configured
- ✅ `ACCOUNTADMIN` role or equivalent permissions
- ✅ CSV data files ready for upload (5 files):
  - `customer_low_quality_last_next_90_days.csv`
  - `STG_ACCOUNT.csv`
  - `Transaction_03-01-2026.csv`
  - `Daily_Balance_03-01-2026.csv`
  - `fx_rate_low_quality_last_next_90_days.csv`
- ✅ Snowflake Web UI access (recommended) OR SnowSQL CLI
- ✅ Text editor for reviewing SQL scripts

---

## 🚀 Quick Start (4 Steps)

### **Step 1: Upload CSV Files**

**Option A: Using Snowflake Web UI (Recommended)**

1. Log into Snowflake Web UI
2. First, run `01_Environment_Setup.sql` to create the stage
3. Navigate to: **Databases** → **BANKING_DW** → **BRONZE** → **Stages** → **CSV_STAGE**
4. Click **"+ Files"** button
5. Upload all 5 CSV files
6. Verify files uploaded: `LIST @CSV_STAGE;`

**Option B: Using SnowSQL**

```bash
snowsql -a <your_account> -u <your_username>

# Upload files (after running 01_Environment_Setup.sql)
PUT file://path/to/customer_low_quality_last_next_90_days.csv @BANKING_DW.BRONZE.CSV_STAGE;
PUT file://path/to/STG_ACCOUNT.csv @BANKING_DW.BRONZE.CSV_STAGE;
PUT file://path/to/Transaction_03-01-2026.csv @BANKING_DW.BRONZE.CSV_STAGE;
PUT file://path/to/Daily_Balance_03-01-2026.csv @BANKING_DW.BRONZE.CSV_STAGE;
PUT file://path/to/fx_rate_low_quality_last_next_90_days.csv @BANKING_DW.BRONZE.CSV_STAGE;

# Verify
LIST @BANKING_DW.BRONZE.CSV_STAGE;
```

---

### **Step 2: Execute Setup Scripts (01-11)**

Execute the following scripts **in order** in Snowflake Web UI:

```sql
-- 01. Environment Setup (Warehouses, Databases, Schemas, Stages)
-- Open and execute: 01_Environment_Setup.sql
-- Time: ~1 minute

-- 02. Data Loading (Load CSV files into Bronze layer)
-- Open and execute: 02_Data_Loading.sql
-- Time: ~2 minutes

-- 03. Silver Layer Setup (Type-safe tables with DQ scoring)
-- Open and execute: 03_Silver_Layer_Setup.sql
-- Time: ~1 minute

-- 04. Gold Layer Setup (Analytics views)
-- Open and execute: 04_Gold_Layer_Setup.sql
-- Time: ~30 seconds

-- 05. Config Tables (DQ configuration tables)
-- Open and execute: 05_Config_Tables.sql
-- Time: ~30 seconds

-- 06. Metrics Tables (Metrics tracking tables)
-- Open and execute: 06_Metrics_Tables.sql
-- Time: ~30 seconds

-- 07. Populate Configuration (65+ rule mappings)
-- Open and execute: 07_Populate_Configuration.sql
-- Time: ~30 seconds

-- 08. Execution Engine (Main DQ processor)
-- Open and execute: 08_Execution_Engine.sql
-- Time: ~30 seconds

-- 09. Profiling & Custom Scanning (Profiling procedures)
-- Open and execute: 09_Profiling_Custom_Scanning.sql
-- Time: ~30 seconds

-- 10. Scheduling & Tasks (Automated scheduling)
-- Open and execute: 10_Scheduling_Tasks.sql
-- Time: ~30 seconds

-- 11. Observability & AI Insights (AI-driven monitoring)
-- Open and execute: 11_Observability_AI_Insights.sql
-- Time: ~30 seconds
```

**Total Time**: ~5-10 minutes

---

### **Step 3: Verify Setup**

Run verification queries from `00_MASTER_SETUP.sql`:

```sql
-- Verify databases
USE DATABASE SNOWFLAKE;
SELECT 'Databases:' AS CHECK_TYPE, COUNT(*) AS COUNT 
FROM INFORMATION_SCHEMA.DATABASES 
WHERE DATABASE_NAME IN ('BANKING_DW', 'DATA_QUALITY_DB');
-- Expected: 2

-- Verify Bronze tables
USE DATABASE BANKING_DW;
USE SCHEMA BRONZE;
SELECT 'Bronze Tables:' AS CHECK_TYPE, COUNT(*) AS COUNT 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'BRONZE' AND TABLE_TYPE = 'BASE TABLE';
-- Expected: 5

-- Verify Silver tables
USE SCHEMA SILVER;
SELECT 'Silver Tables:' AS CHECK_TYPE, COUNT(*) AS COUNT 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'SILVER' AND TABLE_TYPE = 'BASE TABLE';
-- Expected: 5

-- Verify Gold views
USE SCHEMA GOLD;
SELECT 'Gold Views:' AS CHECK_TYPE, COUNT(*) AS COUNT 
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_SCHEMA = 'GOLD';
-- Expected: 7

-- Verify DQ Config
USE DATABASE DATA_QUALITY_DB;
USE SCHEMA DQ_CONFIG;
SELECT 'Rules Configured:' AS CHECK_TYPE, COUNT(*) AS COUNT 
FROM RULE_MASTER WHERE IS_ACTIVE = TRUE;
-- Expected: 20

SELECT 'Datasets Configured:' AS CHECK_TYPE, COUNT(*) AS COUNT 
FROM DATASET_CONFIG WHERE IS_ACTIVE = TRUE;
-- Expected: 5

SELECT 'Rule Mappings:' AS CHECK_TYPE, COUNT(*) AS COUNT 
FROM DATASET_RULE_CONFIG WHERE IS_ACTIVE = TRUE;
-- Expected: 65+

-- Verify Tasks
USE SCHEMA DQ_METRICS;
SHOW TASKS LIKE 'DQ_SCHEDULE_PROCESSOR_TASK';
-- Expected: 1 task with STATE = 'started'
```

---

### **Step 4: Test DQ Framework**

```sql
-- Run first DQ check
CALL DATA_QUALITY_DB.DQ_ENGINE.SP_EXECUTE_DQ_CHECKS(NULL, NULL, 'FULL');

-- Profile a dataset
CALL DATA_QUALITY_DB.DQ_ENGINE.SP_PROFILE_DATASET('DS_BRONZE_CUSTOMER', NULL, 'FULL');

-- View results
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_CHECK_RESULTS
ORDER BY CHECK_TIMESTAMP DESC LIMIT 20;

-- View daily summary
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_DAILY_SUMMARY
WHERE SUMMARY_DATE = CURRENT_DATE();

-- View Gold layer scorecard
SELECT * FROM BANKING_DW.GOLD.VW_DATA_QUALITY_SCORECARD;

-- Generate AI insights
CALL DATA_QUALITY_DB.DB_METRICS.SP_BACKFILL_METRICS(30);
CALL DATA_QUALITY_DB.DB_METRICS.SP_GENERATE_AI_INSIGHTS(NULL);

-- View insights
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.DQ_AI_INSIGHTS
ORDER BY CREATED_AT DESC LIMIT 10;
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BANKING_DW Database                       │
├─────────────────────────────────────────────────────────────┤
│  🥉 BRONZE Layer (Raw Data - All STRING columns)           │
│     • STG_CUSTOMER, STG_ACCOUNT, STG_TRANSACTION            │
│     • STG_DAILY_BALANCE, STG_FX_RATE                        │
├─────────────────────────────────────────────────────────────┤
│  🥈 SILVER Layer (Cleansed Data - Type-Safe)               │
│     • CUSTOMER, ACCOUNT, TRANSACTION                        │
│     • DAILY_BALANCE, FX_RATE                                │
│     • With dq_score, is_valid, validation_errors            │
├─────────────────────────────────────────────────────────────┤
│  🥇 GOLD Layer (Analytics Views)                            │
│     • VW_CUSTOMER_360, VW_EXECUTIVE_DASHBOARD              │
│     • VW_DATA_QUALITY_SCORECARD, VW_TRANSACTION_TRENDS     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                DATA_QUALITY_DB Database                      │
├─────────────────────────────────────────────────────────────┤
│  DQ_CONFIG: Dataset configs, rules, schedules (6 tables)   │
│  DQ_METRICS: Check results, profiling, summaries (10 tables)│
│  DQ_ENGINE: Stored procedures (6 procedures)                │
│  DB_METRICS: AI observability and insights (4 objects)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Script Descriptions

### **01_Environment_Setup.sql**
- **Purpose**: Create foundational infrastructure
- **Creates**: 2 warehouses, 2 databases, 7 schemas, file formats, stages, 5 Bronze tables
- **Time**: ~1 minute

### **02_Data_Loading.sql**
- **Purpose**: Load CSV files into Bronze layer
- **Loads**: 5 CSV files with error handling
- **Time**: ~2 minutes

### **03_Silver_Layer_Setup.sql**
- **Purpose**: Create type-safe tables with DQ validation
- **Creates**: 5 Silver tables, transformation procedure
- **Time**: ~1 minute

### **04_Gold_Layer_Setup.sql**
- **Purpose**: Create business-ready analytics views
- **Creates**: 7 Gold layer views
- **Time**: ~30 seconds

### **05_Config_Tables.sql**
- **Purpose**: Create DQ configuration tables
- **Creates**: 6 config tables (RULE_MASTER, DATASET_CONFIG, etc.)
- **Time**: ~30 seconds

### **06_Metrics_Tables.sql**
- **Purpose**: Create metrics tracking tables
- **Creates**: 10 metrics tables (DQ_RUN_CONTROL, DQ_CHECK_RESULTS, etc.)
- **Time**: ~30 seconds

### **07_Populate_Configuration.sql**
- **Purpose**: Populate configuration with rules and mappings
- **Inserts**: 20 rules, 5 datasets, 65+ rule mappings
- **Time**: ~30 seconds

### **08_Execution_Engine.sql**
- **Purpose**: Create main DQ check processor
- **Creates**: SP_EXECUTE_DQ_CHECKS procedure
- **Time**: ~30 seconds

### **09_Profiling_Custom_Scanning.sql**
- **Purpose**: Create profiling and custom scanning procedures
- **Creates**: SP_PROFILE_DATASET, SP_RUN_CUSTOM_RULE
- **Time**: ~30 seconds

### **10_Scheduling_Tasks.sql**
- **Purpose**: Create automated scheduling system
- **Creates**: SP_RUN_DATA_PROFILING, SP_RUN_CUSTOM_CHECKS_BATCH, SP_PROCESS_DUE_SCHEDULES, DQ_SCHEDULE_PROCESSOR_TASK
- **Time**: ~30 seconds

### **11_Observability_AI_Insights.sql**
- **Purpose**: Create AI-driven observability layer
- **Creates**: DQ_METRICS table, DQ_AI_INSIGHTS table, V_SCHEMA_REGISTRY view, SP_GENERATE_AI_INSIGHTS
- **Time**: ~30 seconds

---

## ⚠️ Troubleshooting

### **Issue: "Object does not exist"**

**Cause**: Scripts executed out of order

**Solution**: 
```sql
-- Check what exists
SHOW DATABASES;
SHOW SCHEMAS IN DATABASE BANKING_DW;

-- Re-run from the beginning (01-11 in order)
```

---

### **Issue: "No files found in stage"**

**Cause**: CSV files not uploaded

**Solution**:
```sql
-- Check stage contents
LIST @BANKING_DW.BRONZE.CSV_STAGE;

-- If empty, upload files via UI or SnowSQL (see Step 1)
```

---

### **Issue: "Warehouse suspended"**

**Cause**: Warehouse auto-suspended due to inactivity

**Solution**:
```sql
ALTER WAREHOUSE DQ_ANALYTICS_WH RESUME;
USE WAREHOUSE DQ_ANALYTICS_WH;
```

---

### **Issue: "Cannot perform SELECT. This session does not have a current database"**

**Cause**: Missing USE DATABASE statement

**Solution**:
```sql
-- Always set context before queries
USE DATABASE DATA_QUALITY_DB;
USE SCHEMA DQ_METRICS;
```

---

### **Issue: "Foreign key constraint violation"**

**Cause**: Orphaned records in child tables

**Solution**:
```sql
-- Find orphaned accounts
SELECT a.account_id, a.customer_id
FROM BANKING_DW.SILVER.ACCOUNT a
LEFT JOIN BANKING_DW.SILVER.CUSTOMER c ON a.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

-- Option 1: Remove orphaned records
DELETE FROM BANKING_DW.SILVER.ACCOUNT
WHERE customer_id NOT IN (SELECT customer_id FROM BANKING_DW.SILVER.CUSTOMER);

-- Option 2: Temporarily disable FK constraint
ALTER TABLE BANKING_DW.SILVER.ACCOUNT DROP CONSTRAINT fk_account_customer;
```

---

## 🔄 Rollback Procedures

### **Full Rollback (Start Over)**

```sql
-- Drop everything
DROP DATABASE IF EXISTS BANKING_DW CASCADE;
DROP DATABASE IF EXISTS DATA_QUALITY_DB CASCADE;
DROP WAREHOUSE IF EXISTS DQ_INGESTION_WH;
DROP WAREHOUSE IF EXISTS DQ_ANALYTICS_WH;

-- Re-run all scripts from 01-11
```

### **Partial Rollback (Specific Layer)**

```sql
-- Rollback Silver layer only
TRUNCATE TABLE BANKING_DW.SILVER.CUSTOMER;
TRUNCATE TABLE BANKING_DW.SILVER.ACCOUNT;
TRUNCATE TABLE BANKING_DW.SILVER.TRANSACTION;
TRUNCATE TABLE BANKING_DW.SILVER.DAILY_BALANCE;
TRUNCATE TABLE BANKING_DW.SILVER.FX_RATE;

-- Re-run transformation
CALL BANKING_DW.SILVER.SP_TRANSFORM_BRONZE_TO_SILVER();
```

---

## ✅ Post-Setup Checklist

- [ ] All 5 CSV files uploaded to stage
- [ ] All 11 scripts (01-11) executed without errors
- [ ] Bronze tables contain data (5 tables)
- [ ] Silver tables populated (5 tables)
- [ ] Gold views return results (7 views)
- [ ] DQ config populated (20 rules, 5 datasets, 65+ mappings)
- [ ] DQ procedures created (6 procedures)
- [ ] Scheduled task running (DQ_SCHEDULE_PROCESSOR_TASK)
- [ ] Verification queries pass
- [ ] Test DQ checks successful

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review script comments for detailed explanations
3. Verify prerequisites are met
4. Check Snowflake query history for error messages
5. Review `00_MASTER_SETUP.sql` for verification queries

---

## 🎯 Next Steps

After successful setup:

1. **Configure Application**: Update `.env` file with Snowflake credentials
2. **Test API Endpoints**: Verify application connectivity
3. **Schedule Refreshes**: Configure automated data refreshes
4. **User Training**: Train team on Gold layer views
5. **Performance Tuning**: Optimize queries and add indexes as needed
6. **Monitoring**: Set up alerts for DQ failures
7. **Documentation**: Document custom business logic

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-22  
**Maintained By**: Pi-Qualytics Team
