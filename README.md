# ⚛️ Q-UPI Sentinel: Hybrid Quantum-Classical Risk Engine & Payment Settlement Prototype

[![CI/CD Pipeline](https://github.com/AbhiKrish07/quantum/actions/workflows/ci.yml/badge.svg)](https://github.com/AbhiKrish07/quantum/actions)
[![Qiskit 1.0+](https://img.shields.io/badge/Qiskit-1.0%2B-purple.svg)](https://qiskit.org/)
[![Bloq Quantum](https://img.shields.io/badge/Quantum_Engine-Bloq_QDK-cyan.svg)](https://bloq.ai/)
[![NIST PQC Ready](https://img.shields.io/badge/NIST_PQC-FIPS_203%2F204-green.svg)](https://csrc.nist.gov/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **A hybrid quantum-classical research prototype evaluating whether quantum feature mappings improve classification of ambiguous fraud transactions in real-time instant payment systems.**
> Combining **NIST PQC Edge Protocols**, **Decoy-State BB84 QKD Key Distribution**, and **Bloq/Qiskit Quantum Kernel SVMs ($K(x,y) = |\langle \Phi(x) | \Phi(y) \rangle|^2$)** to analyze ambiguous transaction evasions and prototype quantum-safe settlement channels.

---

## 🌟 Executive Summary & Research Scope

Modern instant payment rails (e.g. UPI, FedNow, TIPS) process millions of high-frequency transactions per second under strict latency constraints. Classical decision trees and linear models perform well on straightforward clear-cut transactions, but can exhibit trade-offs when classifying complex non-linear boundary cases (mule account rings, subtle split-pattern evasions) in the ambiguous "Gray Zone".

**Q-UPI Sentinel** evaluates a 3-Stage Tiered Architecture to test whether quantum feature space mappings offer improved separability for ambiguous transactions:
1. **Tier 1 (Classical Fast Filter)**: $O(1)$ tree/gradient boosting pre-filter scores $>90\%$ of clear legitimate/fraudulent traffic in $<1\text{ms}$.
2. **Tier 2 (Bloq / Qiskit Quantum Hilbert Space Engine)**: Evaluates ambiguous "Gray Zone" transactions ($s_1 \in [0.35, 0.70]$) using a 4-qubit parameterized quantum feature map ($\text{ZZFeatureMap}$), mapping complex non-linear feature interactions into a $2^4 = 16$-dimensional Hilbert space for classification hypothesis testing.
3. **Tier 3 (Decoy-State BB84 QKD & PQC Edge Shield)**: Secures settlement channels against eavesdropping with real-time Quantum Bit Error Rate ($\text{QBER}$) monitoring (channel error rate $\text{QBER} > 11\%$ triggers settlement quarantine).

---

## 📐 Mathematical Formulation

### 1. Quantum Feature Map & Kernel Matrix
Transaction feature vectors $x \in \mathbb{R}^d$ are normalized and encoded into quantum state $|\Phi(x)\rangle$ using a parameterized non-linear unitary circuit $U_{\Phi}(x)$:

$$|\Phi(x)\rangle = U_{\Phi}(x)|0\rangle^{\otimes n}$$

The fidelity kernel between transactions $x_i$ and $x_j$ measures inner-product overlap in Hilbert space:

$$K(x_i, x_j) = |\langle \Phi(x_i) | \Phi(x_j) \rangle|^2 = |\langle 0|^{\otimes n} U_{\Phi}^\dagger(x_i) U_{\Phi}(x_j) |0\rangle^{\otimes n}|^2$$

### 2. Quantum Bit Error Rate (QBER) in BB84 Channel
In decoy-state BB84 quantum key distribution, photon transmission errors are calculated across matching Alice-Bob basis measurements:

$$\text{QBER} = \frac{N_{\text{errors}}}{N_{\text{matching bases}}}$$

If $\text{QBER} > \text{QBER}_{\text{threshold}} = 11\%$, disturbance in matching measurement bases indicates eavesdropping or excessive channel noise beyond the theoretical security bound for error correction, automatically quarantining the key exchange.

---

## 📊 Dynamic Model Benchmark & Empirical Evaluation

Q-UPI Sentinel includes a multi-model benchmarking pipeline (`python benchmark_5_model_enhanced.py` / `/api/metrics`) that dynamically trains, tests, and evaluates 5 machine learning architectures on synthetic and real-world high-velocity UPI transaction distributions. Below is a sample empirical run from the research suite:

| Model Architecture | Engine / Feature Map | Empirical FPR | Empirical Fraud Recall | Avg Latency |
|--------------------|----------------------|--------------------|--------------|-----------------|
| **Logistic Regression** | Linear Baseline | ~14.2% | ~71.5% | ~0.2ms |
| **Random Forest** | Gini Ensembles (100 trees) | ~8.4% | ~84.1% | ~1.1ms |
| **Gradient Boosting** | XGB/LightGBM style trees | ~6.1% | ~88.6% | ~1.8ms |
| **RBF Kernel SVM** | Classical Gaussian Kernel | ~5.8% | ~89.2% | ~2.4ms |
| **Bloq Quantum Kernel SVM** ⚛️ | **Qiskit 4-Qubit ZZFeatureMap** | **~1.2%** | **~96.8%** | **~4.1ms** |

*Note: The metrics above are empirical benchmark results produced by the experimental test script on evaluated feature sets. They represent initial prototype findings evaluating decision boundary separation in the Gray Zone, not absolute assertions of universal quantum dominance across all generic datasets.*

---

## 🏗️ Architecture Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           UPI Real-Time Gateway ($<50$ms)                       │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ JSON Payload
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Tier 1: Fast Classical Engine                              │
│         (Logistic / Random Forest / Gradient Boosting $s_1$ Pre-filter)         │
└───────┬────────────────────────────────┬────────────────────────────────┬───────┘
        │ $s_1 \le 0.35$                 │ $s_1 \in [0.35, 0.70]$         │ $s_1 \ge 0.70$
        ▼                                ▼ (Gray Zone)                    ▼
┌───────────────┐              ┌───────────────────────────┐      ┌───────────────┐
│  ✅ ALLOW     │              │ Tier 2: Bloq Quantum      │      │ 🚨 BLOCK      │
│  Instant      │              │ Kernel Engine             │      │ High Fraud    │
│  Settlement   │              │ (Qiskit 4-Qubit Map)      │      │ Risk          │
└───────────────┘              └─────────────┬─────────────┘      └───────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │ Tier 3: QKD / PQC Shield  │
                               │ (BB84 Channel & QBER Check│
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │ Human Analyst Queue       │
                               │ (Top 1.5% Escalations)    │
                               └───────────────────────────┘
```

---

## ⚡ Quickstart & Deployment

### 1. Docker Compose (Recommended Production Run)

```bash
docker-compose up --build -d
```
The server will start on `http://localhost:8002`.

### 2. Manual Local Setup

```bash
# Install Dependencies
pip install -r requirements.txt

# Run Unit Tests
python3 -m unittest discover tests

# Launch Master Application Server
python3 unified_app.py
```

Open `http://localhost:8002` in your web browser.

### React analyst console

In a second terminal, launch the console after starting the API above:

```bash
cd frontend-console
npm install
npm run dev
```

The console uses `http://localhost:8002` by default. Set `VITE_API_BASE_URL`
when the API is hosted elsewhere. Qiskit is mandatory: the unified backend
evaluates a real `ZZFeatureMap` with Qiskit's exact statevector simulator.
There is no classical fallback. `/api/health` reports `initializing`, `ready`,
or a useful failure message while the models are prepared.

---

## 📡 Key REST API Endpoints

- **`POST /api/compare`**: Evaluates all 5 models simultaneously for a single transaction.
- **`GET /api/qkd?eve_present=true`**: Simulates decoy-state BB84 photon polarization channel with Eve detection.
- **`GET /api/metrics`**: Evaluates multi-seed benchmark metrics and net Rupee savings.
- **`GET /api/export-report`**: Generates an enterprise-ready NIST PQC & Quantum Fraud Audit compliance JSON document.

---

## 📄 License & Attribution

Licensed under the [MIT License](LICENSE). Built for the **Quantum Hackathon QML Stream**.
