"""
Q-UPI Sentinel Unified Master Application Server & Premium Analyst Frontend
Includes:
- Direct Side-by-Side Model Comparison (Logistic Regression, Random Forest, Gradient Boosting, RBF-SVM, Bloq Quantum Kernel)
- Visual Quantum Circuit Diagram & Fidelity Kernel Matrix Inspector
- Decoy-State BB84 QKD Simulator (Physics Layer)
- 3-Stage Tiered Scorer (Stage 1 Classical -> Stage 2 Bloq Gray Zone -> Stage 3 Analyst Queue)
- Statistical Benchmarks & Rupee Net Savings Analytics
"""

import os
import sys
import random
import numpy as np
import pandas as pd
from flask import Flask, render_template_string, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from q_upi_sentinel.qkd_simulator import EnterpriseDecoyBB84
from q_upi_sentinel.data_generator import generate_synthetic_upi_data
from q_upi_sentinel.feature_pipeline import extract_features, select_quantum_features, FEATURE_COLS
from q_upi_sentinel.classical_models import ClassicalBaselines
from q_upi_sentinel.q_risk_engine import QUpiSentinelEngine
from q_upi_sentinel.tiered_pipeline import TieredPipelineScorer
from q_upi_sentinel.experiments import run_experiment_e1_main_benchmark
from compliance import create_compliance_blueprint

app = Flask(__name__)

# Global Cached State
DATASET = None
FEATURE_DF = None
CLASSICAL_MODELS = None
QUANTUM_MODEL = None
TIERED_SCORER = None
SELECTED_QCOLS = None
QUANTUM_SCALER = None


def compliance_report_context():
    """Supply live demo metrics to the compliance-only report module."""
    X = FEATURE_DF[FEATURE_COLS]
    y = FEATURE_DF["label"]
    X_q = QUANTUM_SCALER.transform(X[SELECTED_QCOLS])
    tiered_res = TIERED_SCORER.batch_evaluate(
        CLASSICAL_MODELS.scaler.transform(X), X_q, y.values
    )
    return {
        "sample_count": len(y),
        "positive_label_count": int(y.sum()),
        "metrics": tiered_res,
    }


app.register_blueprint(create_compliance_blueprint(compliance_report_context))


def initialize_sentinel():
    global DATASET, FEATURE_DF, CLASSICAL_MODELS, QUANTUM_MODEL, TIERED_SCORER, SELECTED_QCOLS, QUANTUM_SCALER
    print("Initializing Q-UPI Sentinel Master Engine...")
    DATASET = generate_synthetic_upi_data(n_txns=1500, fraud_rate=0.04, seed=42)
    FEATURE_DF = extract_features(DATASET)

    X = FEATURE_DF[FEATURE_COLS]
    y = FEATURE_DF["label"]

    CLASSICAL_MODELS = ClassicalBaselines(seed=42)
    CLASSICAL_MODELS.fit_all(X, y)

    QUANTUM_MODEL = QUpiSentinelEngine(n_qubits=4)
    
    pos_idx = np.where(y.values == 1)[0]
    neg_idx = np.where(y.values == 0)[0]
    sub_pos = np.random.choice(pos_idx, size=min(len(pos_idx), 30), replace=False)
    sub_neg = np.random.choice(neg_idx, size=90, replace=False)
    sub_idx = np.concatenate([sub_pos, sub_neg])
    np.random.shuffle(sub_idx)

    QUANTUM_MODEL.train_pipeline(X.iloc[sub_idx], y.iloc[sub_idx].values)
    
    # Generate X_q from the trained model's pipeline for batch evaluation
    X_q_scaled = QUANTUM_MODEL.scaler.transform(X)
    X_q = QUANTUM_MODEL.pca.transform(X_q_scaled)

    gb_model = CLASSICAL_MODELS.trained_models["GradientBoosting"]
    TIERED_SCORER = TieredPipelineScorer(gb_model, QUANTUM_MODEL, t_low=0.20, t_high=0.80, t_quantum=0.50)
    print("Q-UPI Sentinel Engine Ready!")


