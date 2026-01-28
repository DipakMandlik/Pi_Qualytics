#!/usr/bin/env python3
"""
Pi-Qualytics Sample Data Generator
Generates realistic banking data with intentional DQ issues for testing
Date: 2026-01-22
"""

import csv
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
OUTPUT_DIR = Path("sample_data")
TODAY = datetime(2026, 1, 22)

# Sample data pools
FIRST_NAMES = ["John", "Jane", "Michael", "Sarah", "David", "Emma", "Robert", "Lisa", "William", "Mary",
               "James", "Patricia", "Richard", "Jennifer", "Thomas", "Linda", "Charles", "Barbara"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
              "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore"]
COUNTRIES = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Japan", "India"]
KYC_STATUSES = ["VERIFIED", "PENDING", "REJECTED", "EXPIRED", "NOT_STARTED"]
ACCOUNT_TYPES = ["SAVINGS", "CHECKING", "CREDIT", "INVESTMENT", "LOAN"]
TRANSACTION_TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT", "FEE", "INTEREST"]
CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"]


def generate_email(first_name, last_name, add_issue=False):
    """Generate email with optional DQ issues"""
    if add_issue and random.random() < 0.15:  # 15% bad emails
        return random.choice([
            f"{first_name.lower()}@",  # Missing domain
            f"{first_name.lower()}.{last_name.lower()}",  # Missing @
            f"{first_name.lower()}@invalid",  # Invalid domain
            "",  # Empty
        ])
    return f"{first_name.lower()}.{last_name.lower()}@{random.choice(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'])}"


def generate_phone(add_issue=False):
    """Generate phone with optional DQ issues"""
    if add_issue and random.random() < 0.10:  # 10% bad phones
        return random.choice([
            "123",  # Too short
            "12345678901234567890",  # Too long
            "ABC-DEF-GHIJ",  # Invalid format
            "",  # Empty
        ])
    return f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"


def generate_date(base_date, days_range, add_issue=False):
    """Generate date with optional DQ issues"""
    if add_issue and random.random() < 0.05:  # 5% bad dates
        return random.choice([
            "2026-13-45",  # Invalid month/day
            "NOT_A_DATE",  # Invalid format
            "2099-12-31",  # Future date
            "",  # Empty
        ])
    offset = random.randint(-days_range, days_range)
    date = base_date + timedelta(days=offset)
    return date.strftime("%Y-%m-%d")


def generate_customers(count=1000):
    """Generate customer data"""
    print(f"Generating {count} customers...")
    customers = []
    
    for i in range(count):
        customer_id = f"CUST{str(i+1).zfill(6)}"
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        
        # Intentional DQ issues
        add_issues = random.random() < 0.20  # 20% of records have issues
        
        customer = {
            "customer_id": customer_id if random.random() > 0.01 else "",  # 1% missing IDs
            "first_name": first_name if random.random() > 0.05 else "",  # 5% missing names
            "last_name": last_name if random.random() > 0.05 else "",
            "email": generate_email(first_name, last_name, add_issues),
            "phone": generate_phone(add_issues),
            "date_of_birth": generate_date(datetime(1970, 1, 1), 365 * 40, add_issues),
            "country": random.choice(COUNTRIES) if random.random() > 0.03 else "",  # 3% missing
            "kyc_status": random.choice(KYC_STATUSES),
            "created_date": generate_date(TODAY, 365, False),
            "last_updated": TODAY.strftime("%Y-%m-%d"),
        }
        customers.append(customer)
    
    return customers


def generate_accounts(customers, avg_accounts_per_customer=1.5):
    """Generate account data"""
    count = int(len(customers) * avg_accounts_per_customer)
    print(f"Generating {count} accounts...")
    accounts = []
    
    for i in range(count):
        # Some accounts reference invalid customers (orphaned records)
        if random.random() < 0.05:  # 5% orphaned
            customer_id = f"CUST{random.randint(900000, 999999)}"
        else:
            customer_id = random.choice(customers)["customer_id"]
        
        account = {
            "account_id": f"ACC{str(i+1).zfill(8)}" if random.random() > 0.01 else "",  # 1% missing
            "customer_id": customer_id,
            "account_type": random.choice(ACCOUNT_TYPES),
            "balance": f"{random.uniform(0, 100000):.2f}",
            "currency": random.choice(CURRENCIES),
            "status": random.choice(["ACTIVE", "CLOSED", "SUSPENDED", "PENDING"]),
            "opened_date": generate_date(TODAY, 730, False),
            "last_transaction_date": generate_date(TODAY, 30, False),
        }
        accounts.append(account)
    
    return accounts


def generate_transactions(accounts, transactions_per_account=10):
    """Generate transaction data"""
    count = len(accounts) * transactions_per_account
    print(f"Generating {count} transactions...")
    transactions = []
    
    for i in range(count):
        account = random.choice(accounts)
        
        transaction = {
            "transaction_id": f"TXN{str(i+1).zfill(10)}" if random.random() > 0.01 else "",  # 1% missing
            "account_id": account["account_id"],
            "transaction_type": random.choice(TRANSACTION_TYPES),
            "amount": f"{random.uniform(-10000, 10000):.2f}",
            "currency": account["currency"],
            "transaction_date": generate_date(TODAY, 90, False),
            "description": f"{random.choice(TRANSACTION_TYPES)} - {random.choice(['Online', 'ATM', 'Branch', 'Mobile'])}",
            "status": random.choice(["COMPLETED", "PENDING", "FAILED", "REVERSED"]),
        }
        transactions.append(transaction)
    
    return transactions


