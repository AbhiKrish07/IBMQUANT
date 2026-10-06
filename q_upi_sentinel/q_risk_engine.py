import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
try:
    from lightgbm import LGBMClassifier
    HAS_LGBM = True
except (ImportError, OSError):
    from sklearn.ensemble import GradientBoostingClassifier
    HAS_LGBM = False
from imblearn.over_sampling import SMOTE
from sklearn.svm import SVC
from qiskit.circuit.library import ZZFeatureMap
from qiskit.quantum_info import Statevector


class QiskitStatevectorKernel:
    """Exact Qiskit statevector fidelity kernel for the interactive backend.

    This uses Qiskit's ``ZZFeatureMap`` and ``Statevector`` simulator directly.
    It avoids the much slower sampler job-per-pair approach, while retaining a
    genuine Qiskit circuit simulation for every encoded transaction.
    """
    def __init__(self, n_qubits=4, reps=2, entanglement="linear", shots=None):
        self.n_qubits = min(max(1, n_qubits), 8)
        self.reps = max(1, min(5, reps))
        self.entanglement = entanglement if entanglement in ("linear", "full", "circular") else "linear"
        self.shots = shots
        self.feature_map = ZZFeatureMap(
            feature_dimension=self.n_qubits, reps=self.reps, entanglement=self.entanglement
        )

    def _state(self, features):
        """Bind transaction features to a Qiskit circuit and simulate it."""
        x = np.asarray(features, dtype=float)[:self.n_qubits]
        if x.size < self.n_qubits:
            x = np.pad(x, (0, self.n_qubits - x.size))
        values = {parameter: value for parameter, value in zip(self.feature_map.parameters, x)}
        return Statevector.from_instruction(self.feature_map.assign_parameters(values)).data

    def evaluate(self, x_vec, y_vec=None):
        if y_vec is None:
            y_vec = x_vec
        state_x = np.asarray([self._state(x) for x in x_vec])
        state_y = np.asarray([self._state(y) for y in y_vec])
        return np.abs(state_x.conj() @ state_y.T) ** 2


class QUpiSentinelEngine:
    def __init__(self, n_qubits=4, reps=2, entanglement="linear", shots=None):
        self.n_qubits = n_qubits
        self.reps = reps
        self.entanglement = entanglement
        self.shots = shots
        
        # Classical Preprocessing (Paper 1 Mandate: Vuppala 2024)
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=n_qubits)
        self.smote = SMOTE(random_state=42) # Handles RTP Imbalance (Paper 2: Gurajada 2025)
        
        # Stage 1: Classical Fast-Path (LightGBM or GradientBoostingClassifier)
        if HAS_LGBM:
            self.classical_fast_model = LGBMClassifier(n_estimators=100, random_state=42, verbose=-1)
        else:
            self.classical_fast_model = GradientBoostingClassifier(n_estimators=100, random_state=42)
        
        # Stage 2: mandatory Qiskit quantum kernel.  There is deliberately no
        # classical substitute: missing Qiskit is a deployment configuration error.
        self.qkernel = QiskitStatevectorKernel(
            n_qubits=self.n_qubits, reps=self.reps, entanglement=self.entanglement, shots=self.shots
        )
        self.feature_map = self.qkernel.feature_map
        
        # The Quantum Classifier (Using precomputed kernel matrix for probability outputs)
        self.svm = SVC(kernel="precomputed", class_weight="balanced", probability=True, random_state=42)
        self.X_quantum_train = None

    def train_pipeline(self, X_train, y_train):
        """
        Trains both the Classical Fast-Path and the Quantum Gray-Zone model.
        """
        print("[*] Stage 1: Scaling and reducing features to fit Qubit count (Vuppala 2024)...")
        X_scaled = self.scaler.fit_transform(X_train)
        X_pca = self.pca.fit_transform(X_scaled)
        
        print("[*] Stage 2: Balancing Dataset via SMOTE (Gurajada 2025)...")
        X_bal, y_bal = self.smote.fit_resample(X_pca, y_train)
        
        print("[*] Stage 3: Training Classical Fast-Path (LightGBM)...")
        self.classical_fast_model.fit(X_bal, y_bal)
        
        # CRITICAL HACKATHON TRICK: Only train QSVM on a subset of the dataset for sub-second execution
        print("[*] Stage 4: Training Resource-Efficient QSVM (Das 2025)...")
        sample_size = min(150, len(X_bal))
        gray_zone_indices = np.random.choice(len(X_bal), size=sample_size, replace=False)
        X_quantum_train = X_bal[gray_zone_indices]
        y_quantum_train = y_bal[gray_zone_indices]
        
        self.X_quantum_train = X_quantum_train
        
        # Precompute the kernel matrix
        K_train = self.qkernel.evaluate(x_vec=X_quantum_train)
        self.svm.fit(K_train, y_quantum_train)
        print("[+] Pipeline Training Complete.")

    def evaluate_transaction(self, raw_tx_features):
        """
        The Real-Time Inference Pipeline.
        Takes 1 transaction and routes it based on Tiered Architecture.
        """
        # 1. Preprocess
        tx_scaled = self.scaler.transform([raw_tx_features])
        tx_pca = self.pca.transform(tx_scaled)
        
        # 2. Stage 1 Classical Scoring
        classical_prob = float(self.classical_fast_model.predict_proba(tx_pca)[0][1]) # Probability of Fraud
        
        # 3. The Triage Logic
        if classical_prob < 0.35:
            return {
                "decision": "CLEARED",
                "stage_used": "Classical (LightGBM)",
                "classical_score": round(classical_prob, 4),
                "quantum_score": None
            }
        elif classical_prob > 0.65:
            return {
                "decision": "BLOCKED - OBVIOUS FRAUD",
                "stage_used": "Classical (LightGBM)",
                "classical_score": round(classical_prob, 4),
                "quantum_score": None
            }
        else:
            # THE GRAY ZONE: Route to Quantum
            K_test = self.qkernel.evaluate(x_vec=tx_pca, y_vec=self.X_quantum_train)
            quantum_pred = int(self.svm.predict(K_test)[0])
            quantum_prob = float(self.svm.predict_proba(K_test)[0][1])
            verdict = "BLOCKED BY QUANTUM KERNEL" if quantum_pred == 1 else "CLEARED BY QUANTUM KERNEL"
            
            return {
                "decision": verdict,
                "stage_used": "Quantum (QSVM)",
                "classical_score": round(classical_prob, 4),
                "quantum_score": round(quantum_prob, 4)
            }
            
    def predict_proba(self, X_pca_test):
        """Helper to expose probabilities directly for the frontend UI"""
        K_test = self.qkernel.evaluate(x_vec=X_pca_test, y_vec=self.X_quantum_train)
        return self.svm.predict_proba(K_test)[:, 1]