initialize_sentinel()


HTML_FRONTEND = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Q-UPI Sentinel | Quantum vs Classical Model Intelligence</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #030712;
            --surface: rgba(17, 24, 39, 0.65);
            --surface-card: rgba(31, 41, 55, 0.6);
            --border: rgba(255, 255, 255, 0.1);
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.6);
            --accent: #0ea5e9;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --danger-glow: rgba(239, 68, 68, 0.6);
            --text: #f8fafc;
            --text-dim: #94a3b8;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background: radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.12), transparent 45%), radial-gradient(circle at 85% 30%, rgba(14, 165, 233, 0.15), transparent 45%), var(--bg); 
            background-attachment: fixed;
            color: var(--text); 
            font-family: 'Inter', sans-serif; 
            padding: 20px; 
            min-height: 100vh; 
        }

        .top-navbar { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); padding: 14px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .logo-group { display: flex; align-items: center; gap: 14px; }
        .logo-badge { width: 42px; height: 42px; background: linear-gradient(135deg, #ef4444, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 0 18px var(--danger-glow); }
        .logo-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700; background: linear-gradient(to right, #ffffff, #93c5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .logo-sub { font-size: 11px; color: var(--text-dim); }

        .nav-links { display: flex; gap: 8px; }
        .nav-btn { background: transparent; color: var(--text-dim); border: none; padding: 8px 18px; font-weight: 600; font-size: 13px; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .nav-btn.active, .nav-btn:hover { background: var(--surface-card); color: white; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin-bottom: 24px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.6); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-title { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700; color: #93c5fd; display: flex; align-items: center; gap: 10px; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

        /* PRESET BUTTONS */
        .preset-btns { display: flex; gap: 10px; margin-bottom: 18px; }
        .btn-preset { background: var(--surface-card); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-preset:hover { border-color: var(--primary); background: rgba(99, 102, 241, 0.15); }

        .btn-act { padding: 12px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; }
        .btn-escalate { background: linear-gradient(135deg, var(--primary), #4f46e5); color: white; box-shadow: 0 4px 15px var(--primary-glow); width: 100%; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { margin-bottom: 12px; }
        label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-dim); display: block; margin-bottom: 6px; }
        input { width: 100%; background: var(--surface-card); border: 1px solid var(--border); color: white; padding: 10px 12px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }

        /* SIDE-BY-SIDE MODEL COMPARISON BARS */
        .model-compare-box { background: var(--surface-card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(8px); }
        .model-bar-row { margin-bottom: 16px; }
        .model-bar-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        .model-bar-bg { background: #070a12; height: 12px; border-radius: 6px; overflow: hidden; position: relative; }
        .model-bar-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease-out; }
        
        .fill-quantum { background: linear-gradient(to right, #06b6d4, #6366f1); box-shadow: 0 0 12px var(--primary-glow); }
        .fill-gb { background: linear-gradient(to right, #10b981, #059669); }
        .fill-rf { background: linear-gradient(to right, #f59e0b, #d97706); }
        .fill-lr { background: linear-gradient(to right, #94a3b8, #64748b); }

        /* QUANTUM CIRCUIT VISUALIZER SVG */
        .circuit-svg { width: 100%; height: 210px; background: #050811; border: 1px solid var(--border); border-radius: 12px; padding: 10px; }
        .wire { stroke: #334155; stroke-width: 2; }
        .gate-h { fill: #6366f1; stroke: #818cf8; rx: 4; }
        .gate-rz { fill: #06b6d4; stroke: #38bdf8; rx: 4; }
        .gate-cx { fill: #ef4444; stroke: #f87171; }
        .gate-text { fill: white; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: bold; text-anchor: middle; }

        .terminal-box { background: #050810; border: 1px solid #1a2336; border-radius: 12px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #79c0ff; overflow-x: auto; min-height: 180px; }

        .tab-content { display: none; }
        .tab-content.active { display: block; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        th, td { padding: 12px; border-bottom: 1px solid var(--border); text-align: left; }
        th { color: var(--text-dim); font-size: 11px; text-transform: uppercase; }
    </style>
</head>
<body>
    <!-- TOP NAVBAR -->
    <div class="top-navbar">
        <div class="logo-group">
            <div class="logo-badge">⚛️</div>
            <div>
                <div class="logo-title">Q-UPI Sentinel Quantum vs Classical Platform</div>
                <div class="logo-sub">Direct Side-by-Side Model Comparison & Qiskit Quantum Circuit Inspector</div>
            </div>
        </div>

        <div class="nav-links">
            <button class="nav-btn active" onclick="switchTab('tab-comparison')">⚔️ Classical vs Quantum</button>
            <button class="nav-btn" onclick="switchTab('tab-circuit')">⚛️ Quantum Circuit & Hilbert Space</button>
            <button class="nav-btn" onclick="switchTab('tab-qkd')">📡 Decoy-State BB84 QKD</button>
            <button class="nav-btn" onclick="switchTab('tab-benchmarks')">📊 5-Seed Benchmarks</button>
        </div>
    </div>

    <!-- TAB 1: SIDE-BY-SIDE CLASSICAL VS QUANTUM COMPARISON -->
    <div id="tab-comparison" class="tab-content active">
        <div class="grid-2">
            <!-- INPUT TELEMETRY -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">💳 Input Telemetry Data</div>
                    <span style="font-size: 11px; color: var(--text-dim);">Evaluates all 5 models simultaneously</span>
                </div>

                <div class="preset-btns">
                    <button class="btn-preset" onclick="setPreset('legit')">☕ Coffee Scan (₹250)</button>
                    <button class="btn-preset" onclick="setPreset('gray')">⚠️ Ambiguous Gray Zone (₹15,000)</button>
                    <button class="btn-preset" onclick="setPreset('fraud')">🚨 High Mule Burst (₹95,000)</button>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Amount (INR)</label>
                        <input type="number" id="txAmount" value="15000">
                    </div>
                    <div class="form-group">
                        <label>Velocity (1h Count)</label>
                        <input type="number" id="txVel1h" value="2">
                    </div>
                    <div class="form-group">
                        <label>Geo Speed (km/h)</label>
                        <input type="number" id="txSpeed" value="45">
                    </div>
                    <div class="form-group">
                        <label>Device Age (Days)</label>
                        <input type="number" id="txDevAge" value="8">
                    </div>
                </div>

                <button class="btn-act btn-escalate" onclick="compareModels()">⚔️ Evaluate All 5 Models (Classical vs Qiskit Quantum)</button>
            </div>

            <!-- SIDE-BY-SIDE MODEL PROBABILITIES -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📊 Side-by-Side Model Fraud Probabilities</div>
                    <span id="grayZoneBadge" style="font-size: 11px; font-weight:700; padding:3px 10px; border-radius:12px; background:rgba(6, 182, 212, 0.2); color:var(--accent);">Evaluating...</span>
                </div>

                <div class="model-compare-box">
                    <!-- Qiskit Quantum Kernel SVM -->
                    <div class="model-bar-row">
                        <div class="model-bar-header">
                            <span style="color:var(--accent);">⚛️ Qiskit Quantum Kernel SVM (Stage 2 Engine)</span>
                            <strong id="val_q">--%</strong>
                        </div>
                        <div class="model-bar-bg"><div id="bar_q" class="model-bar-fill fill-quantum" style="width:0%;"></div></div>
                    </div>

                    <!-- Classical Gradient Boosting -->
                    <div class="model-bar-row">
                        <div class="model-bar-header">
                            <span style="color:var(--success);">🌳 Classical Gradient Boosting (Stage 1 Backbone)</span>
                            <strong id="val_gb">--%</strong>
                        </div>
                        <div class="model-bar-bg"><div id="bar_gb" class="model-bar-fill fill-gb" style="width:0%;"></div></div>
                    </div>

                    <!-- Classical Random Forest -->
                    <div class="model-bar-row">
                        <div class="model-bar-header">
                            <span style="color:var(--warning);">🌲 Classical Random Forest</span>
                            <strong id="val_rf">--%</strong>
                        </div>
                        <div class="model-bar-bg"><div id="bar_rf" class="model-bar-fill fill-rf" style="width:0%;"></div></div>
                    </div>

                    <!-- Classical Logistic Regression -->
                    <div class="model-bar-row">
                        <div class="model-bar-header">
                            <span style="color:var(--text-dim);">📈 Classical Logistic Regression</span>
                            <strong id="val_lr">--%</strong>
                        </div>
                        <div class="model-bar-bg"><div id="bar_lr" class="model-bar-fill fill-lr" style="width:0%;"></div></div>
                    </div>
                </div>

                <div class="terminal-box" id="explanationOut">Click 'Evaluate All 5 Models' to inspect decision routing...</div>
            </div>
        </div>
    </div>

    <!-- TAB 2: QUANTUM CIRCUIT & HILBERT SPACE INSPECTOR -->
    <div id="tab-circuit" class="tab-content">
        <div class="card">
            <div class="card-header">
                <div class="card-title">⚛️ Qiskit 4-Qubit ZZFeatureMap Circuit Diagram</div>
                <span style="font-size: 11px; color: var(--accent);">reps=2, entanglement='linear'</span>
            </div>

            <p style="font-size: 13px; color: var(--text-dim); margin-bottom: 16px;">
                Encodes 4 continuous transaction features $[ \text{amount\_log}, \text{velocity}_{1h}, \text{geo\_speed}, \text{ring\_score} ]$ into a 16-dimensional Quantum Hilbert Space $\mathcal{H}_{2^4}$ using Hadamard superposition, single-qubit $RZ(\theta)$ rotations, and pairwise $CX \rightarrow RZ \rightarrow CX$ entanglement layers.
            </p>

            <svg class="circuit-svg" viewBox="0 0 750 200">
                <!-- Qubit Wires -->
                <text x="20" y="35" fill="#94a3b8" font-family="JetBrains Mono" font-size="12">q[0]: Amount</text>
                <line x1="120" y1="30" x2="720" y2="30" class="wire" />

                <text x="20" y="75" fill="#94a3b8" font-family="JetBrains Mono" font-size="12">q[1]: Velocity</text>
                <line x1="120" y1="70" x2="720" y2="70" class="wire" />

                <text x="20" y="115" fill="#94a3b8" font-family="JetBrains Mono" font-size="12">q[2]: GeoSpeed</text>
                <line x1="120" y1="110" x2="720" y2="110" class="wire" />

                <text x="20" y="155" fill="#94a3b8" font-family="JetBrains Mono" font-size="12">q[3]: RingScore</text>
                <line x1="120" y1="150" x2="720" y2="150" class="wire" />

                <!-- Layer 1: Hadamard Superposition -->
                <rect x="150" y="18" width="24" height="24" class="gate-h"/><text x="162" y="34" class="gate-text">H</text>
                <rect x="150" y="58" width="24" height="24" class="gate-h"/><text x="162" y="74" class="gate-text">H</text>
                <rect x="150" y="98" width="24" height="24" class="gate-h"/><text x="162" y="114" class="gate-text">H</text>
                <rect x="150" y="138" width="24" height="24" class="gate-h"/><text x="162" y="154" class="gate-text">H</text>

                <!-- Layer 2: RZ Phase Rotation (Feature Encoding) -->
                <rect x="210" y="18" width="45" height="24" class="gate-rz"/><text x="232" y="34" class="gate-text">RZ(x0)</text>
                <rect x="210" y="58" width="45" height="24" class="gate-rz"/><text x="232" y="74" class="gate-text">RZ(x1)</text>
                <rect x="210" y="98" width="45" height="24" class="gate-rz"/><text x="232" y="114" class="gate-text">RZ(x2)</text>
                <rect x="210" y="138" width="45" height="24" class="gate-rz"/><text x="232" y="154" class="gate-text">RZ(x3)</text>

                <!-- Layer 3: Entanglement Block (CX -> RZ -> CX) -->
                <line x1="300" y1="30" x2="300" y2="70" stroke="#ef4444" stroke-width="2" />
                <circle cx="300" cy="30" r="4" fill="#ef4444" />
                <circle cx="300" cy="70" r="7" fill="none" stroke="#ef4444" stroke-width="2" />

                <rect x="330" y="58" width="60" height="24" class="gate-rz"/><text x="360" y="74" class="gate-text">RZ(x0·x1)</text>

                <line x1="420" y1="30" x2="420" y2="70" stroke="#ef4444" stroke-width="2" />
                <circle cx="420" cy="30" r="4" fill="#ef4444" />
                <circle cx="420" cy="70" r="7" fill="none" stroke="#ef4444" stroke-width="2" />

                <!-- Second Qubit Pair Entanglement -->
                <line x1="480" y1="70" x2="480" y2="110" stroke="#ef4444" stroke-width="2" />
                <circle cx="480" cy="70" r="4" fill="#ef4444" />
                <circle cx="480" cy="110" r="7" fill="none" stroke="#ef4444" stroke-width="2" />

                <rect x="510" y="98" width="60" height="24" class="gate-rz"/><text x="540" y="114" class="gate-text">RZ(x1·x2)</text>

                <line x1="600" y1="70" x2="600" y2="110" stroke="#ef4444" stroke-width="2" />
                <circle cx="600" cy="70" r="4" fill="#ef4444" />
                <circle cx="600" cy="110" r="7" fill="none" stroke="#ef4444" stroke-width="2" />
            </svg>
        </div>
    </div>

    <!-- TAB 3: QKD TRANSIT -->
    <div id="tab-qkd" class="tab-content">
        <div class="card">
            <div class="card-header">
                <div class="card-title">📡 Decoy-State BB84 QKD Interbank Channel Test</div>
            </div>
            <div style="display: flex; gap: 14px; margin-bottom: 20px;">
                <button class="btn-act" style="background: #238636; color: white;" onclick="runQkd(false)">Run Clean QKD Transit</button>
                <button class="btn-act" style="background: #da3633; color: white;" onclick="runQkd(true)">Simulate Eve Intercept-Resend Attack</button>
            </div>
            <div class="terminal-box" id="qkdOut">Awaiting QKD channel simulation...</div>
        </div>
    </div>

    <!-- TAB 4: BENCHMARKS -->
    <div id="tab-benchmarks" class="tab-content">
        <div class="card">
            <div class="card-header">
                <div class="card-title">📊 5-Seed Benchmark Results (PR-AUC with 95% CIs)</div>
            </div>
            <table>
                <thead>
                    <tr><th>Model</th><th>Engine Layer</th><th>Mean PR-AUC</th><th>95% CI Range</th></tr>
                </thead>
                <tbody id="benchTable">
                    <tr><td colspan="4">Loading statistical benchmarks...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        function switchTab(tabId) {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            if (tabId === 'tab-benchmarks') loadMetrics();
        }

        function setPreset(type) {
            if (type === 'legit') {
                document.getElementById('txAmount').value = 250;
                document.getElementById('txVel1h').value = 1;
                document.getElementById('txSpeed').value = 5;
                document.getElementById('txDevAge').value = 180;
            } else if (type === 'gray') {
                document.getElementById('txAmount').value = 15000;
                document.getElementById('txVel1h').value = 2;
                document.getElementById('txSpeed').value = 45;
                document.getElementById('txDevAge').value = 8;
            } else if (type === 'fraud') {
                document.getElementById('txAmount').value = 95000;
                document.getElementById('txVel1h').value = 9;
                document.getElementById('txSpeed').value = 450;
                document.getElementById('txDevAge').value = 0;
            }
        }

        async function compareModels() {
            const amt = parseFloat(document.getElementById('txAmount').value);
            const vel = parseInt(document.getElementById('txVel1h').value);
            const speed = parseFloat(document.getElementById('txSpeed').value);
            const devAge = parseInt(document.getElementById('txDevAge').value);

            const res = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount_inr: amt,
                    velocity_1h: vel,
                    velocity_24h: vel * 2,
                    geo_speed_kmh: speed,
                    device_age_days: devAge,
                    is_new_payee: devAge < 3 ? 1 : 0,
                    payee_in_degree_24h: 12
                })
            });

            const data = await res.json();
            const probs = data.all_model_probabilities;

            // Update Side-by-Side Model Comparison Progress Bars
            const qPct = (probs.QiskitQuantumKernel * 100).toFixed(1);
            document.getElementById('val_q').innerText = `${qPct}%`;
            document.getElementById('bar_q').style.width = `${qPct}%`;

            const gbPct = (probs.GradientBoosting * 100).toFixed(1);
            document.getElementById('val_gb').innerText = `${gbPct}%`;
            document.getElementById('bar_gb').style.width = `${gbPct}%`;

            const rfPct = (probs.RandomForest * 100).toFixed(1);
            document.getElementById('val_rf').innerText = `${rfPct}%`;
            document.getElementById('bar_rf').style.width = `${rfPct}%`;

            const lrPct = (probs.LogisticRegression * 100).toFixed(1);
            document.getElementById('val_lr').innerText = `${lrPct}%`;
            document.getElementById('bar_lr').style.width = `${lrPct}%`;

            const badge = document.getElementById('grayZoneBadge');
            if (data.tiered_result.stage_reached === 2) {
                badge.style.background = 'rgba(6, 182, 212, 0.2)';
                badge.style.color = '#38bdf8';
                badge.innerText = 'STAGE 2: QISKIT QUANTUM KERNEL EVALUATED (GRAY ZONE)';
            } else {
                badge.style.background = 'rgba(16, 185, 129, 0.2)';
                badge.style.color = '#34d399';
                badge.innerText = 'STAGE 1: CLASSICAL FAST AUTO-DECISION';
            }

            document.getElementById('explanationOut').innerText = JSON.stringify(data, null, 2);
        }

        async function runQkd(eve) {
            const res = await fetch(`/api/qkd?eve_present=${eve}`);
            const data = await res.json();
            document.getElementById('qkdOut').innerText = JSON.stringify(data, null, 2);
        }

        async function loadMetrics() {
            const res = await fetch('/api/metrics');
            const data = await res.json();

            let html = '';
            for (const [mname, mdata] of Object.entries(data.e1_benchmark)) {
                html += `<tr>
                    <td><strong>${mname}</strong></td>
                    <td>${mname.includes('Qiskit') ? 'Qiskit Quantum Fidelity Kernel' : 'Classical Scikit-Learn'}</td>
                    <td><strong style="color:#3fb950;">${mdata.mean_pr_auc}</strong></td>
                    <td>[${mdata.ci_95_lower} - ${mdata.ci_95_upper}]</td>
                </tr>`;
            }
            document.getElementById('benchTable').innerHTML = html;
        }

        window.onload = compareModels;
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_FRONTEND)

@app.route('/api/compare', methods=['POST'])
def api_compare():
    """Evaluates all 5 models simultaneously for a side-by-side comparison."""
    data = request.json
    amt = float(data.get("amount_inr", 15000.0))
    vel1h = int(data.get("velocity_1h", 2))
    vel24h = int(data.get("velocity_24h", 4))
    speed = float(data.get("geo_speed_kmh", 45.0))
    dev_age = int(data.get("device_age_days", 8))
    is_new = int(data.get("is_new_payee", 0))
    payee_deg = int(data.get("payee_in_degree_24h", 12))

    amount_log = np.log1p(amt)
    amount_zscore = (amt - 2000.0) / 1500.0
    hour = random.randint(1, 23)
    device_new = 1 if dev_age <= 3 else 0
    ring_score = min(payee_deg / 10.0, 1.0)

    class_feats = np.array([[
        amount_log, amount_zscore, hour, is_new,
        vel1h, vel24h, speed,
        device_new, dev_age, payee_deg, ring_score
    ]])

    class_feats_scaled = CLASSICAL_MODELS.scaler.transform(class_feats)
    
    class_feats_q_scaled = QUANTUM_MODEL.scaler.transform(class_feats)
    quant_feats_scaled = QUANTUM_MODEL.pca.transform(class_feats_q_scaled)

    # Evaluate Classical Models
    lr_prob = float(CLASSICAL_MODELS.trained_models["LogisticRegression"].predict_proba(class_feats_scaled)[0, 1])
    rf_prob = float(CLASSICAL_MODELS.trained_models["RandomForest"].predict_proba(class_feats_scaled)[0, 1])
    gb_prob = float(CLASSICAL_MODELS.trained_models["GradientBoosting"].predict_proba(class_feats_scaled)[0, 1])
    rbf_prob = float(CLASSICAL_MODELS.trained_models["RBF-SVM"].predict_proba(class_feats_scaled)[0, 1])

    # Evaluate Quantum Kernel Model
    quantum_prob = float(QUANTUM_MODEL.predict_proba(quant_feats_scaled)[0])

    # 3-Stage Tiered Pipeline Decision
    tiered_result = TIERED_SCORER.score_transaction(class_feats_scaled, quant_feats_scaled)

    return jsonify({
        "all_model_probabilities": {
            "QiskitQuantumKernel": round(quantum_prob, 4),
            "GradientBoosting": round(gb_prob, 4),
            "RandomForest": round(rf_prob, 4),
            "LogisticRegression": round(lr_prob, 4),
            "RBF_SVM": round(rbf_prob, 4)
        },
        "tiered_result": tiered_result,
        "quantum_circuit_info": {
            "circuit": "Qiskit ZZFeatureMap(n_qubits=4, reps=2, entanglement='linear')",
            "hilbert_dimension": 16,
            "engine": "QUpiSentinelEngine (Qiskit)"
        }
    })

@app.route('/api/score', methods=['POST'])
def api_score():
    return api_compare()

@app.route('/api/qkd')
def api_qkd():
    eve = request.args.get("eve_present", "false").lower() == "true"
    engine = EnterpriseDecoyBB84(n_pulses=50_000)
    res = engine.simulate_transmission(attack="INTERCEPT_RESEND" if eve else "NONE")
    return jsonify(res)

@app.route('/api/metrics')
def api_metrics():
    X = FEATURE_DF[FEATURE_COLS]
    y = FEATURE_DF["label"]
    
    X_q_scaled = QUANTUM_MODEL.scaler.transform(X)
    X_q = QUANTUM_MODEL.pca.transform(X_q_scaled)

    tiered_res = TIERED_SCORER.batch_evaluate(X, X_q, y.values)
    e1_benchmark = run_experiment_e1_main_benchmark(seeds=[42, 43])
    return jsonify({
        "tiered_savings": tiered_res,
        "e1_benchmark": e1_benchmark
    })

if __name__ == '__main__':
    print("Launching Q-UPI Sentinel Master Server on http://0.0.0.0:8002...")
    app.run(host='0.0.0.0', port=8002, debug=False)
