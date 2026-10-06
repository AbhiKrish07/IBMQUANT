"""
Q-UPI Sentinel: Tiered Pipeline Scorer (FR-8 & Section 8)
Implements 3-Stage Tiered Architecture:
Stage 1: Fast Classical Model (Gradient Boosting) -> Auto-Approve / Auto-Flag
Stage 2: Bloq Quantum Kernel SVM on Gray Zone (t_low <= s1 <= t_high)
Stage 3: Analyst Review Queue with Explanations
"""

import numpy as np


class TieredPipelineScorer:
    def __init__(self, classical_model, quantum_model, t_low: float = 0.20, t_high: float = 0.80, t_quantum: float = 0.50):
        self.classical_model = classical_model
        self.quantum_model = quantum_model
        self.t_low = t_low
        self.t_high = t_high
        self.t_quantum = t_quantum

    def score_transaction(self, classical_features, quantum_features_scaled) -> dict:
        """
        Scores a single transaction through the 3-stage pipeline.
        """
        # Stage 1: Fast Classical Scoring (<5ms)
        s1 = float(self.classical_model.predict_proba(classical_features)[0, 1])

        stage_reached = 1
        decision = "APPROVED_AUTO"
        s2 = None
        routing_reason = "High confidence clear score (Stage 1)"

        if s1 > self.t_high:
            decision = "FLAGGED_AUTO"
            routing_reason = "High confidence fraud score (Stage 1)"
        elif self.t_low <= s1 <= self.t_high:
            # Stage 2: Gray Zone -> Quantum Kernel SVM Evaluation
            stage_reached = 2
            routing_reason = "Gray Zone ambiguity -> Routed to Bloq Quantum Kernel"
            s2 = float(self.quantum_model.predict_proba(quantum_features_scaled)[0])

            if s2 > self.t_quantum:
                decision = "FLAGGED_QUANTUM"
            else:
                decision = "APPROVED_QUANTUM"

        final_score = s2 if s2 is not None else s1
        needs_analyst_review = decision.startswith("FLAGGED")

        return {
            "s1_classical_score": round(s1, 4),
            "s2_quantum_score": round(s2, 4) if s2 is not None else None,
            "final_score": round(final_score, 4),
            "stage_reached": stage_reached,
            "decision": decision,
            "routing_reason": routing_reason,
            "needs_analyst_review": needs_analyst_review
        }

    def batch_evaluate(self, X_class, X_quant, y_true) -> dict:
        """
        Evaluates a batch dataset and measures traffic distribution & financial metrics.
        """
        s1_probs = self.classical_model.predict_proba(X_class)[:, 1]
        n_total = len(y_true)

        stage1_auto_approve = s1_probs < self.t_low
        stage1_auto_flag = s1_probs > self.t_high
        gray_zone_mask = (s1_probs >= self.t_low) & (s1_probs <= self.t_high)

        n_gray = int(np.sum(gray_zone_mask))
        gray_pct = round((n_gray / n_total) * 100, 2)

        s2_probs = np.zeros(n_total)
        s2_probs[~gray_zone_mask] = s1_probs[~gray_zone_mask]

        if n_gray > 0:
            s2_gray = self.quantum_model.predict_proba(X_quant[gray_zone_mask])
            s2_probs[gray_zone_mask] = s2_gray

        final_decisions = np.where(s2_probs > 0.5, 1, 0)

        # Calculate Financial Rupee Net Savings (Section 9)
        # Net Savings = Prevented Fraud Loss - (Review Cost x Flagged) - (Friction Cost x False Positives)
        review_cost = 50.0   # INR 50 per manual review
        friction_cost = 20.0 # INR 20 per false positive customer friction
        avg_fraud_val = 25000.0

        tp = np.sum((final_decisions == 1) & (y_true == 1))
        fp = np.sum((final_decisions == 1) & (y_true == 0))
        flagged = tp + fp

        prevented_loss = tp * avg_fraud_val
        total_review_cost = flagged * review_cost
        total_friction_cost = fp * friction_cost
        net_savings = prevented_loss - total_review_cost - total_friction_cost

        return {
            "total_transactions": n_total,
            "gray_zone_traffic_count": n_gray,
            "gray_zone_traffic_pct": gray_pct,
            "tp_prevented_fraud": int(tp),
            "fp_false_positives": int(fp),
            "rupee_net_savings_inr": round(float(net_savings), 2)
        }
