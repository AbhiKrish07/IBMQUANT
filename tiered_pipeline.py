"""
Q-UPI Enterprise - 3-Stage Tiered Fraud Pipeline
================================================
S1: O(1) classical pre-filter  -> approve / block obvious cases
S2: Quantum-kernel SVM (ZZFeatureMap, simulated statevector) on the GRAY ZONE only
S3: Analyst queue, ranked by risk, for what S2 still can't decide

NOTE: Stage 2 is a classical *simulation* of a 4-qubit quantum kernel (numpy).
The data is synthetic. Say both things in your demo.

Run:  python tiered_pipeline.py
Needs: numpy, scikit-learn
"""
import json
import time
import heapq
from dataclasses import dataclass, field

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

RNG = np.random.default_rng(42)
FEATURES = ["velocity_score", "location_drift", "device_integrity", "ticket_variance"]


# ----------------------------------------------------------------------------
# 0. Synthetic UPI data (fraud depends on NONLINEAR feature interactions)
# ----------------------------------------------------------------------------
def make_data(n=6000):
    X = RNG.uniform(0, 1, size=(n, 4))
    v, loc, dev, tick = X.T
    # Obvious fraud: everything extreme (easy for a linear pre-filter)
    obvious = (v > 0.85) & (loc > 0.85)
    # Subtle mule patterns: only visible through interactions (XOR-like)
    subtle = ((v > 0.5) ^ (loc > 0.5)) & ((dev < 0.35) ^ (tick > 0.65)) & (v * tick > 0.12)
    y = (obvious | subtle).astype(int)
    # Label noise so nothing is perfectly separable
    flip = RNG.random(n) < 0.02
    y = np.where(flip, 1 - y, y)
    return X, y


# ----------------------------------------------------------------------------
# Simulated quantum kernel: ZZFeatureMap(n_qubits=4, reps=2), fidelity kernel
# ----------------------------------------------------------------------------
class QuantumKernel:
    def __init__(self, n_qubits=4, reps=2, bandwidth=0.4):
        self.n, self.reps, self.dim = n_qubits, reps, 2 ** n_qubits
        self.bw = bandwidth  # feature scaling: tuned on validation data
        h = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
        self.Hn = h
        for _ in range(n_qubits - 1):
            self.Hn = np.kron(self.Hn, h)
        self.bits = np.array([[(s >> (n_qubits - 1 - q)) & 1 for q in range(n_qubits)]
                              for s in range(self.dim)])  # (dim, n)

    def state(self, x):
        """Statevector |phi(x)> in 2^n-dim Hilbert space."""
        x = np.asarray(x) * self.bw
        psi = np.zeros(self.dim, dtype=complex)
        psi[0] = 1.0
        for _ in range(self.reps):
            psi = self.Hn @ psi
            phase = np.zeros(self.dim)
            for i in range(self.n):                      # P(2*x_i)
                phase += 2 * x[i] * self.bits[:, i]
            for i in range(self.n):                      # CX-P(2(pi-xi)(pi-xj))-CX
                for j in range(i + 1, self.n):
                    parity = self.bits[:, i] ^ self.bits[:, j]
                    phase += 2 * (np.pi - x[i]) * (np.pi - x[j]) * parity
            psi = np.exp(1j * phase) * psi
        return psi

    def states(self, X):
        return np.array([self.state(x) for x in X])

    @staticmethod
    def gram(SA, SB):
        """K(a,b) = |<phi(a)|phi(b)>|^2"""
        return np.abs(SA.conj() @ SB.T) ** 2


# ----------------------------------------------------------------------------
# The pipeline
# ----------------------------------------------------------------------------
@dataclass(order=True)
class QueueItem:
    priority: float
    txn_id: int = field(compare=False)
    score: float = field(compare=False)


