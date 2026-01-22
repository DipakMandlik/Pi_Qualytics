# Antigravity Observability Integration Guide

## Overview
The Antigravity observability system provides AI-driven insights by analyzing data quality metrics stored in Snowflake. This guide explains how to integrate it with your existing DQ system.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Existing DQ System                        │
├─────────────────────────────────────────────────────────────┤
│ DQ_CHECK_RESULTS → Quality scores, pass rates              │
│ DQ_COLUMN_PROFILE → Null counts, row counts, statistics    │
│ DQ_DAILY_SUMMARY → Aggregated DQ scores                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ Backfill
                   ↓
┌─────────────────────────────────────────────────────────────┐
│              Antigravity Observability Layer                 │
├─────────────────────────────────────────────────────────────┤
│ DQ_METRICS → Unified metric store (time-series)            │
│ DQ_AI_INSIGHTS → AI-generated insights                     │
│ V_SCHEMA_REGISTRY → Schema introspection for LLM           │
└──────────────────┬──────────────────────────────────────────┘
                   │ Query
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   Ollama LLM Engine                          │
├─────────────────────────────────────────────────────────────┤
│ 1. User asks question                                        │
│ 2. LLM generates execution plan                             │
│ 3. Plan validated against schema registry                   │
│ 4. SQL generated and executed on DQ_METRICS                 │
│ 5. Results interpreted by LLM                               │
│ 6. Business insights returned                               │
└─────────────────────────────────────────────────────────────┘
```

## Setup Steps

### 1. Run Observability Setup
```sql
-- Execute the robust observability setup
@sql/setup_antigravity_observability_robust.sql
```

This creates:
- `DQ_METRICS` table (unified metric store)
- `DQ_AI_INSIGHTS` table (AI insights storage)
- `V_SCHEMA_REGISTRY` view (schema introspection)
- Helper procedures for metric ingestion and backfill

### 2. Backfill Historical Metrics
```sql
-- Backfill last 30 days of metrics from existing DQ tables
CALL DATA_QUALITY_DB.DB_METRICS.SP_BACKFILL_METRICS(30);
```

This populates `DQ_METRICS` with:
- Quality scores from `DQ_CHECK_RESULTS`
- Null rates from `DQ_COLUMN_PROFILE`
- Row counts from `DQ_COLUMN_PROFILE`
- DQ scores from `DQ_DAILY_SUMMARY`

### 3. Configure Continuous Metric Ingestion

Add metric ingestion to your existing procedures:

```sql
-- Example: Add to sp_profile_dataset after profiling completes
CALL DATA_QUALITY_DB.DB_METRICS.SP_INGEST_METRIC(
    P_ASSET_ID => 'BANKING_DW.BRONZE.STG_ACCOUNT',
    P_COLUMN_NAME => 'CUSTOMER_NAME',
    P_METRIC_NAME => 'NULL_RATE',
    P_METRIC_VALUE => 5.2,
    P_TAGS => PARSE_JSON('{"scan_type": "profiling", "run_id": "DQ_PROFILE_123"}')
);
```

### 4. Verify Integration

```sql
-- Check latest metrics
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.V_LATEST_METRICS
WHERE ASSET_ID = 'BANKING_DW.BRONZE.STG_ACCOUNT'
LIMIT 10;

-- Check metric trends
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.V_METRIC_TRENDS
WHERE ASSET_ID = 'BANKING_DW.BRONZE.STG_ACCOUNT'
  AND METRIC_NAME = 'QUALITY_SCORE'
ORDER BY METRIC_DATE DESC;
```

## Metric Naming Conventions

Use standardized metric names for consistency:

| Metric Name | Description | Source |
|-------------|-------------|--------|
| `quality_score` | Overall DQ pass rate (0-100) | DQ_CHECK_RESULTS |
| `null_rate` | Percentage of null values | DQ_COLUMN_PROFILE |
| `row_count` | Total rows in table | DQ_COLUMN_PROFILE |
| `dq_score` | Daily aggregated score | DQ_DAILY_SUMMARY |
| `freshness_hours` | Hours since last update | Custom calculation |
| `duplicate_rate` | Percentage of duplicates | DQ_CHECK_RESULTS |
| `completeness_score` | Completeness metric | DQ_CHECK_RESULTS |
| `uniqueness_score` | Uniqueness metric | DQ_CHECK_RESULTS |
| `validity_score` | Validity metric | DQ_CHECK_RESULTS |

## Antigravity Query Examples

Once integrated, Antigravity can answer questions like:

**Freshness Questions**:
- "When was BANKING_DW.BRONZE.STG_ACCOUNT last updated?"
- "How has data freshness changed over the last week?"

**Quality Questions**:
- "What is the current quality score for STG_ACCOUNT?"
- "Which tables have declining quality scores?"

**Trend Questions**:
- "How has null rate changed for CUSTOMER_NAME column?"
- "Show me quality trends for the last 7 days"

**Anomaly Questions**:
- "Are there any anomalies in row counts?"
- "Which metrics are outside normal ranges?"

## Continuous Metric Updates

### Option 1: Trigger-Based (Recommended)
Create triggers on DQ tables to auto-populate DQ_METRICS:

```sql
-- Example trigger (pseudo-code, adapt to your needs)
CREATE OR REPLACE TRIGGER TRG_DQ_CHECK_RESULTS_INSERT
AFTER INSERT ON DQ_CHECK_RESULTS
FOR EACH ROW
BEGIN
    CALL SP_INGEST_METRIC(
        NEW.DATABASE_NAME || '.' || NEW.SCHEMA_NAME || '.' || NEW.TABLE_NAME,
        NEW.COLUMN_NAME,
        'quality_score',
        NEW.PASS_RATE,
        NULL,
        NULL
    );
