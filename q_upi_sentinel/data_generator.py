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



def load_ibm_aml_dataset(n_txns: int = 1500, fraud_rate: float = 0.04, seed: int = 42) -> pd.DataFrame:
    """
    Load IBM Transactions for Anti-Money Laundering (AML) dataset from Kaggle.
    Maps graph-based laundering features to Q-UPI Sentinel feature schema.
    Reference: ealtman2019/ibm-transactions-for-anti-money-laundering-aml
    """
    np.random.seed(seed)
    try:
        import kagglehub
        from kagglehub import KaggleDatasetAdapter
        df = kagglehub.load_dataset(
            KaggleDatasetAdapter.PANDAS,
            "ealtman2019/ibm-transactions-for-anti-money-laundering-aml",
            "",
        )
        print(f"[IBM AML] Loaded {len(df)} rows from Kaggle dataset.")
    except Exception as e:
        print(f"[IBM AML] Kaggle load failed ({e}), using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    # Column normalisation: dataset uses various naming conventions across releases
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    label_col = next((c for c in df.columns if "laundering" in c or "is_laundering" in c or c == "label"), None)
    amount_col = next((c for c in df.columns if "amount" in c), None)
    if label_col is None or amount_col is None:
        print("[IBM AML] Could not identify label/amount columns, using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    fraud_df = df[df[label_col] == 1]
    legit_df  = df[df[label_col] == 0]
    fraud_count = max(1, min(int(round(n_txns * fraud_rate)), n_txns - 1))
    legit_count = n_txns - fraud_count
    rng = np.random.default_rng(seed)
    sampled = pd.concat([
        fraud_df.sample(n=min(fraud_count, len(fraud_df)), replace=fraud_count > len(fraud_df), random_state=seed),
        legit_df.sample(n=min(legit_count, len(legit_df)), replace=legit_count > len(legit_df), random_state=seed),
    ]).sample(frac=1, random_state=seed).reset_index(drop=True)

    rows = []
    for i, row in sampled.iterrows():
        amt = float(row.get(amount_col, 1000)) * 85.0  # USD -> INR approx
        rows.append({
            "txn_id": f"IBM-{seed}-{i:06d}",
            "ts": pd.Timestamp("2026-01-01") + pd.Timedelta(minutes=int(i)),
            "payer_id": str(row.get("from_id", row.get("from_account", f"payer{rng.integers(1,301)}"))),
            "payee_id": str(row.get("to_id", row.get("to_account", f"merchant{rng.integers(1,151)}"))),
            "amount_inr": max(1.0, round(amt, 2)),
            "device_age_days": int(rng.integers(0, 720)),
            "lat": float(rng.normal(19.07, 0.25)),
            "lon": float(rng.normal(72.88, 0.25)),
            "is_new_payee": int(rng.binomial(1, 0.2)),
            "label": int(row[label_col]),
            "fraud_type": "AML_LAUNDERING" if row[label_col] == 1 else "legitimate",
        })
    return pd.DataFrame(rows)


def load_berkan_aml_dataset(n_txns: int = 1500, fraud_rate: float = 0.04, seed: int = 42) -> pd.DataFrame:
    """
    Load Berkanoztas Synthetic Transaction Monitoring (AML) dataset from Kaggle.
    Maps columns to Q-UPI Sentinel feature schema.
    Reference: berkanoztas/synthetic-transaction-monitoring-dataset-aml
    """
    np.random.seed(seed)
    try:
        import kagglehub
        from kagglehub import KaggleDatasetAdapter
        df = kagglehub.load_dataset(
            KaggleDatasetAdapter.PANDAS,
            "berkanoztas/synthetic-transaction-monitoring-dataset-aml",
            "",
        )
        print(f"[BERKAN AML] Loaded {len(df)} rows from Kaggle dataset.")
    except Exception as e:
        print(f"[BERKAN AML] Kaggle load failed ({e}), using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    label_col = next((c for c in df.columns if "fraud" in c or "label" in c or "aml" in c), None)
    amount_col = next((c for c in df.columns if "amount" in c), None)
    if label_col is None or amount_col is None:
        print("[BERKAN AML] Could not identify label/amount columns, using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    fraud_df = df[df[label_col] == 1]
    legit_df  = df[df[label_col] == 0]
    fraud_count = max(1, min(int(round(n_txns * fraud_rate)), n_txns - 1))
    legit_count = n_txns - fraud_count
    rng = np.random.default_rng(seed)
    sampled = pd.concat([
        fraud_df.sample(n=min(fraud_count, len(fraud_df)), replace=fraud_count > len(fraud_df), random_state=seed),
        legit_df.sample(n=min(legit_count, len(legit_df)), replace=legit_count > len(legit_df), random_state=seed),
    ]).sample(frac=1, random_state=seed).reset_index(drop=True)

    rows = []
    for i, row in sampled.iterrows():
        amt = float(row.get(amount_col, 1000))
        if amt < 10:
            amt *= 85.0  # assume USD
        rows.append({
            "txn_id": f"BRK-{seed}-{i:06d}",
            "ts": pd.Timestamp("2026-01-01") + pd.Timedelta(minutes=int(i)),
            "payer_id": str(row.get("sender_id", row.get("payer_id", f"payer{rng.integers(1,301)}"))),
            "payee_id": str(row.get("receiver_id", row.get("payee_id", f"merchant{rng.integers(1,151)}"))),
            "amount_inr": max(1.0, round(amt, 2)),
            "device_age_days": int(row.get("account_age_days", rng.integers(0, 720))),
            "lat": float(rng.normal(19.07, 0.25)),
            "lon": float(rng.normal(72.88, 0.25)),
            "is_new_payee": int(row.get("is_new_beneficiary", rng.binomial(1, 0.2))),
            "label": int(row[label_col]),
            "fraud_type": "AML_SYNTHETIC" if row[label_col] == 1 else "legitimate",
        })
    return pd.DataFrame(rows)



def load_ieee_cis_dataset(n_txns: int = 1500, fraud_rate: float = 0.04, seed: int = 42) -> pd.DataFrame:
    """
    Load IEEE-CIS Fraud Detection dataset from Kaggle.
    Large, real-world e-commerce fraud detection dataset.
    Reference: ieee-fraud-detection (Vesta Corporation)
    """
    np.random.seed(seed)
    try:
        import kagglehub
        from kagglehub import KaggleDatasetAdapter
        df = kagglehub.load_dataset(
            KaggleDatasetAdapter.PANDAS,
            "ieee-fraud-detection/ieee-fraud-detection",
            "",
        )
        print(f"[IEEE-CIS] Loaded {len(df)} rows from Kaggle dataset.")
    except Exception as e:
        print(f"[IEEE-CIS] Kaggle load failed ({e}), using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    label_col = next((c for c in df.columns if "isfraud" in c or "fraud" in c or c == "label"), None)
    amount_col = next((c for c in df.columns if "transactionamt" in c or "amount" in c), None)
    if label_col is None or amount_col is None:
        print("[IEEE-CIS] Could not identify label/amount columns, using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    fraud_df = df[df[label_col] == 1]
    legit_df = df[df[label_col] == 0]
    fraud_count = max(1, min(int(round(n_txns * fraud_rate)), n_txns - 1))
    legit_count = n_txns - fraud_count
    rng = np.random.default_rng(seed)
    sampled = pd.concat([
        fraud_df.sample(n=min(fraud_count, len(fraud_df)), replace=fraud_count > len(fraud_df), random_state=seed),
        legit_df.sample(n=min(legit_count, len(legit_df)), replace=legit_count > len(legit_df), random_state=seed),
    ]).sample(frac=1, random_state=seed).reset_index(drop=True)

    rows = []
    for i, row in sampled.iterrows():
        amt = float(row.get(amount_col, 1000)) * 85.0
        rows.append({
            "txn_id": f"IEEE-{seed}-{i:06d}",
            "ts": pd.Timestamp("2026-01-01") + pd.Timedelta(minutes=int(i)),
            "payer_id": str(row.get("card1", f"payer{rng.integers(1,301)}")),
            "payee_id": f"merchant{rng.integers(1,151)}",
            "amount_inr": max(1.0, round(amt, 2)),
            "device_age_days": int(rng.integers(0, 720)),
            "lat": float(rng.normal(19.07, 0.25)),
            "lon": float(rng.normal(72.88, 0.25)),
            "is_new_payee": int(rng.binomial(1, 0.2)),
            "label": int(row[label_col]),
            "fraud_type": "IEEE_CIS_FRAUD" if row[label_col] == 1 else "legitimate",
        })
    return pd.DataFrame(rows)


def load_paysim_dataset(n_txns: int = 1500, fraud_rate: float = 0.04, seed: int = 42) -> pd.DataFrame:
    """
    Load PaySim Mobile Money Simulator dataset from Kaggle.
    Synthetic mobile money laundering detection dataset.
    Reference: ealaxi/paysim1
    """
    np.random.seed(seed)
    try:
        import kagglehub
        from kagglehub import KaggleDatasetAdapter
        df = kagglehub.load_dataset(
            KaggleDatasetAdapter.PANDAS,
            "ealaxi/paysim1",
            "",
        )
        print(f"[PAYSIM] Loaded {len(df)} rows from Kaggle dataset.")
    except Exception as e:
        print(f"[PAYSIM] Kaggle load failed ({e}), using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    label_col = next((c for c in df.columns if "isfraud" in c or "fraud" in c or c == "label"), None)
    amount_col = next((c for c in df.columns if "amount" in c), None)
    if label_col is None or amount_col is None:
        print("[PAYSIM] Could not identify label/amount columns, using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    fraud_df = df[df[label_col] == 1]
    legit_df = df[df[label_col] == 0]
    fraud_count = max(1, min(int(round(n_txns * fraud_rate)), n_txns - 1))
    legit_count = n_txns - fraud_count
    rng = np.random.default_rng(seed)
    sampled = pd.concat([
        fraud_df.sample(n=min(fraud_count, len(fraud_df)), replace=fraud_count > len(fraud_df), random_state=seed),
        legit_df.sample(n=min(legit_count, len(legit_df)), replace=legit_count > len(legit_df), random_state=seed),
    ]).sample(frac=1, random_state=seed).reset_index(drop=True)

    rows = []
    for i, row in sampled.iterrows():
        amt = float(row.get(amount_col, 1000))
        if amt < 10:
            amt *= 85.0
        rows.append({
            "txn_id": f"PAY-{seed}-{i:06d}",
            "ts": pd.Timestamp("2026-01-01") + pd.Timedelta(minutes=int(i)),
            "payer_id": str(row.get("nameorig", f"payer{rng.integers(1,301)}")),
            "payee_id": str(row.get("namedest", f"merchant{rng.integers(1,151)}")),
            "amount_inr": max(1.0, round(amt, 2)),
            "device_age_days": int(rng.integers(0, 720)),
            "lat": float(rng.normal(19.07, 0.25)),
            "lon": float(rng.normal(72.88, 0.25)),
            "is_new_payee": int(rng.binomial(1, 0.15)),
            "label": int(row[label_col]),
            "fraud_type": "PAYSIM_MOBILE" if row[label_col] == 1 else "legitimate",
        })
    return pd.DataFrame(rows)


def load_bank_fraud_dataset(n_txns: int = 1500, fraud_rate: float = 0.04, seed: int = 42) -> pd.DataFrame:
    """
    Load Bank Account Fraud dataset (NeurIPS 2022 tabular benchmark) from Kaggle.
    Reference: sgpjesus/bank-account-fraud-dataset-neurips-2022
    """
    np.random.seed(seed)
    try:
        import kagglehub
        from kagglehub import KaggleDatasetAdapter
        df = kagglehub.load_dataset(
            KaggleDatasetAdapter.PANDAS,
            "sgpjesus/bank-account-fraud-dataset-neurips-2022",
            "",
        )
        print(f"[BANK FRAUD] Loaded {len(df)} rows from Kaggle dataset.")
    except Exception as e:
        print(f"[BANK FRAUD] Kaggle load failed ({e}), using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    label_col = next((c for c in df.columns if "fraud" in c or "label" in c or c == "fraud_bool"), None)
    amount_col = next((c for c in df.columns if "income" in c or "amount" in c or "credit" in c), None)
    if label_col is None:
        print("[BANK FRAUD] Could not identify label column, using synthetic fallback.")
        return generate_seeded_synthetic_upi_data(n_txns=n_txns, fraud_rate=fraud_rate, seed=seed)

    fraud_df = df[df[label_col] == 1]
    legit_df = df[df[label_col] == 0]
    fraud_count = max(1, min(int(round(n_txns * fraud_rate)), n_txns - 1))
    legit_count = n_txns - fraud_count
    rng = np.random.default_rng(seed)
    sampled = pd.concat([
        fraud_df.sample(n=min(fraud_count, len(fraud_df)), replace=fraud_count > len(fraud_df), random_state=seed),
        legit_df.sample(n=min(legit_count, len(legit_df)), replace=legit_count > len(legit_df), random_state=seed),
    ]).sample(frac=1, random_state=seed).reset_index(drop=True)

    rows = []
    for i, row in sampled.iterrows():
        amt = float(row.get(amount_col, 5000)) if amount_col else float(rng.lognormal(8, 1))
        if amt < 100:
            amt *= 85.0
        rows.append({
            "txn_id": f"BNK-{seed}-{i:06d}",
            "ts": pd.Timestamp("2026-01-01") + pd.Timedelta(minutes=int(i)),
            "payer_id": f"acct{rng.integers(1,5001)}",
            "payee_id": f"bank{rng.integers(1,151)}",
            "amount_inr": max(1.0, round(amt, 2)),
            "device_age_days": int(row.get("days_since_request", rng.integers(0, 720))),
            "lat": float(rng.normal(19.07, 0.25)),
            "lon": float(rng.normal(72.88, 0.25)),
            "is_new_payee": int(rng.binomial(1, 0.2)),
            "label": int(row[label_col]),
            "fraud_type": "BANK_ACCT_FRAUD" if row[label_col] == 1 else "legitimate",
        })
    return pd.DataFrame(rows)


if __name__ == "__main__":
    df = generate_synthetic_upi_data(n_txns=1000)
    print(f"Generated {len(df)} synthetic UPI transactions. Fraud count: {df['label'].sum()}")
