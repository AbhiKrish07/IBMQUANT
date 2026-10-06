"""
Q-UPI Enterprise: FastAPI Server (Quantum-Secured Payment Settlement Network)
Exposes endpoints for BB84 QKD Transit simulation, QSVM Anomaly Evaluation, and UPI Transactions.
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

from q_upi.qkd_simulator import simulate_bb84_channel
from q_upi.risk_engine import QUpiRiskEngine

app = FastAPI(
    title="Q-UPI Enterprise API",
    description="Quantum-Secured Unified Payments Interface (Qiskit + Bloq Stack)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = QUpiRiskEngine()


class UPITransactionRequest(BaseModel):
    payer_vpa: str = "user@okhdfcbank"
    payee_vpa: str = "merchant@icici"
    amount: float = 2500.0
    velocity: float = 1.2
    geo_drift_km: float = 12.5
    device_trust: float = 0.95
    simulate_eve_attack: bool = False


@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Q-UPI Enterprise Console</title>
        <style>
            body { background-color: #0d1117; color: #58a6ff; font-family: monospace; padding: 20px; }
            h1 { color: #3fb950; text-shadow: 0 0 10px #3fb950; }
            .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            button { background: #238636; color: white; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; border-radius: 6px; }
            button:hover { background: #2ea043; }
            pre { background: #010409; padding: 15px; border-radius: 6px; color: #79c0ff; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>⚡ Q-UPI Enterprise: Quantum-Secured Payment Settlement Network</h1>
        <p><strong>Stack:</strong> Qiskit (BB84 QKD & ZZFeatureMap Physics) + Bloq Quantum Enterprise Engine</p>
        
        <div class="card">
            <h3>📡 Tier 2: QKD Interbank Channel Test</h3>
            <button onclick="runQKD(false)">Run Clean QKD Transit</button>
            <button onclick="runQKD(true)" style="background:#da3633;">Simulate Eve Eavesdropping Attack</button>
            <pre id="qkdResult">Awaiting test execution...</pre>
        </div>

        <div class="card">
            <h3>🛡️ Tier 3: UPI Transaction Settlement & Quantum Risk Evaluation</h3>
            <button onclick="processTx(false)">Pay ₹2,500 (Normal User)</button>
            <button onclick="processTx(true)" style="background:#d29922;">Pay ₹95,000 (High Velocity Mule Risk)</button>
            <pre id="txResult">Awaiting transaction...</pre>
        </div>

        <script>
            async function runQKD(eve) {
                const res = await fetch(`/api/v1/qkd/simulate?eve_present=${eve}`);
                const data = await res.json();
                document.getElementById('qkdResult').innerText = JSON.stringify(data, null, 2);
            }
            async function processTx(isRisk) {
                const payload = isRisk ? {
                    payer_vpa: "mule_suspect@ybl",
                    payee_vpa: "crypto_mixer@binance",
                    amount: 95000.0,
                    velocity: 8.5,
                    geo_drift_km: 450.0,
                    device_trust: 0.15,
                    simulate_eve_attack: false
                } : {
                    payer_vpa: "user@okhdfcbank",
                    payee_vpa: "coffee_shop@paytm",
                    amount: 250.0,
                    velocity: 1.0,
                    geo_drift_km: 2.0,
                    device_trust: 0.98,
                    simulate_eve_attack: false
                };
                const res = await fetch('/api/v1/upi/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                document.getElementById('txResult').innerText = JSON.stringify(data, null, 2);
            }
        </script>
    </body>
    </html>
    """


@app.get("/api/v1/qkd/simulate")
def api_qkd_simulate(eve_present: bool = False):
    """Simulate Qiskit Decoy-State BB84 QKD channel."""
    return simulate_bb84_channel(num_bits=256, eve_present=eve_present)


@app.post("/api/v1/upi/pay")
def api_process_upi_payment(req: UPITransactionRequest):
    """
    Process UPI transaction through QKD Transit check & Bloq/Qiskit QSVM Risk Engine.
    """
    # 1. QKD Key Exchange Check
    qkd_status = simulate_bb84_channel(num_bits=128, eve_present=req.simulate_eve_attack)
    if not qkd_status["is_secure"]:
        raise HTTPException(
            status_code=403,
            detail=f"QKD Security Violation: Eavesdropper detected! QBER = {qkd_status['qber_percentage']}%. Key exchange aborted."
        )

    # 2. Bloq + Qiskit Cognitive Settlement Risk Engine Evaluation
    risk_evaluation = risk_engine.evaluate_transaction(
        velocity=req.velocity,
        geo_drift=req.geo_drift_km,
        device_integrity=req.device_trust,
        tx_amount=req.amount
    )

    return {
        "status": "APPROVED" if not risk_evaluation["is_anomaly"] else "REJECTED_QUANTUM_RISK",
        "payer_vpa": req.payer_vpa,
        "payee_vpa": req.payee_vpa,
        "amount_inr": req.amount,
        "qkd_transit": qkd_status,
        "quantum_risk_assessment": risk_evaluation,
        "architecture_note": "Qiskit BB84 & ZZFeatureMap Physics Layer + Bloq Quantum Execution Engine"
    }


if __name__ == "__main__":
    uvicorn.run("q_upi.main:app", host="0.0.0.0", port=8000, reload=True)