END;
```

### Option 2: Scheduled Backfill
Run backfill procedure daily via Snowflake task:

```sql
CREATE OR REPLACE TASK TASK_DAILY_METRIC_BACKFILL
    WAREHOUSE = DQ_ANALYTICS_WH
    SCHEDULE = 'USING CRON 0 2 * * * UTC' -- 2 AM daily
AS
    CALL DATA_QUALITY_DB.DB_METRICS.SP_BACKFILL_METRICS(1); -- Last 1 day
```

### Option 3: Manual Integration
Add metric ingestion calls to your existing procedures:
- `sp_profile_dataset` → Ingest profiling metrics
- `sp_run_custom_rule` → Ingest check results
- Custom ETL jobs → Ingest freshness metrics

## Troubleshooting

### Issue: No metrics showing up
```sql
-- Check if DQ_METRICS table has data
SELECT COUNT(*) FROM DATA_QUALITY_DB.DB_METRICS.DQ_METRICS;

-- Check backfill procedure results
CALL DATA_QUALITY_DB.DB_METRICS.SP_BACKFILL_METRICS(7);
```

### Issue: Antigravity can't find tables
```sql
-- Verify schema registry is populated
SELECT COUNT(*) FROM DATA_QUALITY_DB.DB_METRICS.V_SCHEMA_REGISTRY;

-- Check specific table exists in registry
SELECT * FROM DATA_QUALITY_DB.DB_METRICS.V_SCHEMA_REGISTRY
WHERE TABLE_NAME = 'DQ_METRICS';
```

### Issue: Old metrics not being queried
```sql
-- Check metric time ranges
SELECT 
    METRIC_NAME,
    MIN(METRIC_TIME) as oldest,
    MAX(METRIC_TIME) as newest,
    COUNT(*) as count
FROM DATA_QUALITY_DB.DB_METRICS.DQ_METRICS
GROUP BY METRIC_NAME;
```

## Best Practices

1. **Standardize Metric Names**: Use consistent naming across all metric sources
2. **Include Timestamps**: Always populate `METRIC_TIME` accurately
3. **Add Context Tags**: Use `TAGS` field for additional metadata
4. **Regular Backfills**: Run backfill procedure daily to catch any missed metrics
5. **Monitor Metric Gaps**: Set up alerts for missing metrics
6. **Clean Old Data**: Implement retention policy for metrics older than 90 days

## Performance Optimization

### Clustering
```sql
-- Enable clustering for faster time-series queries
ALTER TABLE DATA_QUALITY_DB.DB_METRICS.DQ_METRICS 
    CLUSTER BY (ASSET_ID, METRIC_TIME);
```

### Materialized Views
```sql
-- Create materialized view for frequently queried aggregations
CREATE MATERIALIZED VIEW MV_HOURLY_METRICS AS
SELECT
    ASSET_ID,
    METRIC_NAME,
    DATE_TRUNC('hour', METRIC_TIME) AS METRIC_HOUR,
    AVG(METRIC_VALUE) AS AVG_VALUE,
    MIN(METRIC_VALUE) AS MIN_VALUE,
    MAX(METRIC_VALUE) AS MAX_VALUE
FROM DATA_QUALITY_DB.DB_METRICS.DQ_METRICS
WHERE METRIC_TIME >= DATEADD(day, -7, CURRENT_TIMESTAMP())
GROUP BY ASSET_ID, METRIC_NAME, DATE_TRUNC('hour', METRIC_TIME);
```

## Security Considerations

1. **Row-Level Security**: Implement RLS on DQ_METRICS if needed
2. **Column Masking**: Mask sensitive metric values
3. **Audit Logging**: All Antigravity queries are logged in `DQ_LLM_EXECUTION_LOG`
4. **Access Control**: Grant appropriate permissions to roles

## Next Steps

1. ✅ Run observability setup script
2. ✅ Execute initial backfill
3. ✅ Verify metrics are populated
4. ✅ Test Antigravity queries
5. ✅ Set up continuous metric ingestion
6. ✅ Configure monitoring and alerts
7. ✅ Train team on asking questions to Antigravity

---

**Status**: Ready for integration  
**Dependencies**: Ollama LLM, Snowflake, Existing DQ tables  
**Support**: See `demo_safety_checklist.md` for troubleshooting
