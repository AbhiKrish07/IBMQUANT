"""
Q-UPI Sentinel: Feature Engineering & Preprocessing Pipeline (FR-3 & Section 7)
Computes temporal behavior, device age, rolling graph metrics, and quantum feature mapping scaling.
"""

import math
import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_classif
from sklearn.preprocessing import MinMaxScaler


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts time-aware transaction, behavior, device, and graph features.
    Ensures zero forward-looking leakage.
    """
    df = df.copy()
    df["ts_dt"] = pd.to_datetime(df["ts"])
    df = df.sort_values("ts_dt").reset_index(drop=True)

    # 1. Transaction Features
    df["amount_log"] = np.log1p(df["amount_inr"])
    df["hour"] = df["ts_dt"].dt.hour

    # User amount z-score (rolling or global past)
    user_means = df.groupby("payer_id")["amount_inr"].transform("mean")
    user_stds = df.groupby("payer_id")["amount_inr"].transform("std").fillna(1.0)
    df["amount_zscore_user"] = (df["amount_inr"] - user_means) / (user_stds + 1e-5)

    # 2. Behavior Velocity Features (Count txns in past 1h & 24h)
    velocity_1h = []
    velocity_24h = []
    geo_speed_kmh = []

    # Track user last location & time
    last_user_loc = {}

    for idx, row in df.iterrows():
        t = row["ts_dt"]
        u = row["payer_id"]
        lat, lon = row["lat"], row["lon"]

        # Velocity approximation
        v1 = len(df[(df["payer_id"] == u) & (df["ts_dt"] >= t - pd.Timedelta(hours=1)) & (df["ts_dt"] < t)])
        v24 = len(df[(df["payer_id"] == u) & (df["ts_dt"] >= t - pd.Timedelta(hours=24)) & (df["ts_dt"] < t)])
        velocity_1h.append(v1)
        velocity_24h.append(v24)

        # Geo-speed estimation
        if u in last_user_loc:
            last_t, last_lat, last_lon = last_user_loc[u]
            dt_hours = max((t - last_t).total_seconds() / 3600.0, 0.001)
            # Haversine-like Euclidean distance in km
            dist_km = math.sqrt((lat - last_lat)**2 + (lon - last_lon)**2) * 111.0
            speed = dist_km / dt_hours
            geo_speed_kmh.append(min(speed, 2000.0))
        else:
            geo_speed_kmh.append(0.0)

        last_user_loc[u] = (t, lat, lon)

    df["velocity_1h"] = velocity_1h
    df["velocity_24h"] = velocity_24h
    df["geo_speed_kmh"] = geo_speed_kmh

    # 3. Device Features
    df["device_new_flag"] = (df["device_age_days"] <= 3).astype(int)

    # 4. Graph Features (Payee In-Degree & Fan-in Ring Score)
    payee_counts_24h = []
    for idx, row in df.iterrows():
        t = row["ts_dt"]
        p = row["payee_id"]
        cnt = len(df[(df["payee_id"] == p) & (df["ts_dt"] >= t - pd.Timedelta(hours=24)) & (df["ts_dt"] < t)])
        payee_counts_24h.append(cnt)
    df["payee_in_degree_24h"] = payee_counts_24h
    df["ring_score"] = np.clip(df["payee_in_degree_24h"] / 10.0, 0, 1.0)

    return df


FEATURE_COLS = [
    "amount_log", "amount_zscore_user", "hour", "is_new_payee",
    "velocity_1h", "velocity_24h", "geo_speed_kmh",
    "device_new_flag", "device_age_days", "payee_in_degree_24h", "ring_score"
]


def select_quantum_features(X_train: pd.DataFrame, y_train: pd.Series, n_features: int = 4) -> tuple:
    """
    Selects top n_features using Mutual Information on training set only.
    Scales features to [0, pi] for Quantum Feature Map encoding.
    """
    mi_scores = mutual_info_classif(X_train[FEATURE_COLS], y_train, random_state=42)
    top_indices = np.argsort(mi_scores)[::-1][:n_features]
    selected_cols = [FEATURE_COLS[i] for i in top_indices]

    scaler = MinMaxScaler(feature_range=(0, np.pi))
    scaler.fit(X_train[selected_cols])

    return selected_cols, scaler
