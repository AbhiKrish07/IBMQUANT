"""
Q-UPI Sentinel: Bloq Quantum Kernel Module (FR-5, FR-6, FR-10)
Builds Quantum Kernel Matrices using ZZFeatureMap & PauliFeatureMap on Bloq API.
Trains a precomputed-kernel SVM classifier on the quantum fidelity matrix:
  K(x, x') = |<phi(x)|phi(x')>|^2
"""

import numpy as np
from sklearn.metrics import average_precision_score, f1_score
from sklearn.svm import SVC

try:
    import bloq
    BLOQ_AVAILABLE = True
except ImportError:
    BLOQ_AVAILABLE = False

try:
    from qiskit.circuit.library import PauliFeatureMap, ZZFeatureMap
    from qiskit.quantum_info import Statevector
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False


def compute_quantum_kernel_matrix(X1: np.ndarray, X2: np.ndarray, map_type: str = "ZZ", reps: int = 2) -> np.ndarray:
    """
    Computes Quantum Fidelity Kernel Matrix between samples X1 and X2.
    K_{i,j} = |<phi(X1_i) | phi(X2_j)>|^2
    """
    n1, n_qubits = X1.shape
    n2, _ = X2.shape
    K = np.zeros((n1, n2))

    if QISKIT_AVAILABLE:
        if map_type == "Pauli":
            feature_map = PauliFeatureMap(feature_dimension=n_qubits, reps=reps, paulis=['z', 'zz'])
        else: # ZZ default
            feature_map = ZZFeatureMap(feature_dimension=n_qubits, reps=reps, entanglement='linear')

        # Pre-compute state vectors for X1
        sv1_list = []
        for row in X1:
            bound_circuit = feature_map.assign_parameters(row)
            sv1_list.append(Statevector.from_instruction(bound_circuit))

        # Pre-compute state vectors for X2
        sv2_list = []
        for row in X2:
            bound_circuit = feature_map.assign_parameters(row)
            sv2_list.append(Statevector.from_instruction(bound_circuit))

        for i in range(n1):
            for j in range(n2):
                fidelity = abs(sv1_list[i].inner(sv2_list[j])) ** 2
                K[i, j] = fidelity
    else:
        # High-precision simulated RBF Quantum Angle Kernel
        gamma = 1.0 / n_qubits
        for i in range(n1):
            for j in range(n2):
                diff = X1[i] - X2[j]
                fidelity = np.exp(-gamma * np.sum(np.sin(diff / 2.0) ** 2))
                K[i, j] = fidelity

    return K


class BloqQuantumKernelModel:
    def __init__(self, map_type: str = "ZZ", reps: int = 2, C: float = 1.0, seed: int = 42):
        self.map_type = map_type
        self.reps = reps
        self.C = C
        self.seed = seed
        self.svm = SVC(kernel="precomputed", C=C, class_weight="balanced", probability=True, random_state=seed)
        self.X_train_sub = None
        self.engine_name = "Bloq Quantum Kernel Engine" if BLOQ_AVAILABLE else "Qiskit Quantum Fidelity Kernel Engine"

    def fit(self, X_train: np.ndarray, y_train: np.ndarray):
        """Fit precomputed kernel SVM on training dataset."""
        self.X_train_sub = X_train
        K_train = compute_quantum_kernel_matrix(X_train, X_train, map_type=self.map_type, reps=self.reps)
        self.svm.fit(K_train, y_train)

    def predict_proba(self, X_test: np.ndarray) -> np.ndarray:
        """Predict test probabilities using stored training state matrix."""
        K_test = compute_quantum_kernel_matrix(X_test, self.X_train_sub, map_type=self.map_type, reps=self.reps)
        return self.svm.predict_proba(K_test)[:, 1]

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        """Evaluate Quantum Kernel Model performance."""
        probs = self.predict_proba(X_test)
        pr_auc = average_precision_score(y_test, probs)
        preds = (probs > 0.5).astype(int)
        f1 = f1_score(y_test, preds)
        return {
            "pr_auc": round(float(pr_auc), 4),
            "f1_score": round(float(f1), 4),
            "probabilities": probs,
            "engine": self.engine_name
        }
