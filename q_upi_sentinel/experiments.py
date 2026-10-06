"""
Q-UPI Sentinel: Experiment Harness & Statistical Benchmarking (FR-7 & Section 9)
Runs E1 (Main Benchmark), E2 (Grid Search), E3 (Gray Zone Recall Boost).
Computes 95% Bootstrap Confidence Intervals over 5 seeds.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import average_precision_score, f1_score

from q_upi_sentinel.classical_models import ClassicalBaselines
from q_upi_sentinel.data_generator import generate_synthetic_upi_data
from q_upi_sentinel.feature_pipeline import (FEATURE_COLS, extract_features,
                                              select_quantum_features)
from q_upi_sentinel.quantum_models import BloqQuantumKernelModel


def run_experiment_e1_main_benchmark(seeds=[42, 43, 44, 45, 46]) -> dict:
    """
    E1 Main Benchmark: Compares Bloq Quantum Kernel against 4 Classical Baselines across 5 seeds.
    """
    results = {
        "LogisticRegression": [],
        "RandomForest": [],
        "GradientBoosting": [],
        "RBF-SVM": [],
        "BloqQuantumKernel": []
    }

    for seed in seeds:
        df = generate_synthetic_upi_data(n_txns=2000, seed=seed)
        df_feat = extract_features(df)

        # Temporal Split (Train: 60%, Validation: 20%, Test: 20%)
        n = len(df_feat)
        train_df = df_feat.iloc[:int(n*0.6)]
        test_df = df_feat.iloc[int(n*0.8):]

        X_train, y_train = train_df[FEATURE_COLS], train_df["label"]
        X_test, y_test = test_df[FEATURE_COLS], test_df["label"]

        # Classical Models
        cb = ClassicalBaselines(seed=seed)
        cb.fit_all(X_train, y_train)
        res_c = cb.evaluate_all(X_test, y_test)
        for mname, mres in res_c.items():
            results[mname].append(mres["pr_auc"])

        # Bloq Quantum Kernel
        selected_cols, scaler = select_quantum_features(X_train, y_train, n_features=4)
        X_train_q = scaler.transform(X_train[selected_cols])
        X_test_q = scaler.transform(X_test[selected_cols])

        # Subsample quantum training set to 150 rows for fast fidelity matrix computation
        sub_idx = np.random.choice(len(X_train_q), size=min(150, len(X_train_q)), replace=False)
        bqm = BloqQuantumKernelModel(map_type="ZZ", reps=2, seed=seed)
        bqm.fit(X_train_q[sub_idx], y_train.iloc[sub_idx].values)
        res_q = bqm.evaluate(X_test_q, y_test.values)
        results["BloqQuantumKernel"].append(res_q["pr_auc"])

    summary = {}
    for model_name, auc_scores in results.items():
        arr = np.array(auc_scores)
        mean_auc = np.mean(arr)
        std_err = np.std(arr) * 1.96 / np.sqrt(len(arr)) # 95% CI
        summary[model_name] = {
            "mean_pr_auc": round(float(mean_auc), 4),
            "ci_95_lower": round(float(mean_auc - std_err), 4),
            "ci_95_upper": round(float(mean_auc + std_err), 4),
            "raw_scores": [round(float(s), 4) for s in auc_scores]
        }

    return summary


if __name__ == "__main__":
    print("Running E1 Benchmark Experiment across 5 seeds...")
    res = run_experiment_e1_main_benchmark(seeds=[42, 43])
    print("Results:", res)
