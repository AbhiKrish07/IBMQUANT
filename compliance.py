"""Compliance evidence exporter for the Q-UPI Sentinel demo.

This module contains only the compliance report/route logic. It exposes a
Flask blueprint that is registered by unified_app.py; it does not create or
start a separate application. The output is an evidence snapshot, not a legal
or regulatory attestation.
"""

from datetime import datetime, timezone
from uuid import uuid4

from flask import Blueprint, current_app, jsonify


FRAMEWORK_REFERENCES = [
    {
        "name": "NIST FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)",
        "url": "https://csrc.nist.gov/pubs/fips/203/final",
        "assessment_status": "NOT_ASSESSED",
    },
    {
        "name": "NIST FIPS 204 — Module-Lattice-Based Digital Signature Standard (ML-DSA)",
        "url": "https://csrc.nist.gov/pubs/fips/204/final",
        "assessment_status": "NOT_ASSESSED",
    },
    {
        "name": "ETSI GS QKD 014 — QKD key delivery API specification",
        "url": "https://www.etsi.org/deliver/etsi_gs/QKD/001_099/014/01.01.01_60/gs_qkd014v010101p.pdf",
        "assessment_status": "NOT_ASSESSED",
    },
    {
        "name": "Applicable NPCI/RBI payment requirements (specific control set/version not supplied)",
        "assessment_status": "NOT_ASSESSED",
        "reason": "A scoped regulation/control catalogue and accountable compliance review are required.",
    },
]


def build_compliance_report(sample_count: int, positive_label_count: int, metrics: dict) -> dict:
    """Return the JSON-ready evidence snapshot for the supplied demo metrics."""
    return {
        "report_id": f"Q-UPI-DEMO-{uuid4().hex[:12].upper()}",
        "generated_at_utc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "overall_status": "NOT_ASSESSED",
        "report_purpose": "Engineering evidence snapshot for a synthetic-data demonstration.",
        "limitations": [
            "This report is not a compliance assessment, certification, audit opinion, or regulatory sign-off.",
            "The evaluation uses synthetic data and evaluates the models on data used during training; results are in-sample and not independent validation.",
            "Savings are illustrative estimates from fixed assumptions, not measured production or monthly savings.",
            "No production deployment, external control evidence, cryptographic validation, or legal review is included.",
        ],
        "framework_references": FRAMEWORK_REFERENCES,
        "implementation_observations": {
            "post_quantum_cryptography": {
                "status": "NOT_DEMONSTRATED",
                "observation": "The reviewed application code does not demonstrate ML-KEM or ML-DSA operations. This is a source review observation, not a complete dependency or deployment scan.",
                "evidence_files": ["unified_app.py", "requirements.txt"],
            },
            "qkd": {
                "status": "SIMULATION_ONLY",
                "observation": "The BB84 module simulates random bits and QBER in software; it does not evidence a live optical channel, QKD key management network, or production key delivery.",
                "evidence_files": ["q_upi/qkd_simulator.py"],
            },
            "quantum_machine_learning": {
                "status": "SIMULATION_ONLY",
                "observation": "The kernel is computed with local Qiskit statevectors when available, otherwise a NumPy fallback; this does not evidence execution on quantum hardware or a verified Bloq backend.",
                "evidence_files": ["q_upi_sentinel/quantum_models.py"],
            },
            "payment_regulatory_controls": {
                "status": "NOT_ASSESSED",
                "observation": "No control-by-control mapping, implementation evidence, or independent review is provided.",
            },
        },
        "evaluation": {
            "data_source": "synthetic",
            "sample_count": int(sample_count),
            "positive_label_count": int(positive_label_count),
            "method": "in_sample",
            "metrics": {
                "gray_zone_traffic_percent": metrics["gray_zone_traffic_pct"],
                "true_positives_on_synthetic_data": int(metrics["tp_prevented_fraud"]),
                "false_positives_on_synthetic_data": int(metrics["fp_false_positives"]),
                "estimated_savings_inr_on_synthetic_batch": metrics["rupee_net_savings_inr"],
            },
            "illustrative_cost_assumptions_inr": {
                "average_fraud_value": 25000,
                "manual_review_cost": 50,
                "false_positive_friction_cost": 20,
            },
        },
    }


def create_compliance_blueprint(report_context_provider):
    """Create the report route using metrics supplied by the existing app."""
    blueprint = Blueprint("compliance_exporter", __name__)

    @blueprint.get("/api/export-report")
    def export_report():
        try:
            context = report_context_provider()
            report = build_compliance_report(
                sample_count=context["sample_count"],
                positive_label_count=context["positive_label_count"],
                metrics=context["metrics"],
            )
            return jsonify(report), 200
        except Exception:
            current_app.logger.exception("Could not build compliance evidence report")
            return jsonify({
                "error": "Report unavailable",
                "overall_status": "NOT_ASSESSED",
            }), 503

    return blueprint
