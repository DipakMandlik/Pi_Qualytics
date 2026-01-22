# Pi-Qualytics Production SQL Scripts

## 🎯 Overview

This directory contains **12 production-ready SQL scripts** for deploying a complete Data Quality platform with:
- **3-Layer Medallion Architecture** (Bronze, Silver, Gold)
- **Comprehensive DQ Framework** (20 rule types, 65+ mappings)
- **Automated Scheduling** (Profiling & custom checks)
- **AI-Driven Observability** (Insights & monitoring)

---

## 📁 File Inventory

### **Setup Scripts (Execute in Order 01-11)**

| # | File | Purpose | Time |
|---|------|---------|------|
| 00 | `00_MASTER_SETUP.sql` | **Setup guide** - Execution instructions & verification | - |
| 01 | `01_Environment_Setup.sql` | Warehouses, databases, schemas, stages, Bronze tables | ~1 min |
| 02 | `02_Data_Loading.sql` | Load CSV files into Bronze layer | ~2 min |
| 03 | `03_Silver_Layer_Setup.sql` | Type-safe tables with DQ scoring & transformation | ~1 min |
| 04 | `04_Gold_Layer_Setup.sql` | Analytics views and dashboards | ~30 sec |
| 05 | `05_Config_Tables.sql` | DQ configuration tables (rules, datasets, templates) | ~30 sec |
| 06 | `06_Metrics_Tables.sql` | Metrics tracking (run control, results, summaries) | ~30 sec |
| 07 | `07_Populate_Configuration.sql` | Populate 65+ rule mappings for all Bronze tables | ~30 sec |
| 08 | `08_Execution_Engine.sql` | Main DQ check processor (config-driven) | ~30 sec |
| 09 | `09_Profiling_Custom_Scanning.sql` | Profiling & custom rule execution procedures | ~30 sec |
| 10 | `10_Scheduling_Tasks.sql` | Automated scheduling system & task processor | ~30 sec |
| 11 | `11_Observability_AI_Insights.sql` | AI-driven monitoring & insights generation | ~30 sec |

### **Documentation**

| File | Purpose |
|------|---------|
| `README.md` | This file - Quick reference guide |
| `SETUP_GUIDE.md` | Detailed setup instructions with troubleshooting |

**Total Setup Time**: ~5-10 minutes

---

## 🚀 Quick Start

### **Prerequisites**
- ✅ Snowflake account with `ACCOUNTADMIN` role
- ✅ CSV files ready for upload (5 files)
- ✅ Snowflake Web UI or SnowSQL access

### **Deployment Steps**

1. **Upload CSV Files** to Snowflake stage (see SETUP_GUIDE.md)
2. **Execute Scripts 01-11** in order in Snowflake Web UI
3. **Run Verification** queries from `00_MASTER_SETUP.sql`
4. **Test** with sample DQ checks

> **See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed step-by-step instructions**

---

## 🏗️ Architecture

### **3-Layer Medallion Architecture**

```
BANKING_DW Database
├── BRONZE (Raw Data - All STRING columns)
│   ├── STG_CUSTOMER
│   ├── STG_ACCOUNT
│   ├── STG_TRANSACTION
│   ├── STG_DAILY_BALANCE
│   └── STG_FX_RATE
│
├── SILVER (Cleansed & Validated - Type-Safe)
│   ├── CUSTOMER (with dq_score, is_valid, validation_errors)
│   ├── ACCOUNT (with foreign keys)
│   ├── TRANSACTION
│   ├── DAILY_BALANCE
│   └── FX_RATE
│
└── GOLD (Business-Ready Analytics)
    ├── VW_CUSTOMER_360
    ├── VW_CUSTOMER_SEGMENTATION
    ├── VW_ACCOUNT_SUMMARY
    ├── VW_TRANSACTION_TRENDS
    ├── VW_DATA_QUALITY_SCORECARD
    ├── VW_DATA_QUALITY_ISSUES
    └── VW_EXECUTIVE_DASHBOARD
```

### **DQ Framework Architecture**