class TieredPipeline:
    def __init__(self, target_recall_s1=0.97, target_precision_s1=0.85,
                 s2_margin=0.3, max_qsvm_train=400):
        self.target_recall_s1 = target_recall_s1
        self.target_precision_s1 = target_precision_s1
        self.s2_margin = s2_margin
        self.max_qsvm_train = max_qsvm_train
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.s1 = DecisionTreeClassifier(max_depth=4, min_samples_leaf=20, random_state=0)  # O(1): 4 comparisons
        self.qk = QuantumKernel()
        self.qsvm = SVC(kernel="precomputed", C=10.0, class_weight="balanced")
        self.queue = []  # Stage 3 analyst queue (max-heap via negative priority)

    # ---------- training ----------
    def fit(self, X, y):
        Xs = self.scaler.fit_transform(X)
        Xa, Xv, ya, yv = train_test_split(Xs, y, test_size=0.3, random_state=1, stratify=y)

        # Stage 1: fit LR, then tune (low, high) on validation data
        self.s1.fit(Xa, ya)
        p = self.s1.predict_proba(Xv)[:, 1]
        self.low = self._tune_low(p, yv)
        self.high = self._tune_high(p, yv)
        if self.low >= self.high:  # safety: keep a non-empty gray zone
            mid = (self.low + self.high) / 2
            self.low, self.high = mid - 0.05, mid + 0.05

        # Stage 2: train QSVM ONLY on gray-zone samples
        p_train = self.s1.predict_proba(Xa)[:, 1]
        gz = (p_train >= self.low) & (p_train <= self.high)
        Xg, yg = Xa[gz], ya[gz]
        if len(Xg) > self.max_qsvm_train:
            idx = RNG.choice(len(Xg), self.max_qsvm_train, replace=False)
            Xg, yg = Xg[idx], yg[idx]
        self.gray_train_size = len(Xg)
        # tune kernel bandwidth on gray-zone validation samples (F1)
        pv = self.s1.predict_proba(Xv)[:, 1]
        gzv = (pv >= self.low) & (pv <= self.high)
        Xgv, ygv = Xv[gzv], yv[gzv]
        best_f1, best_bw = -1, 0.4
        for bw in (0.25, 0.4, 0.6):
            qk = QuantumKernel(bandwidth=bw)
            S = qk.states(Xg)
            m = SVC(kernel="precomputed", C=10.0, class_weight="balanced").fit(qk.gram(S, S), yg)
            pred = m.predict(qk.gram(qk.states(Xgv[:300]), S))
            f1 = f1_score(ygv[:300], pred, zero_division=0)
            if f1 > best_f1:
                best_f1, best_bw = f1, bw
        self.qk = QuantumKernel(bandwidth=best_bw)
        self.best_bw = best_bw
        self.S_train = self.qk.states(Xg)
        self.qsvm.fit(self.qk.gram(self.S_train, self.S_train), yg)
        self.S_sv = self.S_train[self.qsvm.support_]
        return self

    def _tune_low(self, p, y):
        """Largest `low` such that auto-approved set still has >= target recall of fraud."""
        best = 0.0
        for t in np.linspace(0, 1, 201):
            missed = ((p < t) & (y == 1)).sum() / max(y.sum(), 1)
            if (1 - missed) >= self.target_recall_s1:
                best = t
        return best

    def _tune_high(self, p, y):
        """Smallest `high` such that auto-blocked set has >= target precision."""
        for t in np.linspace(0, 1, 201):
            m = p > t
            if m.sum() >= 5 and (y[m].mean() >= self.target_precision_s1):
                return t
        return 1.0

    # ---------- inference ----------
    def _qsvm_score(self, x_scaled):
        s = self.qk.state(x_scaled)
        k = self.qk.gram(s[None, :], self.S_sv)  # (1, n_sv)
        return float((k @ self.qsvm.dual_coef_.T + self.qsvm.intercept_).item())

    def decide(self, txn_id, x_raw):
        """Returns (verdict, stage, score, latency_ms)."""
        t0 = time.perf_counter()
        x = self.scaler.transform(x_raw.reshape(1, -1))[0]

        # Stage 1 - O(1)
        p = float(self.s1.predict_proba(x.reshape(1, -1))[0, 1])
        if p < self.low:
            return "APPROVE", 1, p, (time.perf_counter() - t0) * 1e3
        if p > self.high:
            return "BLOCK", 1, p, (time.perf_counter() - t0) * 1e3

        # Stage 2 - quantum kernel on gray zone
        d = self._qsvm_score(x)
        if d > self.s2_margin:
            return "BLOCK", 2, d, (time.perf_counter() - t0) * 1e3
        if d < -self.s2_margin:
            return "APPROVE", 2, d, (time.perf_counter() - t0) * 1e3

        # Stage 3 - analyst queue (riskiest first)
        heapq.heappush(self.queue, QueueItem(-d, txn_id, d))
        return "REVIEW", 3, d, (time.perf_counter() - t0) * 1e3

    def next_for_analyst(self):
        return heapq.heappop(self.queue) if self.queue else None


