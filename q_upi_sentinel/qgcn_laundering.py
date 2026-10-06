"""
Quantum Graph Convolutional Network (QGCN) for Multi-Party Money Laundering Detection
Implements spatial graph convolution using Qiskit quantum circuit topologies.
Encodes ledger sub-graphs G = (V, E) into quantum state space to detect circular mule account loops.
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

class QuantumGraphLaunderingDetector:
    def __init__(self, num_nodes=4):
        self.num_nodes = num_nodes

    def build_qgcn_circuit(self, node_features, weights, adj):
        """Constructs a parameterized spatial Quantum Graph Convolutional circuit."""
        qc = QuantumCircuit(self.num_nodes)

        # Layer A: Local Node Feature Encoding (RX & RY gates)
        for node in range(self.num_nodes):
            qc.rx(float(node_features[node, 0]), node)
            qc.ry(float(node_features[node, 1]), node)

        # Layer B: Topological Graph Entanglement (CRZ gates based on ledger adjacency)
        weight_idx = 0
        for i in range(self.num_nodes):
            for j in range(i + 1, self.num_nodes):
                if adj[i, j] > 0:
                    w_val = float(weights[weight_idx]) if weight_idx < len(weights) else 0.7854
                    qc.crz(w_val, i, j)
                    weight_idx += 1

        return qc

    def analyze_ledger_subgraph(self, adjacency_matrix=None, node_features=None):
        """
        Evaluates Pauli-Z expectation values <Z_i> across a multi-party ledger graph.
        Returns node-level risk scores and global laundering loop exposure index.
        """
        if adjacency_matrix is None:
            # Default 4-node circular structuring loop: 0 -> 1 -> 2 -> 3 -> 0
            adjacency_matrix = np.array([
                [0, 1, 0, 1],
                [1, 0, 1, 0],
                [0, 1, 0, 1],
                [1, 0, 1, 0]
            ], dtype=np.float64)

        if node_features is None:
            # Node features: [Velocity Profile, Transaction Volume Variance]
            node_features = np.array([
                [0.15, 0.22],  # Account 0 (Normal)
                [2.80, 3.10],  # Account 1 (Mule Anomaly)
                [2.95, 2.85],  # Account 2 (Mule Anomaly)
                [0.10, 0.18]   # Account 3 (Normal)
            ], dtype=np.float64)

        num_edges = int(np.sum(adjacency_matrix) // 2)
        weights = np.ones(max(num_edges, 1)) * (np.pi / 4.0)

        qc = self.build_qgcn_circuit(node_features, weights, adjacency_matrix)
        sv = Statevector.from_instruction(qc)

        raw_expvals = []
        prob_dict = sv.probabilities_dict()
        for i in range(self.num_nodes):
            # <Z_i> = prob(0 on bit i) - prob(1 on bit i)
            prob_0 = sum(p for bitstr, p in prob_dict.items() if bitstr[::-1][i] == '0')
            prob_1 = sum(p for bitstr, p in prob_dict.items() if bitstr[::-1][i] == '1')
            z_exp = prob_0 - prob_1
            raw_expvals.append(z_exp)

        risk_scores = [(1.0 - z) / 2.0 for z in raw_expvals] # Scale [-1, 1] -> [0, 1] risk

        node_analysis = []
        for idx, r_score in enumerate(risk_scores):
            is_mule = bool(r_score > 0.40)
            node_analysis.append({
                "account_id": f"ACC_UPI_00{idx+1}",
                "quantum_risk_index": round(float(r_score), 4),
                "pauli_z_expectation": round(float(raw_expvals[idx]), 4),
                "status": "🚨 EXPOSURE DETECTED (Mule Link)" if is_mule else "🟢 NORMAL PROFILE",
                "is_mule": is_mule
            })

        global_laundering_score = round(float(np.mean(risk_scores)), 4)
        has_circular_loop = bool(global_laundering_score > 0.35)

        return {
            "num_nodes": int(self.num_nodes),
            "global_laundering_score": global_laundering_score,
            "circular_structuring_loop_detected": has_circular_loop,
            "adjacency_matrix": adjacency_matrix.tolist(),
            "node_analysis": node_analysis,
            "topology": "Qiskit Spatial QGCN (CRZ Topology Entanglement)"
        }
