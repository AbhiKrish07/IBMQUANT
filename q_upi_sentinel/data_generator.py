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


def generate_synthetic_upi_data(
    n_users: int = 1000,
    n_merchants: int = 150,
    n_txns: int = 5000,
    fraud_rate: float = 0.02,
    seed: int = 42
) -> pd.DataFrame:
    """
    Generates a temporal dataset of synthetic UPI transactions.
    """
    np.random.seed(seed)
    random.seed(seed)

    user_ids = [f"usr_{i:04d}" for i in range(n_users)]
    merchant_ids = [f"mer_{i:04d}" for i in range(n_merchants)]
    devices = [f"dev_{i:05d}" for i in range(int(n_users * 1.2))]

    # User profiles
    user_devices = {u: random.choice(devices) for u in user_ids}
    user_home_lat = {u: round(random.uniform(12.8, 28.7), 4) for u in user_ids}
    user_home_lon = {u: round(random.uniform(72.8, 88.3), 4) for u in user_ids}
    user_avg_amt = {u: random.uniform(100.0, 3000.0) for u in user_ids}

    start_time = datetime(2026, 1, 1, 0, 0, 0)
    txns = []
    
    # Calculate target fraud count
    n_fraud = max(10, int(n_txns * fraud_rate))
    fraud_indices = set(random.sample(range(n_txns), n_fraud))

    # Pre-select mule accounts for ring fraud
    mule_accounts = random.sample(merchant_ids + user_ids[:50], 5)

    for i in range(n_txns):
        # Time progression across 30 days
        minutes_offset = int((i / n_txns) * 30 * 24 * 60)
        timestamp = start_time + timedelta(minutes=minutes_offset)

        payer = random.choice(user_ids)
        payee = random.choice(merchant_ids if random.random() > 0.3 else user_ids)
        while payee == payer:
            payee = random.choice(user_ids)

        amount = round(float(np.random.lognormal(mean=np.log(user_avg_amt[payer]), sigma=0.6)), 2)
        device = user_devices[payer]
        device_age = random.randint(10, 500)
        lat = user_home_lat[payer] + random.uniform(-0.05, 0.05)
        lon = user_home_lon[payer] + random.uniform(-0.05, 0.05)
        channel = random.choice(["QR_SCAN", "COLLECT_REQ", "INTENT_APP", "P2P_DIRECT"])
        is_new_payee = random.random() < 0.25

        label = 0
        fraud_type = "LEGITIMATE"

        if i in fraud_indices:
            label = 1
            ftype = random.choice(["MULE_RING", "VELOCITY_BURST", "SIM_SWAP", "IMPOSSIBLE_TRAVEL", "SOCIAL_ENGINEERING"])
            fraud_type = ftype

            if ftype == "MULE_RING":
                payee = random.choice(mule_accounts)
                amount = round(random.uniform(5000.0, 25000.0), 2)
            elif ftype == "VELOCITY_BURST":
                amount = round(random.uniform(1000.0, 5000.0), 2)
            elif ftype == "SIM_SWAP":
                device = f"dev_new_{random.randint(9000, 9999)}"
                device_age = random.randint(0, 2)
                amount = round(random.uniform(30000.0, 95000.0), 2)
            elif ftype == "IMPOSSIBLE_TRAVEL":
                lat += random.uniform(8.0, 15.0)  # Jump to different state/city
                lon += random.uniform(8.0, 15.0)
            elif ftype == "SOCIAL_ENGINEERING":
                amount = round(random.uniform(15000.0, 60000.0), 2)
                is_new_payee = True
                timestamp = timestamp.replace(hour=random.choice([1, 2, 3, 4]))

        txns.append({
            "txn_id": f"TXN_{i:06d}",
            "ts": timestamp.isoformat(),
            "payer_id": payer,
            "payee_id": payee,
            "amount_inr": amount,
            "payer_device_id": device,
            "device_age_days": device_age,
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "channel": channel,
            "is_new_payee": 1 if is_new_payee else 0,
            "label": label,
            "fraud_type": fraud_type
        })

    df = pd.DataFrame(txns)
    return df


if __name__ == "__main__":
    df = generate_synthetic_upi_data(n_txns=1000)
    print(f"Generated {len(df)} synthetic UPI transactions. Fraud count: {df['label'].sum()}")