# ----------------------------------------------------------------------------
# Evaluation
# ----------------------------------------------------------------------------
def rates(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return dict(fpr=fp / max(fp + tn, 1), recall=tp / max(tp + fn, 1),
                precision=tp / max(tp + fp, 1))


def main():
    X, y = make_data()
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=7, stratify=y)

    print("Training 3-stage pipeline...")
    pipe = TieredPipeline().fit(Xtr, ytr)
    print(f"  Stage-1 thresholds: approve < {pipe.low:.3f} | block > {pipe.high:.3f}")
    print(f"  QSVM trained on {pipe.gray_train_size} gray-zone samples, kernel bandwidth {pipe.best_bw}\n")

    # --- run the pipeline on the test set ---
    results, lat = [], []
    stage_count = {1: 0, 2: 0, 3: 0}
    stage_lat = {1: [], 2: [], 3: []}
    for i, x in enumerate(Xte):
        verdict, stage, score, ms = pipe.decide(i, x)
        results.append(verdict)
        lat.append(ms)
        stage_count[stage] += 1
        stage_lat[stage].append(ms)

    # Stage 3 items are unresolved: treat REVIEW as "flagged" for FPR/recall,
    # and report the analyst workload separately.
    y_pipe = np.array([1 if r in ("BLOCK", "REVIEW") else 0 for r in results])
    auto_only = np.array([1 if r == "BLOCK" else 0 for r in results])

    n = len(Xte)
    print("=== ROUTING SPLIT ===")
    for s in (1, 2, 3):
        avg = np.mean(stage_lat[s]) if stage_lat[s] else 0
        print(f"  Stage {s}: {stage_count[s]:4d} txns ({stage_count[s]/n:6.1%})  avg {avg:6.2f} ms")
    print(f"\n=== LATENCY (end-to-end, simulated quantum kernel) ===")
    print(f"  avg {np.mean(lat):.2f} ms | p95 {np.percentile(lat, 95):.2f} ms | p99 {np.percentile(lat, 99):.2f} ms")

    # --- baselines (each model scores EVERY transaction) ---
    sc = pipe.scaler
    Xtr_s, Xte_s = sc.transform(Xtr), sc.transform(Xte)
    baselines = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=150, random_state=0),
        "Gradient Boosting": GradientBoostingClassifier(random_state=0),
        "RBF-SVM": SVC(kernel="rbf", C=4.0, gamma="scale"),
    }
    table = {}
    for name, m in baselines.items():
        m.fit(Xtr_s, ytr)
        table[name] = rates(yte, m.predict(Xte_s))
    table["3-Stage Pipeline (flag = block+review)"] = rates(yte, y_pipe)
    table["3-Stage Pipeline (auto-block only)"] = rates(yte, auto_only)

    print("\n=== BENCHMARK (synthetic data) ===")
    print(f"  {'Model':42s} {'FPR':>7s} {'Recall':>8s} {'Precision':>10s}")
    for name, r in table.items():
        print(f"  {name:42s} {r['fpr']:7.1%} {r['recall']:8.1%} {r['precision']:10.1%}")
    print(f"\n  Analyst workload: {stage_count[3]} of {n} txns ({stage_count[3]/n:.1%}) reach Stage 3")

    # --- export for the UI / compliance report ---
    out = {
        "thresholds": {"approve_below": pipe.low, "block_above": pipe.high,
                       "qsvm_margin": pipe.s2_margin},
        "routing": {f"stage_{s}": {"count": stage_count[s], "share": stage_count[s] / n,
                                   "avg_ms": float(np.mean(stage_lat[s])) if stage_lat[s] else 0}
                    for s in (1, 2, 3)},
        "latency_ms": {"avg": float(np.mean(lat)), "p95": float(np.percentile(lat, 95)),
                       "p99": float(np.percentile(lat, 99))},
        "benchmark": table,
        "disclaimer": "Synthetic data; Stage 2 is a classical statevector simulation of a 4-qubit ZZFeatureMap kernel.",
    }
    with open("pipeline_metrics.json", "w") as f:
        json.dump(out, f, indent=2)
    print("\nSaved pipeline_metrics.json")

    # --- demo: one clean, one gray, one fraud transaction ---
    print("\n=== DEMO TRANSACTIONS ===")
    demos = {
        "Clean   ": np.array([0.10, 0.05, 0.90, 0.10]),
        "Gray    ": np.array([0.60, 0.30, 0.25, 0.70]),
        "Obvious ": np.array([0.97, 0.95, 0.10, 0.90]),
    }
    for label, x in demos.items():
        v, s, sc_, ms = pipe.decide(9000, x)
        print(f"  {label} -> {v:7s} at Stage {s} | score {sc_:+.3f} | {ms:.2f} ms")


