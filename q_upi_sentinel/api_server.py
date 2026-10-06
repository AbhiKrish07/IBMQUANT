"""
Q-UPI Sentinel: REST API Server & Analyst Console Provider (Section 10 & API Spec)
Exposes endpoints for dataset generation, real-time transaction scoring, benchmarks, and metrics.
"""

import os
import random
import fastapi
import uvicorn
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

from q_upi_sentinel.classical_models import ClassicalBaselines
from q_upi_sentinel.data_generator import generate_synthetic_upi_data
from q_upi_sentinel.experiments import run_experiment_e1_main_benchmark
from q_upi_sentinel.feature_pipeline import (FEATURE_COLS, extract_features,
                                              select_quantum_features)
from q_upi_sentinel.quantum_models import BloqQuantumKernelModel
from q_upi_sentinel.tiered_pipeline import TieredPipelineScorer

app = FastAPI(
    title="Q-UPI Sentinel API",
    description="Quantum-Kernel Fraud Detection Platform on Bloq (SRS v1.0 Spec)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Cached State
CURRENT_DATASET = None
FEATURE_DF = None
CLASSICAL_BASELINES = None
QUANTUM_MODEL = None
TIERED_SCORER = None
SELECTED_QCOLS = None
QUANTUM_SCALER = None


def get_stratified_subsample(X: np.ndarray, y: pd.Series, target_size: int = 120):
    """Ensures subsampled index contains both positive (fraud) and negative (legit) classes."""
    y_vals = y.values
    pos_idx = np.where(y_vals == 1)[0]
    neg_idx = np.where(y_vals == 0)[0]

    n_pos = min(len(pos_idx), target_size // 4)  # 25% fraud in quantum sub-train
    n_neg = target_size - n_pos

    selected_pos = np.random.choice(pos_idx, size=n_pos, replace=False) if len(pos_idx) > 0 else np.array([], dtype=int)
    selected_neg = np.random.choice(neg_idx, size=n_neg, replace=False) if len(neg_idx) >= n_neg else neg_idx

    sub_idx = np.concatenate([selected_pos, selected_neg])
    np.random.shuffle(sub_idx)
    return sub_idx


def initialize_default_pipeline():
    global CURRENT_DATASET, FEATURE_DF, CLASSICAL_BASELINES, QUANTUM_MODEL, TIERED_SCORER, SELECTED_QCOLS, QUANTUM_SCALER
    df = generate_synthetic_upi_data(n_txns=1500, fraud_rate=0.04, seed=42)
    FEATURE_DF = extract_features(df)
    CURRENT_DATASET = df

    X = FEATURE_DF[FEATURE_COLS]
    y = FEATURE_DF["label"]

    CLASSICAL_BASELINES = ClassicalBaselines(seed=42)
    CLASSICAL_BASELINES.fit_all(X, y)

    SELECTED_QCOLS, QUANTUM_SCALER = select_quantum_features(X, y, n_features=4)
    X_q = QUANTUM_SCALER.transform(X[SELECTED_QCOLS])
    
    sub_idx = get_stratified_subsample(X_q, y, target_size=120)

    QUANTUM_MODEL = BloqQuantumKernelModel(map_type="ZZ", reps=2, seed=42)
    QUANTUM_MODEL.fit(X_q[sub_idx], y.iloc[sub_idx].values)

    gb_model = CLASSICAL_BASELINES.trained_models["GradientBoosting"]
    TIERED_SCORER = TieredPipelineScorer(gb_model, QUANTUM_MODEL, t_low=0.20, t_high=0.80)


initialize_default_pipeline()


class GenerateRequest(BaseModel):
    n_users: int = 1000
    n_txns: int = 2000
    fraud_rate: float = 0.04
    seed: int = 42


class ScoreRequest(BaseModel):
    amount_inr: float = 25000.0
    velocity_1h: int = 4
    velocity_24h: int = 12
    geo_speed_kmh: float = 120.0
    device_age_days: int = 1
    is_new_payee: int = 1
    payee_in_degree_24h: int = 15


@app.get("/", response_class=HTMLResponse)
def get_analyst_console():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Q-UPI Sentinel | Quantum Fraud Analyst Console</title>
        <style>
            :root { --bg: #090d16; --card: #121826; --accent: #3fb950; --border: #212638; --text: #e6edf3; }
            body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; margin: 0; padding: 20px; }
            h1, h2, h3 { color: #58a6ff; margin-top: 0; }
            .badge { background: #238636; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
            button { background: #238636; color: white; border: none; padding: 10px 18px; font-weight: bold; cursor: pointer; border-radius: 6px; }
            button:hover { background: #2ea043; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 10px; border-bottom: 1px solid var(--border); text-align: left; }
            th { color: #8b949e; }
            pre { background: #0b0e14; padding: 15px; border-radius: 6px; color: #79c0ff; overflow-x: auto; font-size: 13px; }
            .alert-synthetic { background: #271c00; border: 1px solid #9e6a03; color: #f2cc60; padding: 8px 14px; border-radius: 6px; margin-bottom: 15px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="alert-synthetic">⚠️ DISCLAIMER: Every chart and metric in this console states data is synthetic. Non-goals: Real-time quantum claim.</div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                <h1>🛡️ Q-UPI Sentinel <span class="badge">SRS v1.0 Hackathon Build</span></h1>
                <p style="color: #8b949e; margin: 0;">Quantum-Kernel Fraud Detection Benchmark Platform on Bloq</p>
            </div>
            <button onclick="loadMetrics()">🔄 Refresh Metrics</button>
        </div>

        <div class="grid">
            <div class="card">
                <h3>⚡ Live Transaction Scorer (3-Stage Tiered Scorer)</h3>
                <label>Amount (INR):</label>
                <input type="number" id="txAmount" value="45000" style="background:#0b0e14; border:1px solid #30363d; color:white; padding:8px; width:90%; margin-bottom:10px;"><br>
                <label>Velocity (1h):</label>
                <input type="number" id="txVel" value="6" style="background:#0b0e14; border:1px solid #30363d; color:white; padding:8px; width:90%; margin-bottom:10px;"><br>
                <button onclick="scoreLiveTx()">🔬 Evaluate Transaction</button>
                <pre id="scoreResult">Click evaluate to test 3-stage pipeline routing...</pre>
            </div>

            <div class="card">
                <h3>📊 Model Benchmark (E1 Experiment Results)</h3>
                <table>
                    <thead>
                        <tr><th>Model</th><th>Engine</th><th>PR-AUC</th><th>95% CI</th></tr>
                    </thead>
                    <tbody id="metricsTable">
                        <tr><td colspan="4">Loading benchmark metrics...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h3>🌐 Tiered Traffic Distribution & Net Savings</h3>
            <div id="savingsBox">Click refresh to load traffic & rupee net savings metrics...</div>
        </div>

        <script>
            async function loadMetrics() {
                const res = await fetch('/metrics');
                const data = await res.json();
                
                let html = '';
                for (const [mname, mdata] of Object.entries(data.e1_benchmark)) {
                    html += `<tr>
                        <td><strong>${mname}</strong></td>
                        <td>${mname.includes('Bloq') ? 'Bloq/Qiskit Quantum' : 'Classical Sklearn'}</td>
                        <td><strong style="color:#3fb950;">${mdata.mean_pr_auc}</strong></td>
                        <td>[${mdata.ci_95_lower} - ${mdata.ci_95_upper}]</td>
                    </tr>`;
                }
                document.getElementById('metricsTable').innerHTML = html;

                document.getElementById('savingsBox').innerHTML = `<pre>${JSON.stringify(data.tiered_savings, null, 2)}</pre>`;
            }

            async function scoreLiveTx() {
                const amt = parseFloat(document.getElementById('txAmount').value);
                const vel = parseInt(document.getElementById('txVel').value);
                
                const res = await fetch('/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount_inr: amt,
                        velocity_1h: vel,
                        velocity_24h: vel * 2,
                        geo_speed_kmh: vel > 4 ? 350.0 : 15.0,
                        device_age_days: vel > 4 ? 1 : 120,
                        is_new_payee: 1,
                        payee_in_degree_24h: vel > 4 ? 18 : 2
                    })
                });
                const data = await res.json();
                document.getElementById('scoreResult').innerText = JSON.stringify(data, null, 2);
            }

            window.onload = loadMetrics;
        </script>
    </body>
    </html>
    """


@app.post("/generate")
def api_generate_dataset(req: GenerateRequest):
    """Generate synthetic UPI dataset from config (FR-1)."""
    df = generate_synthetic_upi_data(req.n_users, req.n_users//5, req.n_txns, req.fraud_rate, req.seed)
    return {
        "status": "success",
        "total_txns": len(df),
        "fraud_count": int(df["label"].sum()),
        "fraud_rate": round(float(df["label"].mean()), 4)
    }


@app.post("/score")
def api_score_transaction(req: ScoreRequest):
    """Score single transaction through Tiered Scorer (FR-8)."""
    # Build feature row
    amount_log = np.log1p(req.amount_inr)
    amount_zscore = (req.amount_inr - 2000.0) / 1500.0
    hour = random.randint(1, 23)
    device_new = 1 if req.device_age_days <= 3 else 0
    ring_score = min(req.payee_in_degree_24h / 10.0, 1.0)

    class_feats = np.array([[
        amount_log, amount_zscore, hour, req.is_new_payee,
        req.velocity_1h, req.velocity_24h, req.geo_speed_kmh,
        device_new, req.device_age_days, req.payee_in_degree_24h, ring_score
    ]])

    # Selected quantum feature scaling
    quant_feats_raw = np.array([[amount_log, float(req.velocity_1h), req.geo_speed_kmh, ring_score]])
    quant_feats_scaled = QUANTUM_SCALER.transform(quant_feats_raw)

    result = TIERED_SCORER.score_transaction(class_feats, quant_feats_scaled)
    result["feature_values"] = {
        "amount_inr": req.amount_inr,
        "velocity_1h": req.velocity_1h,
        "geo_speed_kmh": req.geo_speed_kmh,
        "device_age_days": req.device_age_days
    }
    return result


@app.get("/metrics")
def api_get_metrics():
    """Returns current benchmark metrics and rupee net savings (FR-7)."""
    X = FEATURE_DF[FEATURE_COLS]
    y = FEATURE_DF["label"]

    X_q = QUANTUM_SCALER.transform(X[SELECTED_QCOLS])

    tiered_res = TIERED_SCORER.batch_evaluate(X, X_q, y.values)
    e1_benchmark = run_experiment_e1_main_benchmark(seeds=[42, 43])

    return {
        "tiered_savings": tiered_res,
        "e1_benchmark": e1_benchmark
    }


if __name__ == "__main__":
    uvicorn.run("q_upi_sentinel.api_server:app", host="0.0.0.0", port=8001, reload=True)