def generate_daily_balances(accounts, days=30):
    """Generate daily balance data"""
    count = len(accounts) * days
    print(f"Generating {count} daily balance records...")
    balances = []
    
    for account in accounts:
        base_balance = float(account["balance"])
        
        for day in range(days):
            date = TODAY - timedelta(days=day)
            daily_change = random.uniform(-1000, 1000)
            
            balance = {
                "balance_id": f"BAL{str(len(balances)+1).zfill(10)}",
                "account_id": account["account_id"],
                "balance_date": date.strftime("%Y-%m-%d"),
                "opening_balance": f"{base_balance:.2f}",
                "closing_balance": f"{base_balance + daily_change:.2f}",
                "currency": account["currency"],
            }
            balances.append(balance)
            base_balance += daily_change
    
    return balances


def generate_fx_rates(days=90):
    """Generate FX rate data"""
    print(f"Generating {days} days of FX rates...")
    rates = []
    base_rates = {
        "EUR": 1.10, "GBP": 1.27, "JPY": 0.0091, "CAD": 0.74,
        "AUD": 0.66, "CHF": 1.12, "CNY": 0.14
    }
    
    for day in range(days):
        date = TODAY - timedelta(days=day)
        
        for currency, base_rate in base_rates.items():
            # Add some volatility
            rate = base_rate * random.uniform(0.95, 1.05)
            
            # Intentional DQ issues
            add_issue = random.random() < 0.05  # 5% bad rates
            
            fx_rate = {
                "rate_id": f"FX{str(len(rates)+1).zfill(8)}",
                "from_currency": "USD",
                "to_currency": currency,
                "exchange_rate": f"{rate:.6f}" if not add_issue else random.choice(["", "-1.0", "999999.0"]),
                "rate_date": date.strftime("%Y-%m-%d"),
                "source": random.choice(["CENTRAL_BANK", "MARKET", "MANUAL"]),
            }
            rates.append(fx_rate)
    
    return rates


def write_csv(filename, data, fieldnames):
    """Write data to CSV file"""
    filepath = OUTPUT_DIR / filename
    print(f"Writing {filepath}...")
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"[OK] Created {filepath} ({len(data)} rows)")


def main():
    """Main execution"""
    print("=" * 70)
    print("Pi-Qualytics Sample Data Generator")
    print(f"Date: {TODAY.strftime('%Y-%m-%d')}")
    print("=" * 70)
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Generate data
    print("\n[*] Generating sample data with intentional DQ issues...\n")
    
    customers = generate_customers(1000)
    accounts = generate_accounts(customers, 1.5)
    transactions = generate_transactions(accounts, 10)
    daily_balances = generate_daily_balances(accounts, 30)
    fx_rates = generate_fx_rates(90)
    
    # Write CSV files
    print("\n[*] Writing CSV files...\n")
    
    write_csv("customer.csv", customers, [
        "customer_id", "first_name", "last_name", "email", "phone",
        "date_of_birth", "country", "kyc_status", "created_date", "last_updated"
    ])
    
    write_csv("account.csv", accounts, [
        "account_id", "customer_id", "account_type", "balance",
        "currency", "status", "opened_date", "last_transaction_date"
    ])
    
    write_csv("transaction.csv", transactions, [
        "transaction_id", "account_id", "transaction_type", "amount",
        "currency", "transaction_date", "description", "status"
    ])
    
    write_csv("daily_balance.csv", daily_balances, [
        "balance_id", "account_id", "balance_date", "opening_balance",
        "closing_balance", "currency"
    ])
    
    write_csv("fx_rate.csv", fx_rates, [
        "rate_id", "from_currency", "to_currency", "exchange_rate",
        "rate_date", "source"
    ])
    
    # Summary
    print("\n" + "=" * 70)
    print("[SUCCESS] Data Generation Complete!")
    print("=" * 70)
    print(f"\n[OUTPUT] Directory: {OUTPUT_DIR.absolute()}")
    print(f"\n[SUMMARY]")
    print(f"   - Customers:      {len(customers):,} rows")
    print(f"   - Accounts:       {len(accounts):,} rows")
    print(f"   - Transactions:   {len(transactions):,} rows")
    print(f"   - Daily Balances: {len(daily_balances):,} rows")
    print(f"   - FX Rates:       {len(fx_rates):,} rows")
    print(f"   - Total:          {len(customers) + len(accounts) + len(transactions) + len(daily_balances) + len(fx_rates):,} rows")
    
    print(f"\n[WARNING] Data Quality Issues Included:")
    print(f"   - ~20% of customers have email/phone issues")
    print(f"   - ~5% of accounts are orphaned (invalid customer_id)")
    print(f"   - ~1% of records have missing IDs")
    print(f"   - ~5% of dates are invalid or future dates")
    print(f"   - ~5% of FX rates are invalid")
    
    print(f"\n[NEXT STEPS]")
    print(f"   1. Upload CSV files from '{OUTPUT_DIR}/' to Snowflake stage")
    print(f"   2. Run: 02_Data_Loading.sql")
    print(f"   3. Run DQ checks to detect the issues!")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
