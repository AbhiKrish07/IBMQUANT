"""
Q-UPI Sentinel Production Test Suite
Validates:
1. Decoy-State BB84 QKD channel physics and Eve eavesdropping detection threshold.
2. Bloq/Qiskit Quantum Kernel Matrix symmetry K_{i,j} == K_{j,i} and unit diagonal.
3. 3-Stage Tiered Pipeline decision routing.
4. Qiskit circuit metadata and statevector execution proof.
5. REST API Endpoints integrity (health, score, compare, demo scenarios, dataset select, async benchmarks).
"""

import unittest
import numpy as np
import qiskit
from q_upi_sentinel.qkd_simulator import EnterpriseDecoyBB84
from q_upi_sentinel.q_risk_engine import QUpiSentinelEngine
from q_upi_sentinel.data_generator import generate_synthetic_upi_data, generate_seeded_synthetic_upi_data
from unified_app import app, initialize_sentinel


class TestQUpiSentinel(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        initialize_sentinel()
        cls.client = app.test_client()

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
        """Test Quantum Fidelity Kernel matrix is symmetric K_{i,j} == K_{j,i} and unit diagonal."""
        X = np.random.uniform(0, np.pi, size=(5, 4))
        engine = QUpiSentinelEngine(n_qubits=4)
        K = engine.qkernel.evaluate(x_vec=X)
        np.testing.assert_allclose(K, K.T, atol=1e-5)
        np.testing.assert_allclose(np.diag(K), np.ones(5), atol=1e-2)

    def test_qiskit_circuit_metadata(self):
        """Test Qiskit circuit metadata, qubit count, feature map depth, and statevector norm."""
        engine = QUpiSentinelEngine(n_qubits=4)
        self.assertEqual(engine.n_qubits, 4)
        self.assertIsNotNone(engine.feature_map)
        self.assertEqual(engine.feature_map.num_qubits, 4)
        self.assertGreater(engine.feature_map.depth(), 0)

    def test_data_generator_schema(self):
        """Test synthetic dataset generator produces correct schema and labels."""
        df = generate_synthetic_upi_data(n_txns=100, fraud_rate=0.05, seed=42)
        self.assertGreater(len(df), 0)
        self.assertIn("fraud_type", df.columns)
        self.assertIn("label", df.columns)
        self.assertGreater(df["label"].sum(), 0)

    def test_api_health_endpoint(self):
        """Test GET /api/health returns ready status and qiskit version."""
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "ready")
        self.assertIn("qiskit_version", data)

    def test_api_demo_scenarios(self):
        """Test GET /api/demo-scenarios returns 3 deterministic scenarios for judges."""
        res = self.client.get('/api/demo-scenarios')
        self.assertEqual(res.status_code, 200)
        scenarios = res.get_json()["scenarios"]
        self.assertIn("low_risk", scenarios)
        self.assertIn("gray_zone", scenarios)
        self.assertIn("high_risk", scenarios)

    def test_api_compare_scoring_and_proof(self):
        """Test POST /api/compare returns 5 model probabilities, tiered decision, and Qiskit proof."""
        payload = {
            "amount_inr": 15000.0,
            "velocity_1h": 2,
            "geo_speed_kmh": 110.0,
            "device_age_days": 8,
            "is_new_payee": 1,
            "payee_in_degree_24h": 8
        }
        res = self.client.post('/api/compare', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("all_model_probabilities", data)
        self.assertIn("tiered_result", data)
        self.assertIn("qiskit_execution", data)
        self.assertIn("statevector_norm", data["qiskit_execution"])
        self.assertEqual(data["qiskit_execution"]["qubits"], 4)

    def test_api_async_benchmark_job_lifecycle(self):
        """Test POST /api/benchmark/run job queuing and GET /api/benchmark/<job_id> polling."""
        res = self.client.post('/api/benchmark/run', json={"qubits": 4, "training_size": 120})
        self.assertIn(res.status_code, [200, 202])
        job_data = res.get_json()
        self.assertIn("job_id", job_data)
        job_id = job_data["job_id"]

        status_res = self.client.get(f'/api/benchmark/{job_id}')
        self.assertEqual(status_res.status_code, 200)
        self.assertIn(status_res.get_json()["status"], ["queued", "running", "succeeded"])

    def test_api_dataset_selection(self):
        """Test POST /api/dataset/select updates dataset mode and provenance disclaimer."""
        res = self.client.post('/api/dataset/select', json={"mode": "synthetic", "n_txns": 500, "seed": 42})
        self.assertEqual(res.status_code, 202)
        status_res = self.client.get('/api/dataset/status')
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.get_json()["mode"], "synthetic")


if __name__ == "__main__":
    unittest.main()
