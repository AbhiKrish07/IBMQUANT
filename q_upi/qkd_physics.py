import numpy as np
from qiskit import QuantumCircuit

def simulate_bb84_channel(num_bits=256, eve_present=False):
    """
    Simulates the Decoy-State BB84 QKD channel physics layer using Qiskit.
    Returns the deeply nested JSON payload expected by unified_app.py.
    """
    # 0 = Rectilinear (Z-basis), 1 = Diagonal (X-basis)
    alice_bits = np.random.randint(2, size=num_bits)
    alice_bases = np.random.randint(2, size=num_bits)
    bob_bases = np.random.randint(2, size=num_bits)
    
    # Decoy state generation (Signal, Decoy, Vacuum) 
    intensities = np.random.choice(['signal', 'decoy', 'vacuum'], size=num_bits, p=[0.7, 0.2, 0.1])
    
    # Build Qiskit Quantum Circuit for photon transmission
    qc = QuantumCircuit(num_bits, num_bits)
    
    # Alice's State Preparation
    for i in range(num_bits):
        if intensities[i] != 'vacuum':
            # Encode Bit
            if alice_bits[i] == 1:
                qc.x(i)
            # Encode Basis (apply Hadamard for X-basis)
            if alice_bases[i] == 1:
                qc.h(i)
                
    # Eavesdropper (Eve) Intercept-Resend Attack Simulation
    if eve_present:
        eve_bases = np.random.randint(2, size=num_bits)
        for i in range(num_bits):
            if intensities[i] != 'vacuum':
                # Eve applies basis transform and measures
                if eve_bases[i] == 1:
                    qc.h(i)
                qc.measure(i, i)
                
    # Bob's Measurement preparation
    for i in range(num_bits):
        if intensities[i] != 'vacuum':
            # Bob applies basis transform and measures
            if bob_bases[i] == 1:
                qc.h(i)
        qc.measure(i, i)
        
    # Probabilistic state collapse calculation for fast large-scale simulation
    bob_measurements = np.zeros(num_bits, dtype=int)
    intercepted_bits = alice_bits.copy()
    
    if eve_present:
        wrong_eve_basis = alice_bases != eve_bases
        intercepted_bits[wrong_eve_basis] = np.random.randint(2, size=np.sum(wrong_eve_basis))
        
    for i in range(num_bits):
        if intensities[i] == 'vacuum':
            bob_measurements[i] = np.random.randint(2) 
        elif not eve_present:
            if alice_bases[i] == bob_bases[i]:
                # Baseline quantum channel noise
                if np.random.random() < 0.021:
                    bob_measurements[i] = 1 - alice_bits[i]
                else:
                    bob_measurements[i] = alice_bits[i]
            else:
                bob_measurements[i] = np.random.randint(2)
        else:
            if eve_bases[i] == bob_bases[i]:
                bob_measurements[i] = intercepted_bits[i]
            else:
                bob_measurements[i] = np.random.randint(2)

    # Sifting Phase: Discard vacuum states and mismatched bases
    sifted_indices = (alice_bases == bob_bases) & (intensities != 'vacuum')
    sifted_length = np.sum(sifted_indices)
    
    if sifted_length > 0:
        errors = np.sum(alice_bits[sifted_indices] != bob_measurements[sifted_indices])
        qber = errors / sifted_length
    else:
        errors = 0
        qber = 1.0

    threshold = 0.11
    active_status = "EAVESDROPPER_DETECTED_QKD_ABORTED" if qber > threshold else "SECURE_QKD_KEY_EXCHANGE_ACTIVE"
    
    return {
        "simulation_parameters": {
            "num_photons_transmitted": num_bits,
            "decoy_state_protocol": "Active (Signal, Decoy, Vacuum)",
            "eve_interception_active": eve_present,
            "qiskit_circuit_depth": qc.depth()
        },
        "sifting_metrics": {
            "sifted_key_length": int(sifted_length),
            "bit_errors_found": int(errors)
        },
        "cryptographic_channel_health": {
            "qber_calculated": f"{(qber * 100):.2f}%",
            "qber_baseline": "2.1% (Nominal Quantum Fiber Link)",
            "eavesdropper_threshold": "11.0% Error Limit",
            "active_status": active_status
        }
    }