```
DATA_QUALITY_DB Database
├── DQ_CONFIG (Configuration)
│   ├── RULE_MASTER (20 rule types)
│   ├── RULE_SQL_TEMPLATE (Dynamic SQL templates)
│   ├── DATASET_CONFIG (5 Bronze datasets)
│   ├── DATASET_RULE_CONFIG (65+ mappings)
│   ├── WEIGHTS_MAPPING (Business domain weights)
│   ├── ALLOWED_VALUES_CONFIG (Validation lists)
│   └── SCAN_SCHEDULES (Automated scheduling)
│
├── DQ_METRICS (Results & Tracking)
│   ├── DQ_RUN_CONTROL (Execution tracking)
│   ├── DQ_CHECK_RESULTS (Detailed check results)
│   ├── DQ_FAILED_RECORDS (Failure details)
│   ├── DQ_COLUMN_PROFILE (Column statistics)
│   ├── DQ_DAILY_SUMMARY (Daily aggregates)
│   ├── DQ_WEEKLY_SUMMARY
│   ├── DQ_MONTHLY_SUMMARY
│   ├── DQ_QUARTERLY_SUMMARY
│   └── DATA_LINEAGE (Bronze→Silver→Gold)
│
├── DQ_ENGINE (Execution Procedures)
│   ├── SP_EXECUTE_DQ_CHECKS (Main engine)
│   ├── SP_PROFILE_DATASET (Profiling)
│   ├── SP_RUN_CUSTOM_RULE (Ad-hoc checks)
│   ├── SP_RUN_DATA_PROFILING (Scheduled profiling)
│   ├── SP_RUN_CUSTOM_CHECKS_BATCH (Batch custom)
│   └── SP_PROCESS_DUE_SCHEDULES (Scheduler)
│
└── DB_METRICS (Observability)
    ├── DQ_METRICS (Unified metrics fact table)
    ├── DQ_AI_INSIGHTS (AI-generated insights)
    ├── V_SCHEMA_REGISTRY (AI SQL generation helper)
    ├── V_UNIFIED_METRICS (Materialized metrics view)
    ├── SP_INGEST_METRIC (Metric ingestion)
    ├── SP_BACKFILL_METRICS (Historical data)
    └── SP_GENERATE_AI_INSIGHTS (Insight generation)
```

---

## ✅ Key Features

### **Comprehensive DQ Rules (65+ Mappings)**
- **Completeness**: 15 rules (null checks, critical columns)
- **Uniqueness**: 10 rules (primary keys, composite keys)
- **Validity**: 20 rules (email, phone, date formats, allowed values)
- **Consistency**: 10 rules (foreign keys, logical relationships)
- **Freshness**: 5 rules (load timestamp checks)
- **Volume**: 5 rules (anomaly detection)

### **Execution Modes**
- **Full Execution**: All datasets, all rules
- **Dataset-Specific**: Single dataset profiling
- **Rule-Type Filtering**: Only completeness, validity, etc.
- **Critical-Only**: High-priority datasets only
- **Ad-Hoc Custom**: Single rule with threshold override

### **Automated Scheduling**
- **Task Processor**: Runs every minute
- **Schedule Types**: Hourly, Daily, Weekly
- **Scan Types**: Profiling, Custom Checks, Full, Anomalies
- **Selective Rules**: JSON config for specific rules
- **Error Handling**: Retry logic, failure tracking

### **AI-Driven Insights**
- **Anomaly Detection**: Sudden DQ score drops
- **Trend Analysis**: Quality improvement/degradation
- **Actionable Recommendations**: Specific next steps
- **Confidence Scoring**: 75-85% based on evidence
- **Full Traceability**: Links to source metrics

---

## 🔄 Data Flow

```
CSV Files → Bronze (Raw) → Silver (Cleansed) → Gold (Analytics)
              ↓              ↓                    ↓
         DQ Profiling   DQ Validation      Business Insights
              ↓              ↓                    ↓
         AI Insights    Automated Checks    Executive Dashboards
```

---

## 📊 Post-Deployment Testing

### **1. Run First DQ Check**
```sql
CALL DATA_QUALITY_DB.DQ_ENGINE.SP_EXECUTE_DQ_CHECKS(NULL, NULL, 'FULL');
```

### **2. Profile a Dataset**
```sql
CALL DATA_QUALITY_DB.DQ_ENGINE.SP_PROFILE_DATASET('DS_BRONZE_CUSTOMER', NULL, 'FULL');
```

### **3. View Results**
```sql
-- Check results
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_CHECK_RESULTS 
ORDER BY CHECK_TIMESTAMP DESC LIMIT 20;

-- Daily summary
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_DAILY_SUMMARY 
WHERE SUMMARY_DATE = CURRENT_DATE();

-- Gold layer scorecard
SELECT * FROM BANKING_DW.GOLD.VW_DATA_QUALITY_SCORECARD;
```

