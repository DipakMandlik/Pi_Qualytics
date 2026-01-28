#!/usr/bin/env python3
"""
Pi-Qualytics Pure Sample Data Generator
Generates clean banking data WITHOUT intentional DQ issues for model verification.
Date: 2026-01-28
"""

import csv
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
OUTPUT_DIR = Path("pure_sample_data")
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


def generate_email(first_name, last_name):
    """Generate valid email"""
    return f"{first_name.lower()}.{last_name.lower()}@{random.choice(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'])}"


def generate_phone():
    """Generate valid phone"""
    return f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"


def generate_date(base_date, days_range):
    """Generate valid date"""
    offset = random.randint(-days_range, days_range)
    date = base_date + timedelta(days=offset)
    return date.strftime("%Y-%m-%d")


def generate_customers(count=1000):
    """Generate clean customer data"""
    print(f"Generating {count} customers...")
    customers = []
    
    for i in range(count):
        customer_id = f"CUST{str(i+1).zfill(6)}"
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        
        customer = {
            "customer_id": customer_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": generate_email(first_name, last_name),
            "phone": generate_phone(),
            "date_of_birth": generate_date(datetime(1970, 1, 1), 365 * 40),
            "country": random.choice(COUNTRIES),
            "kyc_status": random.choice(KYC_STATUSES),
            "created_date": generate_date(TODAY, 365),
            "last_updated": TODAY.strftime("%Y-%m-%d"),
        }
        customers.append(customer)
    
    return customers


def generate_accounts(customers, avg_accounts_per_customer=1.5):
    """Generate clean account data"""
    count = int(len(customers) * avg_accounts_per_customer)
    print(f"Generating {count} accounts...")
    accounts = []
    
    for i in range(count):
        # Always reference valid customers
        customer_id = random.choice(customers)["customer_id"]
        
        account = {
            "account_id": f"ACC{str(i+1).zfill(8)}",
            "customer_id": customer_id,
            "account_type": random.choice(ACCOUNT_TYPES),
            "balance": f"{random.uniform(0, 100000):.2f}",
            "currency": random.choice(CURRENCIES),
            "status": random.choice(["ACTIVE", "CLOSED", "SUSPENDED", "PENDING"]),
            "opened_date": generate_date(TODAY, 730),
            "last_transaction_date": generate_date(TODAY, 30),
        }
        accounts.append(account)
    
    return accounts


def generate_transactions(accounts, transactions_per_account=10):
    """Generate clean transaction data"""
    count = len(accounts) * transactions_per_account
    print(f"Generating {count} transactions...")
    transactions = []
    
    for i in range(count):
        account = random.choice(accounts)
        
        transaction = {
            "transaction_id": f"TXN{str(i+1).zfill(10)}",
            "account_id": account["account_id"],
            "transaction_type": random.choice(TRANSACTION_TYPES),
            "amount": f"{random.uniform(-10000, 10000):.2f}",
            "currency": account["currency"],
            "transaction_date": generate_date(TODAY, 90),
            "description": f"{random.choice(TRANSACTION_TYPES)} - {random.choice(['Online', 'ATM', 'Branch', 'Mobile'])}",
            "status": random.choice(["COMPLETED", "PENDING", "FAILED", "REVERSED"]),
        }
        transactions.append(transaction)
    
    return transactions


def generate_daily_balances(accounts, days=30):
    """Generate clean daily balance data"""
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
    """Generate clean FX rate data"""
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
            
            fx_rate = {
                "rate_id": f"FX{str(len(rates)+1).zfill(8)}",
                "from_currency": "USD",
                "to_currency": currency,
                "exchange_rate": f"{rate:.6f}",
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
    print("Pi-Qualytics Pure Sample Data Generator")
    print(f"Date: {TODAY.strftime('%Y-%m-%d')}")
    print("=" * 70)
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Generate data
    print("\n[*] Generating pure sample data (NO INTENTIONAL DQ ISSUES)...\n")
    
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
    print("[SUCCESS] Pure Data Generation Complete!")
    print("=" * 70)
    print(f"\n[OUTPUT] Directory: {OUTPUT_DIR.absolute()}")
    print(f"\n[SUMMARY]")
    print(f"   - Customers:      {len(customers):,} rows")
    print(f"   - Accounts:       {len(accounts):,} rows")
    print(f"   - Transactions:   {len(transactions):,} rows")
    print(f"   - Daily Balances: {len(daily_balances):,} rows")
    print(f"   - FX Rates:       {len(fx_rates):,} rows")
    print(f"   - Total:          {len(customers) + len(accounts) + len(transactions) + len(daily_balances) + len(fx_rates):,} rows")
    
    print(f"\n[NOTE] No intentional data quality issues were generated.")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
