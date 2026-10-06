"""
Q-UPI Sentinel: Synthetic Data Generator (FR-1 & FR-2)
Generates realistic UPI-style transaction datasets with 5 distinct fraud typologies:
1. Mule Ring (fan-in then fan-out)
2. Velocity Burst (rapid transactions)
3. SIM-swap / New-device takeover (large transfer on fresh device)
4. Impossible Travel (implausible velocity across locations)
5. Social-Engineering Payment (unusual hour, first-time payee)
"""

import math
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta


import os
from sklearn.preprocessing import minmax_scale


def generate_seeded_synthetic_upi_data(n_txns: int = 1500, fraud_rate: float = 0.04, seed: int = 42) -> pd.DataFrame:
    """Create deterministic, clearly synthetic UPI-style records for the demo."""
    rng = np.random.default_rng(seed)
    fraud_count = max(1, int(round(n_txns * fraud_rate)))
    labels = np.zeros(n_txns, dtype=int)
    labels[:fraud_count] = 1
    rng.shuffle(labels)
    timestamps = pd.date_range("2026-01-01", periods=n_txns, freq="min")
    amounts = rng.lognormal(mean=7.3, sigma=.7, size=n_txns)
    amounts[labels == 1] *= rng.uniform(3, 10, size=fraud_count)
    fraud_types = np.where(labels == 1, rng.choice(
        ["mule ring", "velocity burst", "sim swap", "impossible travel", "social engineering"],
        size=n_txns), "legitimate")
    return pd.DataFrame({
        "txn_id": [f"SYN-{seed}-{i:05d}" for i in range(n_txns)],
        "payer_id": [f"payer{rng.integers(1, 301)}@upi" for _ in range(n_txns)],
        "payee_id": [f"merchant{rng.integers(1, 151)}@upi" for _ in range(n_txns)],
        "amount_inr": amounts.round(2), "ts": timestamps.astype(str),
        "lat": rng.normal(19.07, .25, n_txns), "lon": rng.normal(72.88, .25, n_txns),
        "is_new_payee": np.where(labels == 1, 1, rng.binomial(1, .12, n_txns)),
        "device_age_days": np.where(labels == 1, rng.integers(0, 4, n_txns), rng.integers(7, 720, n_txns)),
        "fraud_type": fraud_types, "label": labels,
    })

def generate_synthetic_upi_data(
    n_users: int = 1000,
    n_merchants: int = 150,
    n_txns: int = 5000,
    fraud_rate: float = 0.02,
    seed: int = 42
) -> pd.DataFrame:
    """
    Hybrid Adapter: Loads real Kaggle Credit Fraud dataset and maps top V-features 
    into our intuitive Q-UPI Sentinel UI variables for dynamic frontend evaluation.
    """
    np.random.seed(seed)
    
    # Load Real Dataset
    data_path = "./data/creditcard.csv"
    if not os.path.exists(data_path):
        data_path = "/Users/abhivalo360gmail.com/.cache/kagglehub/datasets/mlg-ulb/creditcardfraud/versions/3/creditcard.csv"
        
    try:
        df = pd.read_csv(data_path)
    except:
        print("Warning: creditcard.csv not found, falling back to basic mock data.")
        return pd.DataFrame({"label": [0, 1]*50, "amount_inr": [100]*100, "is_new_payee": [0]*100, "device_age_days": [10]*100, "lat": [12.0]*100, "lon": [77.0]*100, "ts": ["2026-01-01T00:00:00"]*100, "payer_id": ["1"]*100})
        
    # Build the requested volume and class mix.  Previously these arguments were
    # ignored and the dashboard always received the same 1,968-row 3:1 sample.
    fraud_df = df.loc[df['Class'] == 1]
    non_fraud_df = df.loc[df['Class'] == 0]
    fraud_count = max(1, min(int(round(n_txns * fraud_rate)), n_txns - 1))
    legit_count = n_txns - fraud_count
    sampled_fraud = fraud_df.sample(n=fraud_count, replace=fraud_count > len(fraud_df), random_state=seed)
    sampled_legit = non_fraud_df.sample(n=legit_count, replace=False, random_state=seed)
    balanced_df = pd.concat([sampled_fraud, sampled_legit]).sample(frac=1, random_state=seed).reset_index(drop=True)
    
    # Map Kaggle V-Features -> Q-UPI UI Features
    # V14, V12, V10, V4, V11 are most highly correlated with fraud
    txns = []
    
    # Precompute scaled bounds for realistic UI mapping
    v14_scaled = minmax_scale(balanced_df['V14'].values) # 0 to 1
    v12_scaled = minmax_scale(balanced_df['V12'].values)
    v10_scaled = minmax_scale(balanced_df['V10'].values)
    v4_scaled = minmax_scale(balanced_df['V4'].values)
    
    start_time = datetime(2026, 1, 1, 0, 0, 0)
    
    for i in range(len(balanced_df)):
        row = balanced_df.iloc[i]
        
        # Fraud features mapped to UI features
        amount_inr = row['Amount'] * 85.0 # Convert USD to INR
        if amount_inr < 10: amount_inr = random.uniform(500, 5000)
        
        # V14 is highly negative for fraud. Map low V14 to HIGH velocity (fraud)
        vel_score = 1.0 - v14_scaled[i]
        
        # V12 is negative for fraud. Map low V12 to NEW device (fraud)
        dev_age = int(v12_scaled[i] * 500)
        
        # V10 is negative for fraud. Map low V10 to high geo speed (impossible travel)
        geo_speed = (1.0 - v10_scaled[i]) * 800.0 
        lat = 12.0 + geo_speed/100.0
        
        # V4 is positive for fraud. Map high V4 to New Payee
        is_new_payee = 1 if v4_scaled[i] > 0.6 else 0
        
        minutes_offset = int((row['Time'] / 3600.0) * 60)
        timestamp = start_time + timedelta(minutes=minutes_offset)

        txns.append({
            "txn_id": f"TXN_{i:06d}",
            "ts": timestamp.isoformat(),
            "payer_id": f"usr_{random.randint(1,100)}",
            "payee_id": f"mer_{random.randint(1,100)}",
            "amount_inr": amount_inr,
            "payer_device_id": f"dev_{random.randint(1,100)}",
            "device_age_days": dev_age,
            "lat": lat,
            "lon": 77.0,
            "channel": "UPI",
            "is_new_payee": is_new_payee,
            "label": int(row['Class']),
            "fraud_type": "KAGGLE_ANOMALY" if row['Class'] == 1 else "LEGITIMATE"
        })

    return pd.DataFrame(txns)


if __name__ == "__main__":
    df = generate_synthetic_upi_data(n_txns=1000)
    print(f"Generated {len(df)} synthetic UPI transactions. Fraud count: {df['label'].sum()}")
