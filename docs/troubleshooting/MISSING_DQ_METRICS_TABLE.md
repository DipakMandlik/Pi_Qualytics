# Critical Issue: DQ_METRICS Table Not Found

## ❌ Problem
The schema introspection cannot find the `DQ_METRICS` table, which means:

1. **The observability SQL hasn't been run yet**, OR
2. **The schema reader isn't looking in the right database**

## 🔧 Solution

### Step 1: Create the Observability Tables

Run this SQL in Snowflake:

```sql
-- Execute the observability setup
@sql/setup_antigravity_observability_robust.sql
```

This will create:
- `DATA_QUALITY_DB.DB_METRICS.DQ_METRICS` table
- `DATA_QUALITY_DB.DB_METRICS.DQ_AI_INSIGHTS` table
- All views and procedures

### Step 2: Verify Tables Exist

```sql
-- Check if tables exist
SHOW TABLES IN SCHEMA DATA_QUALITY_DB.DB_METRICS;

-- Check DQ_METRICS specifically
SELECT COUNT(*) FROM DATA_QUALITY_DB.DB_METRICS.DQ_METRICS;
```

### Step 3: Seed Demo Data (Optional)

```sql
-- Add some test data
@sql/seed_demo_data.sql
```

## 📋 Quick Verification

Run this in Snowflake to check:

```sql
-- Should return table info
DESC TABLE DATA_QUALITY_DB.DB_METRICS.DQ_METRICS;

-- Should show columns
SELECT COLUMN_NAME 
FROM DATA_QUALITY_DB.INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'DB_METRICS'
  AND TABLE_NAME = 'DQ_METRICS';
```

## 🎯 Expected Columns

After running the setup, `DQ_METRICS` should have:
- METRIC_ID
- ASSET_ID
- COLUMN_NAME
- METRIC_NAME
- METRIC_VALUE
- METRIC_TEXT
- METRIC_TIME
- SOURCE_SYSTEM
- TAGS
- CREATED_AT

## ⚠️ If Tables Don't Exist

You need to run the SQL setup files in this order:

1. `sql/setup_antigravity_observability.sql` (base setup)
2. `sql/setup_antigravity_observability_robust.sql` (enhanced version)
3. `sql/seed_demo_data.sql` (optional test data)

## 🚀 After Creating Tables

1. Restart your app
2. Try generating insights again
3. The schema introspection should now find the tables

---

**Action Required**: Run the observability SQL in Snowflake first!
