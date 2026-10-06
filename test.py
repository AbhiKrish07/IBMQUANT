import numpy as np
from q_risk_engine import QUpiSentinelEngine

# 1. Generate Fake Training Data (Imagine this is 5000 UPI transactions)
# 10 features: velocity, amount, device_age, etc.
np.random.seed(42)
X_train_mock = np.random.rand(1000, 10) 
y_train_mock = np.random.randint(2, size=1000) # 0 for legit, 1 for fraud

# 2. Initialize and Train our Engine
engine = QUpiSentinelEngine(n_qubits=4) # 4 Qubits aligns with Paper 3 Resource Efficiency
engine.train_pipeline(X_train_mock, y_train_mock)

# 3. Test a new incoming transaction
incoming_tx = np.random.rand(10) # 10 raw classical features
result = engine.evaluate_transaction(incoming_tx)

print("\n--- LIVE TRANSACTION VERDICT ---")
for key, value in result.items():
    print(f"{key.upper()}: {value}")