class TieredPipelineScorer:
    def __init__(self, classical_model, quantum_engine, t_low=0.20, t_high=0.80, t_quantum=0.50):
        self.classical_model = classical_model
        self.quantum_engine = quantum_engine
        self.t_low = t_low
        self.t_high = t_high
        self.t_quantum = t_quantum

    def score_transaction(self, class_feats_scaled, quant_feats_scaled):
        s1_prob = float(self.classical_model.predict_proba(class_feats_scaled)[0, 1])
        if s1_prob < self.t_low:
            return {
                "decision": "PASS_AUTO_APPROVE",
                "stage_used": "Stage 1 Fast-Path Clear",
                "s1_score": round(s1_prob, 4),
                "s2_score": None,
                "review_required": False
            }
        elif s1_prob > self.t_high:
            return {
                "decision": "BLOCK_AND_CHALLENGE",
                "stage_used": "Stage 1 Fast-Path Block",
                "s1_score": round(s1_prob, 4),
                "s2_score": None,
                "review_required": True
            }
        else:
            s2_prob = float(self.quantum_engine.predict_proba(quant_feats_scaled)[0])
            decision = "BLOCK_AND_CHALLENGE" if s2_prob >= self.t_quantum else "PASS_AUTO_APPROVE"
            return {
                "decision": decision,
                "stage_used": "Stage 2 Quantum Hilbert Review",
                "s1_score": round(s1_prob, 4),
                "s2_score": round(s2_prob, 4),
                "review_required": s2_prob >= self.t_quantum
            }

    def batch_evaluate(self, X, X_q, y):
        s1_probs = self.classical_model.predict_proba(X)[:, 1]
        stage1_cleared = s1_probs < self.t_low
        stage1_blocked = s1_probs > self.t_high
        gray_zone_mask = (s1_probs >= self.t_low) & (s1_probs <= self.t_high)
        
        s2_probs = np.zeros(len(X))
        if np.any(gray_zone_mask):
            s2_probs[gray_zone_mask] = self.quantum_engine.predict_proba(X_q[gray_zone_mask])
            
        final_decisions = np.where(stage1_blocked, 1, np.where(stage1_cleared, 0, (s2_probs >= self.t_quantum).astype(int)))
        
        return {
            "stage1_clear_count": int(np.sum(stage1_cleared)),
            "stage1_block_count": int(np.sum(stage1_blocked)),
            "gray_zone_count": int(np.sum(gray_zone_mask)),
            "final_decisions": final_decisions.tolist(),
            "s1_scores": s1_probs.tolist(),
            "s2_scores": s2_probs.tolist()
        }

if __name__ == "__main__":
    main()