### **4. Generate AI Insights**
```sql
-- Backfill metrics
CALL DATA_QUALITY_DB.DB_METRICS.SP_BACKFILL_METRICS(30);

-- Generate insights
CALL DATA_QUALITY_DB.DB_METRICS.SP_GENERATE_AI_INSIGHTS(NULL);

-- View insights
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.DQ_AI_INSIGHTS 
ORDER BY CREATED_AT DESC LIMIT 10;
```

### **5. Monitor Scheduled Tasks**
```sql
SHOW TASKS LIKE 'DQ_SCHEDULE_PROCESSOR_TASK';

SELECT * FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY()) 
WHERE NAME = 'DQ_SCHEDULE_PROCESSOR_TASK' 
ORDER BY SCHEDULED_TIME DESC LIMIT 10;
```

---

## 🛠️ Maintenance

### **Refresh Data**
```sql
-- Reload Bronze layer
TRUNCATE TABLE BANKING_DW.BRONZE.STG_CUSTOMER;
-- Re-run 02_Data_Loading.sql

-- Re-transform to Silver
CALL BANKING_DW.SILVER.SP_TRANSFORM_BRONZE_TO_SILVER();
```

### **Monitor Quality**
```sql
-- Check DQ scorecard
SELECT * FROM BANKING_DW.GOLD.VW_DATA_QUALITY_SCORECARD;

-- View issues
SELECT * FROM BANKING_DW.GOLD.VW_DATA_QUALITY_ISSUES;

-- Check recent runs
SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL
ORDER BY START_TS DESC LIMIT 10;
```

### **Update Rules**
```sql
-- Add new rule mapping
INSERT INTO DATA_QUALITY_DB.DQ_CONFIG.DATASET_RULE_CONFIG
(DATASET_ID, RULE_ID, COLUMN_NAME, THRESHOLD_VALUE, IS_ACTIVE)
VALUES ('DS_BRONZE_CUSTOMER', 1, 'phone', 95.0, TRUE);
```

---

## 🆘 Troubleshooting

### **Common Issues**

1. **"No files in stage"**
   - Upload CSV files to `@BANKING_DW.BRONZE.CSV_STAGE`
   - Verify: `LIST @BANKING_DW.BRONZE.CSV_STAGE;`

2. **"Warehouse suspended"**
   - Resume: `ALTER WAREHOUSE DQ_ANALYTICS_WH RESUME;`

3. **"Foreign key violation"**
   - Ensure parent records exist in CUSTOMER before loading ACCOUNT
   - Or temporarily disable FK: `ALTER TABLE ACCOUNT DROP CONSTRAINT fk_account_customer;`

4. **Low DQ scores**
   - Review validation errors: `SELECT validation_errors FROM BANKING_DW.SILVER.CUSTOMER WHERE is_valid = FALSE;`
   - Fix source data and reload

> **See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting**

---

## 🎓 Best Practices

1. **Always backup before major changes**
   ```sql
   CREATE TABLE CUSTOMER_BACKUP AS SELECT * FROM CUSTOMER;
   ```

2. **Monitor warehouse costs**
   ```sql
   SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
   WHERE WAREHOUSE_NAME LIKE '%DQ_%'
   ORDER BY START_TIME DESC;
   ```

3. **Regular DQ checks**
   - Schedule daily profiling for critical tables
   - Review DQ scorecard weekly
   - Investigate score drops immediately

4. **Optimize queries**
   - Use Gold layer views for reporting
   - Avoid querying Bronze layer directly
   - Leverage clustering keys for large tables

---

## 🔐 Security

- All scripts use `EXECUTE AS CALLER` for proper permission inheritance
- Foreign keys enforce referential integrity
- Audit trail columns track all data lineage
- Role-based access control via Snowflake RBAC

---

## 📈 Performance

- **Warehouses**: Auto-suspend to minimize costs
- **Clustering**: Applied to high-volume tables
- **Views**: Optimized with proper filters and aggregations
- **Transformations**: MERGE-based for efficiency

---

## 🎯 Next Steps

After setup:
1. Configure application `.env` with Snowflake credentials
2. Test API endpoints
3. Set up monitoring and alerting
4. Train users on Gold layer views
5. Document custom business logic

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-22  
**Maintained By**: Pi-Qualytics Team
