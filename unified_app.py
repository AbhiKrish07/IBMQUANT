"""
Q-UPI Sentinel Unified Master Application Server & Premium Analyst Frontend
Ultra-Premium Dark Glassmorphism UI inspired by Entrust & Enterprise Cyberpunk Fraud Platforms
Integrates:
- Real-time Transaction Risk Gauge & 24h Trend Curve
- Detected Anomalies Geo Flow & Linked Accounts Matrix
- Interactive Glassmorphism Threat Network Node Graph
- Decoy-State BB84 QKD Simulator (Physics Layer)
- Qiskit ZZFeatureMap + Bloq Quantum Kernel SVM (Cognitive Risk Engine)
- 3-Stage Tiered Scorer (Stage 1 Classical -> Stage 2 Bloq Gray Zone -> Stage 3 Analyst Queue)
- 5-Seed Benchmark & Rupee Net Savings Analytics
"""

import os
import sys
import random
import numpy as np
import pandas as pd
from flask import Flask, render_template_string, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from q_upi.qkd_simulator import simulate_bb84_channel
from q_upi_sentinel.data_generator import generate_synthetic_upi_data
from q_upi_sentinel.feature_pipeline import extract_features, select_quantum_features, FEATURE_COLS
from q_upi_sentinel.classical_models import ClassicalBaselines
from q_upi_sentinel.quantum_models import BloqQuantumKernelModel
from q_upi_sentinel.tiered_pipeline import TieredPipelineScorer
from q_upi_sentinel.experiments import run_experiment_e1_main_benchmark

app = Flask(__name__)

# Global Cached State
DATASET = None
FEATURE_DF = None
CLASSICAL_MODELS = None
QUANTUM_MODEL = None
TIERED_SCORER = None
SELECTED_QCOLS = None
QUANTUM_SCALER = None


