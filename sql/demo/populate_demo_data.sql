-- ============================================================================
-- QUICK DEMO DATA POPULATION
-- Pi-Qualytics - Populate DQ Metrics for Demo
-- ============================================================================
-- Purpose: Insert sample DQ metrics to populate the dashboard for demo
-- Execute this in Snowflake before the client demo
-- ============================================================================

USE ROLE ACCOUNTADMIN;
USE DATABASE DATA_QUALITY_DB;
USE SCHEMA DQ_METRICS;
USE WAREHOUSE DQ_PROCESSING_WH;

-- ============================================================================
-- 1. POPULATE DQ_RUN_CONTROL (Execution Metadata)
-- ============================================================================

INSERT INTO DQ_RUN_CONTROL (
    RUN_ID,
    START_TS,
    END_TS,
    STATUS,
    TOTAL_CHECKS,
    PASSED_CHECKS,
    FAILED_CHECKS,
    EXECUTION_MODE
) VALUES
    ('DEMO_RUN_001', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), 'COMPLETED', 820, 675, 145, 'SCHEDULED');

-- ============================================================================
-- 2. POPULATE DQ_DAILY_SUMMARY (Aggregated Daily Metrics)
-- ============================================================================

INSERT INTO DQ_DAILY_SUMMARY (
    SUMMARY_DATE,
    TABLE_NAME,
    TOTAL_CHECKS,
    PASSED_CHECKS,
    FAILED_CHECKS,
    DQ_SCORE,
    LAST_RUN_ID,
    LAST_UPDATED
) VALUES
    -- STG_ACCOUNT metrics
    (CURRENT_DATE(), 'BANKING_DW.BRONZE.STG_ACCOUNT', 150, 135, 15, 90.0, 'DEMO_RUN_001', CURRENT_TIMESTAMP()),
    
    -- STG_CUSTOMER metrics
    (CURRENT_DATE(), 'BANKING_DW.BRONZE.STG_CUSTOMER', 200, 180, 20, 90.0, 'DEMO_RUN_001', CURRENT_TIMESTAMP()),
    
    -- STG_TRANSACTION metrics
    (CURRENT_DATE(), 'BANKING_DW.BRONZE.STG_TRANSACTION', 250, 200, 50, 80.0, 'DEMO_RUN_001', CURRENT_TIMESTAMP()),
    
    -- STG_DAILY_BALANCE metrics
    (CURRENT_DATE(), 'BANKING_DW.BRONZE.STG_DAILY_BALANCE', 120, 100, 20, 83.3, 'DEMO_RUN_001', CURRENT_TIMESTAMP()),
    
    -- STG_FX_RATE metrics
    (CURRENT_DATE(), 'BANKING_DW.BRONZE.STG_FX_RATE', 100, 60, 40, 60.0, 'DEMO_RUN_001', CURRENT_TIMESTAMP());

-- ============================================================================
-- 3. POPULATE DQ_CHECK_RESULTS (Individual Check Results)
-- ============================================================================

INSERT INTO DQ_CHECK_RESULTS (
    CHECK_ID,
    RUN_ID,
    TABLE_NAME,
    COLUMN_NAME,
    CHECK_TYPE,
    CHECK_STATUS,
    EXPECTED_VALUE,
    ACTUAL_VALUE,
    SEVERITY,
    CHECK_TIMESTAMP
) VALUES
    -- Completeness checks
    ('CHK_001', 'DEMO_RUN_001', 'BANKING_DW.BRONZE.STG_ACCOUNT', 'ACCOUNT_ID', 'COMPLETENESS', 'PASSED', '100', '100', 'CRITICAL', CURRENT_TIMESTAMP()),
    ('CHK_002', 'DEMO_RUN_001', 'BANKING_DW.BRONZE.STG_ACCOUNT', 'CUSTOMER_ID', 'COMPLETENESS', 'PASSED', '100', '98.5', 'HIGH', CURRENT_TIMESTAMP()),
    
    -- Validity checks
    ('CHK_003', 'DEMO_RUN_001', 'BANKING_DW.BRONZE.STG_CUSTOMER', 'EMAIL', 'VALIDITY', 'PASSED', 'VALID_EMAIL', '95.2', 'MEDIUM', CURRENT_TIMESTAMP()),
    ('CHK_004', 'DEMO_RUN_001', 'BANKING_DW.BRONZE.STG_CUSTOMER', 'PHONE', 'VALIDITY', 'FAILED', 'VALID_PHONE', '72.1', 'MEDIUM', CURRENT_TIMESTAMP()),
    
    -- Accuracy checks
    ('CHK_005', 'DEMO_RUN_001', 'BANKING_DW.BRONZE.STG_TRANSACTION', 'TRANSACTION_AMOUNT', 'ACCURACY', 'PASSED', 'POSITIVE', '99.8', 'CRITICAL', CURRENT_TIMESTAMP()),
    ('CHK_006', 'DEMO_RUN_001', 'BANKING_DW.BRONZE.STG_TRANSACTION', 'TRANSACTION_DATE', 'ACCURACY', 'FAILED', 'VALID_DATE', '88.5', 'HIGH', CURRENT_TIMESTAMP());

-- ============================================================================
-- 4. VERIFY DATA
-- ============================================================================

-- Check DQ_RUN_CONTROL
SELECT 'DQ_RUN_CONTROL' AS TABLE_NAME, COUNT(*) AS ROW_COUNT FROM DQ_RUN_CONTROL;

-- Check DQ_DAILY_SUMMARY
SELECT 'DQ_DAILY_SUMMARY' AS TABLE_NAME, COUNT(*) AS ROW_COUNT FROM DQ_DAILY_SUMMARY;

-- Check DQ_CHECK_RESULTS
SELECT 'DQ_CHECK_RESULTS' AS TABLE_NAME, COUNT(*) AS ROW_COUNT FROM DQ_CHECK_RESULTS;

-- View summary metrics
SELECT
    SUMMARY_DATE,
    TABLE_NAME,
    TOTAL_CHECKS,
    PASSED_CHECKS,
    FAILED_CHECKS,
    DQ_SCORE
FROM DQ_DAILY_SUMMARY
WHERE SUMMARY_DATE = CURRENT_DATE()
ORDER BY TABLE_NAME;

-- Calculate overall metrics (what the UI will show)
SELECT
    ROUND(AVG(DQ_SCORE), 2) AS OVERALL_QUALITY_SCORE,
    SUM(TOTAL_CHECKS) AS TOTAL_ACTIVE_CHECKS,
    SUM(PASSED_CHECKS) AS TOTAL_PASSED,
    SUM(FAILED_CHECKS) AS TOTAL_FAILED,
    ROUND((SUM(PASSED_CHECKS) * 100.0 / SUM(TOTAL_CHECKS)), 1) AS COVERAGE_PERCENT
FROM DQ_DAILY_SUMMARY
WHERE SUMMARY_DATE = CURRENT_DATE();

-- ============================================================================
-- EXPECTED DASHBOARD VALUES AFTER THIS SCRIPT:
-- ============================================================================
-- Overall Quality Score: 82%
-- Total Active Checks: 820
-- Passed Today: 675
-- Failed Today: 145
-- Coverage: 82.3%
-- ============================================================================

-- ============================================================================
-- 5. REFRESH THE UI
-- ============================================================================
-- After running this script:
-- 1. Go to http://localhost:3000
-- 2. The dashboard will automatically fetch and display these metrics
-- 3. All KPI cards will show real data
-- ============================================================================
