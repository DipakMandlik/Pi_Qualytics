# Sample Data Generator

This script generates realistic banking sample data with intentional data quality issues for testing the Pi-Qualytics DQ framework.

## 🎯 Purpose

Generate CSV files for all 5 Bronze layer tables with:
- Realistic banking data
- Intentional DQ issues (20% of records)
- Today's date (2026-01-22)

## 📊 Generated Files

| File | Records | Description |
|------|---------|-------------|
| `customer.csv` | 1,000 | Customer master data |
| `account.csv` | 1,500 | Bank accounts |
| `transaction.csv` | 15,000 | Financial transactions |
| `daily_balance.csv` | 45,000 | Daily account balances (30 days) |
| `fx_rate.csv` | 630 | Foreign exchange rates (90 days, 7 currencies) |

**Total**: ~63,000 rows

## 🚀 Usage

```bash
# Run the script
python scripts/generate_sample_data.py

# Output will be in sample_data/ directory
```

## ⚠️ Intentional DQ Issues

The script includes realistic data quality issues for testing:

- **20% of customers** have email/phone format issues
- **5% of accounts** are orphaned (invalid customer_id)
- **1% of records** have missing primary keys
- **5% of dates** are invalid or future dates
- **5% of FX rates** are invalid (negative, empty, or extreme values)

## 📁 Output

```
sample_data/
├── customer.csv
├── account.csv
├── transaction.csv
├── daily_balance.csv
└── fx_rate.csv
```

## 🔄 Next Steps

1. **Upload to Snowflake**:
   ```sql
   PUT file://sample_data/*.csv @BANKING_DW.BRONZE.CSV_STAGE;
   ```

2. **Load data**:
   ```sql
   -- Run 02_Data_Loading.sql
   ```

3. **Run DQ checks**:
   ```sql
   CALL DATA_QUALITY_DB.DQ_ENGINE.SP_EXECUTE_DQ_CHECKS(NULL, NULL, 'FULL');
   ```

4. **View results**:
   ```sql
   SELECT * FROM DATA_QUALITY_DB.DQ_METRICS.DQ_CHECK_RESULTS
   ORDER BY CHECK_TIMESTAMP DESC LIMIT 20;
   ```

## 🎓 Customization

Edit the script to adjust:
- Number of records: `generate_customers(1000)`
- Date range: `TODAY = datetime(2026, 1, 22)`
- DQ issue percentage: `random.random() < 0.20`
- Sample data pools: `FIRST_NAMES`, `COUNTRIES`, etc.

---

**Generated**: 2026-01-22  
**Script**: `generate_sample_data.py`