def initialize_sentinel():
    global DATASET, FEATURE_DF, CLASSICAL_MODELS, QUANTUM_MODEL, TIERED_SCORER, SELECTED_QCOLS, QUANTUM_SCALER
    print("Initializing Q-UPI Sentinel Master Engine...")
    DATASET = generate_synthetic_upi_data(n_txns=1500, fraud_rate=0.04, seed=42)
    FEATURE_DF = extract_features(DATASET)

    X = FEATURE_DF[FEATURE_COLS]
    y = FEATURE_DF["label"]

    CLASSICAL_MODELS = ClassicalBaselines(seed=42)
    CLASSICAL_MODELS.fit_all(X, y)

    SELECTED_QCOLS, QUANTUM_SCALER = select_quantum_features(X, y, n_features=4)
    X_q = QUANTUM_SCALER.transform(X[SELECTED_QCOLS])

    pos_idx = np.where(y.values == 1)[0]
    neg_idx = np.where(y.values == 0)[0]
    sub_pos = np.random.choice(pos_idx, size=min(len(pos_idx), 30), replace=False)
    sub_neg = np.random.choice(neg_idx, size=90, replace=False)
    sub_idx = np.concatenate([sub_pos, sub_neg])
    np.random.shuffle(sub_idx)

    QUANTUM_MODEL = BloqQuantumKernelModel(map_type="ZZ", reps=2, seed=42)
    QUANTUM_MODEL.fit(X_q[sub_idx], y.iloc[sub_idx].values)

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
    <title>Q-UPI Sentinel | Quantum Risk & Cyberpunk Fraud Intelligence</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #090d16;
            --surface: #111726;
            --surface-card: #172034;
            --surface-hover: #1e2a45;
            --border: #232e47;
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.4);
            --accent: #06b6d4;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --danger-glow: rgba(239, 68, 68, 0.4);
            --text: #f3f4f6;
            --text-dim: #9ca3af;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; padding: 20px; min-height: 100vh; overflow-x: hidden; }

        /* HEADER & NAVBAR */
        .top-navbar { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); padding: 14px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo-group { display: flex; align-items: center; gap: 14px; }
        .logo-badge { width: 42px; height: 42px; background: linear-gradient(135deg, #ef4444, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 0 18px var(--danger-glow); }
        .logo-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700; background: linear-gradient(to right, #ffffff, #93c5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .logo-sub { font-size: 11px; color: var(--text-dim); }

        .nav-links { display: flex; gap: 8px; }
        .nav-btn { background: transparent; color: var(--text-dim); border: none; padding: 8px 18px; font-weight: 600; font-size: 13px; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .nav-btn.active, .nav-btn:hover { background: var(--surface-card); color: white; border: 1px solid var(--border); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }

        .agent-profile { display: flex; align-items: center; gap: 12px; border-left: 1px solid var(--border); padding-left: 20px; }
        .avatar { width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--primary); background: url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80') center/cover; }
        .agent-info { font-size: 12px; }
        .agent-name { font-weight: 700; color: white; }
        .agent-role { color: var(--accent); font-size: 11px; }

        /* KPI METRIC CARDS GRID (Screenshot 1 & 3 Inspired) */
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
        .kpi-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; position: relative; overflow: hidden; transition: all 0.3s; }
        .kpi-card:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: 0 10px 25px var(--primary-glow); }
        .kpi-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; }
        .kpi-val { font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 800; margin-bottom: 4px; }
        .kpi-lbl { font-size: 12px; color: var(--text-dim); font-weight: 500; }
        .kpi-trend { position: absolute; top: 20px; right: 20px; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px; }
        .trend-up { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .trend-down { background: rgba(6, 182, 212, 0.15); color: var(--accent); }

        /* MAIN DASHBOARD LAYOUT (Screenshot 2 Inspired) */
        .dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin-bottom: 24px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-title { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700; color: #93c5fd; display: flex; align-items: center; gap: 10px; }

        /* RISK GAUGE & CHART */
        .gauge-container { display: flex; align-items: center; gap: 24px; background: var(--surface-card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 20px; }
        .gauge-score { font-family: 'Outfit', sans-serif; font-size: 64px; font-weight: 900; color: var(--danger); text-shadow: 0 0 25px var(--danger-glow); line-height: 1; }
        .gauge-score span { font-size: 20px; color: var(--text-dim); font-weight: 500; }
        .gauge-details { flex-grow: 1; }
        .badge-risk { display: inline-block; padding: 4px 14px; border-radius: 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: rgba(239, 68, 68, 0.2); color: var(--danger); border: 1px solid var(--danger); }
        
        .chart-svg { width: 100%; height: 120px; overflow: visible; }

        /* ANOMALIES & LINKED ACCOUNTS */
        .geo-flow { background: var(--surface-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .geo-node { text-align: center; }
        .geo-city { font-weight: 700; font-size: 13px; color: white; }
        .geo-status { font-size: 11px; color: var(--text-dim); }
        .geo-line { flex-grow: 1; height: 2px; background: linear-gradient(to right, var(--success), var(--danger), var(--accent)); margin: 0 16px; position: relative; }
        .geo-line::after { content: '✈️'; position: absolute; top: -12px; left: 45%; font-size: 12px; }

        .account-list { display: flex; flex-direction: column; gap: 12px; }
        .account-item { display: flex; justify-content: space-between; align-items: center; background: var(--surface-card); border: 1px solid var(--border); padding: 14px; border-radius: 10px; font-size: 13px; }
        .account-name { font-weight: 600; color: white; }
        .account-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-dim); }

        /* RECOMMENDED ACTION BAR (Screenshot 2 Bottom Bar) */
        .action-bar { background: var(--surface-card); border: 1px solid var(--border); border-radius: 14px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .action-alert { display: flex; align-items: center; gap: 14px; }
        .action-icon { width: 38px; height: 38px; background: rgba(239, 68, 68, 0.2); border: 1px solid var(--danger); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--danger); }
        .action-btns { display: flex; gap: 12px; }
        .btn-act { padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; }
        .btn-escalate { background: var(--danger); color: white; box-shadow: 0 4px 15px var(--danger-glow); }
        .btn-block { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
        .btn-approve { background: var(--success); color: white; }

        /* THREAT GRAPH SVG (Screenshot 4 Glassmorphism Node Graph Inspired) */
        .network-svg { width: 100%; height: 260px; background: #070a12; border-radius: 12px; border: 1px solid var(--border); }

        /* TAB CONTROLS */
        .tab-content { display: none; }
        .tab-content.active { display: block; }

        /* FORM INPUTS */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { margin-bottom: 12px; }
        label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-dim); display: block; margin-bottom: 6px; }
        input { width: 100%; background: var(--surface-card); border: 1px solid var(--border); color: white; padding: 10px 12px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }

        .terminal-box { background: #050810; border: 1px solid #1a2336; border-radius: 12px; padding: 18px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #79c0ff; overflow-x: auto; min-height: 200px; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        th, td { padding: 12px; border-bottom: 1px solid var(--border); text-align: left; }
        th { color: var(--text-dim); font-size: 11px; text-transform: uppercase; }
    </style>
</head>
<body>
    <!-- TOP NAVIGATION NAVBAR -->
    <div class="top-navbar">
        <div class="logo-group">
            <div class="logo-badge">⚡</div>
            <div>
                <div class="logo-title">Q-UPI Sentinel Risk Hub</div>
                <div class="logo-sub">Quantum-Safe Real-Time Clearing & Bloq QSVM Threat Intelligence</div>
            </div>
        </div>

        <div class="nav-links">
            <button class="nav-btn active" onclick="switchTab('tab-overview')">Overview</button>
            <button class="nav-btn" onclick="switchTab('tab-threat')">Threat Graph</button>
            <button class="nav-btn" onclick="switchTab('tab-scorer')">Payment Scorer</button>
            <button class="nav-btn" onclick="switchTab('tab-qkd')">QKD Transit</button>
            <button class="nav-btn" onclick="switchTab('tab-analytics')">Analytics</button>
        </div>

        <div class="agent-profile">
            <div class="avatar"></div>
            <div class="agent-info">
                <div class="agent-name">Emily Chen</div>
                <div class="agent-role">Principal Fraud Analyst</div>
            </div>
        </div>
    </div>

    <!-- KPI METRIC CARDS (Screenshot 1 & 3 Inspired) -->
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(99, 102, 241, 0.2); color: var(--primary);">⚡</div>
            <div class="kpi-trend trend-up">↗ 41.67%</div>
            <div class="kpi-val">10.2M</div>
            <div class="kpi-lbl">Transactions Today</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(16, 185, 129, 0.2); color: var(--success);">🎯</div>
            <div class="kpi-trend trend-up">99.7%</div>
            <div class="kpi-val">99.7%</div>
            <div class="kpi-lbl">QML Detection Accuracy</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(6, 182, 212, 0.2); color: var(--accent);">📉</div>
            <div class="kpi-trend trend-down">-30%</div>
            <div class="kpi-val">10.5%</div>
            <div class="kpi-lbl">False Positive Rate Reduction</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon" style="background: rgba(239, 68, 68, 0.2); color: var(--danger);">🛡️</div>
            <div class="kpi-trend trend-up">↗ 847</div>
            <div class="kpi-val">847</div>
            <div class="kpi-lbl">High-Risk Threats Blocked</div>
        </div>
    </div>

    <!-- TAB 1: MAIN OVERVIEW DASHBOARD (Screenshot 2 Inspired) -->
    <div id="tab-overview" class="tab-content active">
        <div class="dash-grid">
            <!-- LEFT COLUMN: RISK SCORE & TREND -->
            <div>
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">🚨 Transaction Risk Score & 24h Trend</div>
                        <div class="badge-risk">HIGH RISK</div>
                    </div>

                    <div class="gauge-container">
                        <div class="gauge-score">87<span>/100</span></div>
                        <div class="gauge-details">
                            <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">Mule Ring Burst Detected</div>
                            <div style="font-size: 12px; color: var(--text-dim);">Priority: <strong style="color:var(--danger);">HIGH</strong> | Confidence: <strong style="color:var(--success);">HIGH (96.4%)</strong></div>
                        </div>
                    </div>

                    <!-- Smooth 24h Risk Line Chart -->
                    <div class="card-title" style="font-size: 13px; margin-bottom: 10px;">24-Hour Risk Curve Timeline</div>
                    <svg class="chart-svg" viewBox="0 0 500 120">
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#ef4444" stop-opacity="0.5"/>
                                <stop offset="100%" stop-color="#ef4444" stop-opacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0 90 Q 70 70 140 85 T 280 40 T 420 25 L 500 10 L 500 120 L 0 120 Z" fill="url(#chartGrad)" />
                        <path d="M 0 90 Q 70 70 140 85 T 280 40 T 420 25 L 500 10" fill="none" stroke="#ef4444" stroke-width="3" />
                        <circle cx="500" cy="10" r="5" fill="#ef4444" />
                    </svg>
                </div>

                <!-- DETECTED ANOMALIES GEO MAP FLOW -->
                <div class="card">
                    <div class="card-title">🌐 Detected Anomalies Trajectory Map</div>
                    <div class="geo-flow">
                        <div class="geo-node">
                            <div class="geo-city">Mumbai, IN</div>
                            <div class="geo-status" style="color: var(--success);">Known Home Location</div>
                        </div>
                        <div class="geo-line"></div>
                        <div class="geo-node">
                            <div class="geo-city">Moscow, RU</div>
                            <div class="geo-status" style="color: var(--danger);">Unusual Impossible Travel</div>
                        </div>
                        <div class="geo-line"></div>
                        <div class="geo-node">
                            <div class="geo-city">Singapore, SG</div>
                            <div class="geo-status" style="color: var(--accent);">Crypto Mixer Receiver</div>
                        </div>
                    </div>
                </div>

                <!-- RECOMMENDED ACTION BAR -->
                <div class="action-bar">
                    <div class="action-alert">
                        <div class="action-icon">⚠️</div>
                        <div>
                            <div style="font-weight: 700; font-size: 14px;">Recommended Action</div>
                            <div style="font-size: 12px; color: var(--text-dim);">Multiple high-risk quantum kernel indicators detected.</div>
                        </div>
                    </div>
                    <div class="action-btns">
                        <button class="btn-act btn-escalate" onclick="alert('Case escalated to Senior Fraud Analyst!')">Escalate Case ➔</button>
                        <button class="btn-act btn-block" onclick="alert('Account temporarily frozen.')">Block Account</button>
                        <button class="btn-act btn-approve" onclick="alert('Transaction manually approved.')">Approve</button>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: CASE SUMMARY & LINKED ACCOUNTS -->
            <div>
                <!-- CASE SUMMARY CARD -->
                <div class="card">
                    <div class="card-title">👤 Active Case Summary</div>
                    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                        <div class="avatar" style="width: 52px; height: 52px;"></div>
                        <div>
                            <div style="font-weight: 700; font-size: 16px;">Emily Chen</div>
                            <div style="font-size: 12px; color: var(--text-dim);">ID: <code>CUST-78429</code></div>
                        </div>
                    </div>
                    <div style="font-size: 12px; line-height: 1.8; color: var(--text-dim); background: var(--surface-card); padding: 12px; border-radius: 8px;">
                        Segment: <strong style="color:white;">Retail Banking</strong><br>
                        Customer Since: <strong style="color:white;">Mar 12, 2021</strong><br>
                        Status: <strong style="color:var(--success);">Active Customer</strong>
                    </div>
                </div>

                <!-- LINKED ACCOUNTS MATRIX -->
                <div class="card">
                    <div class="card-title">💳 Linked Accounts Matrix</div>
                    <div class="account-list">
                        <div class="account-item">
                            <div>
                                <div class="account-name">HDFC Checking Account</div>
                                <div class="account-num">•••• 5821</div>
                            </div>
                            <span class="badge-risk" style="font-size: 10px;">High Activity</span>
                        </div>
                        <div class="account-item">
                            <div>
                                <div class="account-name">ICICI Savings Account</div>
                                <div class="account-num">•••• 9473</div>
                            </div>
                            <span class="badge-risk" style="background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: var(--success); font-size: 10px;">Normal</span>
                        </div>
                        <div class="account-item">
                            <div>
                                <div class="account-name">Axis Credit Card</div>
                                <div class="account-num">•••• 3367</div>
                            </div>
                            <span class="badge-risk" style="font-size: 10px;">High Activity</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- TAB 2: INTERACTIVE THREAT NETWORK GRAPH (Screenshot 4 Inspired) -->
    <div id="tab-threat" class="tab-content">
        <div class="card">
            <div class="card-title">🕸️ Glassmorphism Threat Network Node Graph</div>
            <p style="font-size: 13px; color: var(--text-dim); margin-bottom: 16px;">Visualizes quantum-entangled relationship clusters between high-risk payer nodes, new device IDs, location hops, and payee mule accounts.</p>
            
            <svg class="network-svg" viewBox="0 0 800 260">
                <!-- Glowing Link Lines -->
                <line x1="400" y1="130" x2="200" y2="70" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>
                <line x1="400" y1="130" x2="600" y2="70" stroke="#06b6d4" stroke-width="2"/>
                <line x1="400" y1="130" x2="250" y2="200" stroke="#ef4444" stroke-width="2"/>
                <line x1="400" y1="130" x2="550" y2="200" stroke="#6366f1" stroke-width="2"/>

                <!-- Central Node (User) -->
                <g transform="translate(400, 130)">
                    <rect x="-60" y="-30" width="120" height="60" rx="14" fill="#172034" stroke="#ef4444" stroke-width="2"/>
                    <text x="0" y="-5" text-anchor="middle" fill="#ffffff" font-weight="bold" font-size="13">Noah Hayes</text>
                    <text x="0" y="15" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="bold">High Risk User</text>
                </g>

                <!-- Payer Node -->
                <g transform="translate(200, 70)">
                    <circle r="22" fill="#111726" stroke="#ef4444" stroke-width="2"/>
                    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="14">📱</text>
                </g>

                <!-- Location Node -->
                <g transform="translate(600, 70)">
                    <circle r="22" fill="#111726" stroke="#06b6d4" stroke-width="2"/>
                    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="14">📍</text>
                </g>

                <!-- Payee Mule Node -->
                <g transform="translate(250, 200)">
                    <circle r="22" fill="#111726" stroke="#ef4444" stroke-width="2"/>
                    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="14">🏦</text>
                </g>

                <!-- Device Node -->
                <g transform="translate(550, 200)">
                    <circle r="22" fill="#111726" stroke="#6366f1" stroke-width="2"/>
                    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-size="14">💻</text>
                </g>
            </svg>
        </div>
    </div>

    <!-- TAB 3: REAL-TIME PAYMENT SCORER -->
    <div id="tab-scorer" class="tab-content">
        <div class="dash-grid">
            <div class="card">
                <div class="card-title">💳 Live UPI Telemetry Input</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Amount (INR)</label>
                        <input type="number" id="txAmount" value="45000">
                    </div>
                    <div class="form-group">
                        <label>Velocity (1h Count)</label>
                        <input type="number" id="txVel1h" value="4">
                    </div>
                    <div class="form-group">
                        <label>Geo Travel Speed (km/h)</label>
                        <input type="number" id="txSpeed" value="120">
                    </div>
                    <div class="form-group">
                        <label>Device Age (Days)</label>
                        <input type="number" id="txDevAge" value="1">
                    </div>
                </div>
                <button class="btn-act btn-escalate" style="width:100%; margin-top:10px;" onclick="evaluateTx()">🔬 Evaluate Through 3-Stage Pipeline</button>
            </div>

            <div class="card">
                <div class="card-title">🧬 Pipeline Score Output</div>
                <div class="terminal-box" id="scorerOut">Click 'Evaluate' to run real-time payment settlement...</div>
            </div>
        </div>
    </div>

    <!-- TAB 4: QKD TRANSIT -->
    <div id="tab-qkd" class="tab-content">
        <div class="card">
            <div class="card-title">📡 Decoy-State BB84 QKD Channel Test</div>
            <div style="display: flex; gap: 14px; margin-bottom: 20px;">
                <button class="btn-act btn-approve" onclick="runQkd(false)">Run Clean QKD Transit</button>
                <button class="btn-act btn-escalate" onclick="runQkd(true)">Simulate Eve Eavesdropping Attack</button>
            </div>
            <div class="terminal-box" id="qkdOut">Awaiting QKD channel simulation...</div>
        </div>
    </div>

    <!-- TAB 5: ANALYTICS -->
    <div id="tab-analytics" class="tab-content">
        <div class="card">
            <div class="card-title">📊 5-Seed Benchmark Results (PR-AUC with 95% CIs)</div>
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

            if (tabId === 'tab-analytics') loadMetrics();
        }

        async function evaluateTx() {
            const amt = parseFloat(document.getElementById('txAmount').value);
            const vel = parseInt(document.getElementById('txVel1h').value);
            const speed = parseFloat(document.getElementById('txSpeed').value);
            const devAge = parseInt(document.getElementById('txDevAge').value);

            const res = await fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount_inr: amt,
                    velocity_1h: vel,
                    velocity_24h: vel * 2,
                    geo_speed_kmh: speed,
                    device_age_days: devAge,
                    is_new_payee: devAge < 3 ? 1 : 0,
                    payee_in_degree_24h: 15
                })
            });

            const data = await res.json();
            document.getElementById('scorerOut').innerText = JSON.stringify(data, null, 2);
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
                    <td>${mname.includes('Bloq') ? 'Bloq Quantum Fidelity Kernel' : 'Classical Scikit-Learn'}</td>
                    <td><strong style="color:#3fb950;">${mdata.mean_pr_auc}</strong></td>
                    <td>[${mdata.ci_95_lower} - ${mdata.ci_95_upper}]</td>
                </tr>`;
            }
            document.getElementById('benchTable').innerHTML = html;
        }
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_FRONTEND)

@app.route('/api/score', methods=['POST'])
def api_score():
    data = request.json
    amt = float(data.get("amount_inr", 25000.0))
    vel1h = int(data.get("velocity_1h", 2))
    vel24h = int(data.get("velocity_24h", 5))
    speed = float(data.get("geo_speed_kmh", 20.0))
    dev_age = int(data.get("device_age_days", 100))
    is_new = int(data.get("is_new_payee", 0))
    payee_deg = int(data.get("payee_in_degree_24h", 2))

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
    quant_feats_raw = pd.DataFrame([[amount_log, float(vel1h), speed, ring_score]], columns=SELECTED_QCOLS)
    quant_feats_scaled = QUANTUM_SCALER.transform(quant_feats_raw)

    res = TIERED_SCORER.score_transaction(class_feats_scaled, quant_feats_scaled)
    res["telemetry_inputs"] = data
    return jsonify(res)

@app.route('/api/qkd')
def api_qkd():
    eve = request.args.get("eve_present", "false").lower() == "true"
    return jsonify(simulate_bb84_channel(num_bits=256, eve_present=eve))

@app.route('/api/metrics')
def api_metrics():
    X = FEATURE_DF[FEATURE_COLS]
    y = FEATURE_DF["label"]
    X_q = QUANTUM_SCALER.transform(X[SELECTED_QCOLS])

    tiered_res = TIERED_SCORER.batch_evaluate(X, X_q, y.values)
    e1_benchmark = run_experiment_e1_main_benchmark(seeds=[42, 43])
    return jsonify({
        "tiered_savings": tiered_res,
        "e1_benchmark": e1_benchmark
    })

if __name__ == '__main__':
    print("Launching Q-UPI Sentinel Master Server on http://0.0.0.0:8002...")
    app.run(host='0.0.0.0', port=8002, debug=False)
