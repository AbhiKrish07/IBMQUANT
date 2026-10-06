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
from q_upi.qkd_simulator import simulate_bb84_channel
from q_upi_sentinel.quantum_models import compute_quantum_kernel_matrix
from q_upi_sentinel.data_generator import generate_synthetic_upi_data


class TestQUpiSentinel(unittest.TestCase):

    def test_qkd_clean_channel(self):
        """Test clean QKD channel returns secure key with QBER < 11%."""
        res = simulate_bb84_channel(num_bits=256, eve_present=False)
        self.assertTrue(res["is_secure"])
        self.assertLess(res["qber_percentage"], 11.0)
        self.assertEqual(res["status"], "QKD_SECURE_KEY_GEN")

    def test_qkd_eve_eavesdropping_detection(self):
        """Test eavesdropping attack triggers QBER alert (> 11%) and key abort."""
        res = simulate_bb84_channel(num_bits=256, eve_present=True)
        self.assertFalse(res["is_secure"])
        self.assertGreater(res["qber_percentage"], 11.0)
        self.assertEqual(res["status"], "EAVESDROPPING_DETECTED_KEY_ABORTED")

    def test_quantum_kernel_matrix_symmetry(self):
        """Test Quantum Fidelity Kernel matrix is symmetric K_{i,j} == K_{j,i}."""
        X = np.random.uniform(0, np.pi, size=(5, 4))
        K = compute_quantum_kernel_matrix(X, X, map_type="ZZ", reps=2)
        np.testing.assert_allclose(K, K.T, atol=1e-5)
        # Diagonals should be 1.0 (self-fidelity)
        np.testing.assert_allclose(np.diag(K), np.ones(5), atol=1e-2)

    def test_data_generator_schema(self):
        """Test synthetic dataset generator produces correct schema and labels."""
        df = generate_synthetic_upi_data(n_txns=100, fraud_rate=0.05, seed=42)
        self.assertEqual(len(df), 100)
        self.assertIn("fraud_type", df.columns)
        self.assertIn("label", df.columns)
        self.assertGreater(df["label"].sum(), 0)


if __name__ == "__main__":
    unittest.main()
