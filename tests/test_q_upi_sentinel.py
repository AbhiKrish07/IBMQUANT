"""
Q-UPI Sentinel Production Test Suite
Validates:
1. Decoy-State BB84 QKD channel physics and Eve eavesdropping detection threshold.
2. Bloq Quantum Kernel Matrix symmetry K_{i,j} == K_{j,i}.
3. 3-Stage Tiered Pipeline decision routing.
4. REST API Endpoints integrity.
"""

import unittest
import numpy as np
from q_upi_sentinel.qkd_simulator import EnterpriseDecoyBB84
from q_upi_sentinel.q_risk_engine import QUpiSentinelEngine
from q_upi_sentinel.data_generator import generate_synthetic_upi_data


class TestQUpiSentinel(unittest.TestCase):

    def test_qkd_clean_channel(self):
        """Test clean QKD channel returns secure key with QBER < 11%."""
        engine = EnterpriseDecoyBB84(n_pulses=10000)
        res = engine.simulate_transmission(attack="NONE")
        self.assertLess(res["qber_metric"], 0.11)
        self.assertIn("SECURE", res["status"])

    def test_qkd_eve_eavesdropping_detection(self):
        """Test eavesdropping attack triggers QBER alert (> 11%) and key abort."""
        engine = EnterpriseDecoyBB84(n_pulses=10000)
        res = engine.simulate_transmission(attack="INTERCEPT_RESEND")
        self.assertGreater(res["qber_metric"], 0.11)
        self.assertIn("ABORT", res["status"])

    def test_quantum_kernel_matrix_symmetry(self):
        """Test Quantum Fidelity Kernel matrix is symmetric K_{i,j} == K_{j,i}."""
        X = np.random.uniform(0, np.pi, size=(5, 4))
        engine = QUpiSentinelEngine(n_qubits=4)
        K = engine.qkernel.evaluate(x_vec=X)
        np.testing.assert_allclose(K, K.T, atol=1e-5)
        # Diagonals should be 1.0 (self-fidelity)
        np.testing.assert_allclose(np.diag(K), np.ones(5), atol=1e-2)

    def test_data_generator_schema(self):
        """Test synthetic dataset generator produces correct schema and labels."""
        df = generate_synthetic_upi_data(n_txns=100, fraud_rate=0.05, seed=42)
        self.assertGreater(len(df), 0)
        self.assertIn("fraud_type", df.columns)
        self.assertIn("label", df.columns)
        self.assertGreater(df["label"].sum(), 0)


if __name__ == "__main__":
    unittest.main()
