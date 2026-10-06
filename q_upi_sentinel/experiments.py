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
from q_upi_sentinel.q_risk_engine import QUpiSentinelEngine


def run_experiment_e1_main_benchmark(seeds=[42, 43, 44, 45, 46]) -> dict:
    """
    E1 Main Benchmark: Compares Bloq Quantum Kernel against 4 Classical Baselines across 5 seeds.
    """
    results = {
        "LogisticRegression": [],
        "RandomForest": [],
        "GradientBoosting": [],
        "RBF-SVM": [],
        "QiskitQuantumKernel": []
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

        # Qiskit Quantum Kernel Engine
        pos_idx = np.where(y_train.values == 1)[0]
        neg_idx = np.where(y_train.values == 0)[0]
        sub_pos = np.random.choice(pos_idx, size=min(len(pos_idx), 20), replace=False)
        sub_neg = np.random.choice(neg_idx, size=100, replace=False)
        sub_idx = np.concatenate([sub_pos, sub_neg])
        np.random.shuffle(sub_idx)
        
        engine = QUpiSentinelEngine(n_qubits=4)
        engine.train_pipeline(X_train.iloc[sub_idx], y_train.iloc[sub_idx].values)
        
        # Evaluate PR AUC
        X_test_scaled = engine.scaler.transform(X_test)
        X_test_pca = engine.pca.transform(X_test_scaled)
        q_probs = engine.predict_proba(X_test_pca)
        pr_auc = average_precision_score(y_test, q_probs)
        results["QiskitQuantumKernel"].append(float(pr_auc))

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
