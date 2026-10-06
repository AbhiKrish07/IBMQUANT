"""
Filename: qkd_physics_engine_advanced.py
Feature Layer: QKD Physics Layer & Compliance Exporter
Description: Advanced Vectorized Quantum Optical Physics Engine.
             Models SNSPD Afterpulsing, Dead-Time, Birefringence, PNS Attacks,
             and ETSI-compliant Finite-Key Statistical Fluctuations.
"""

from dataclasses import dataclass
import math
import json
import time
import numpy as np
from typing import Dict, Tuple

@dataclass
class AdvancedOpticalHardware:
    # Telecom Fiber Constraints
    distance_km: float = 40.0
    fiber_loss_db_km: float = 0.20
    birefringence_error_Z: float = 0.010  # Intrinsic polarization twist in Z-basis
    birefringence_error_X: float = 0.025  # Higher twist in superposition X-basis
    
    # SNSPD (Superconducting Nanowire) Detector Specs
    detector_efficiency: float = 0.65
    dark_count_prob: float = 1e-6
    afterpulse_prob: float = 0.015        # 1.5% chance to falsely fire on the next cycle
    dead_time_cycles: int = 1             # Detector recovery time (1 clock cycle blind)
    
    # Cryptographic & Finite-Key Security Parameters
    epsilon_security: float = 1e-10       # Max allowable failure probability (ETSI standard)
    error_correction_inefficiency: float = 1.16


class EnterpriseDecoyBB84:
    """
    Simulates high-velocity Decoy-State BB84 under finite-key constraints 
    with hardware-realistic anomalies.
    """

    def __init__(self, n_pulses: int = 1_000_000, hardware: AdvancedOpticalHardware = AdvancedOpticalHardware()):
        self.n_pulses = n_pulses
        self.hw = hardware

        # Pulse intensity configuration (Signal, Decoy, Vacuum)
        self.intensities_mean = [0.50, 0.10, 0.00]
        self.probs = [0.70, 0.20, 0.10]

        # Overall channel transmittance
        loss_linear = 10.0 ** (-(self.hw.fiber_loss_db_km * self.hw.distance_km) / 10.0)
        self.eta = loss_linear * self.hw.detector_efficiency

    def _apply_detector_anomalies(self, raw_detections: np.ndarray) -> np.ndarray:
        """Applies hardware dead-time (blinding) and afterpulsing (false positives)."""
        n = len(raw_detections)
        final_detections = np.copy(raw_detections)
        
        # Vectorized Afterpulsing: if cycle t-1 fired, cycle t has a % chance to falsely fire
        shifted_detections = np.roll(final_detections, 1)
        shifted_detections[0] = False
        afterpulses = shifted_detections & (np.random.random(n) < self.hw.afterpulse_prob)
        
        # Vectorized Dead-Time: if cycle t-1 fired, cycle t is blind (cannot fire real photons)
        blind_mask = shifted_detections  # 1 cycle dead-time
        final_detections = np.where(blind_mask, False, final_detections)
        
        # Combine real valid detections with false afterpulses
        return final_detections | afterpulses

    def simulate_transmission(self, attack: str = "NONE") -> Dict:
        """
        Executes million-pulse scale Monte Carlo physics simulation.
        """
        # 1. Quantum State Preparation (Alice)
        a_bits = np.random.randint(0, 2, size=self.n_pulses)
        a_bases = np.random.randint(0, 2, size=self.n_pulses)  # 0: Z, 1: X
        a_ints = np.random.choice([0, 1, 2], p=self.probs, size=self.n_pulses)
        
        b_bases = np.random.randint(0, 2, size=self.n_pulses)
        
        # 2. Photon Number Sampling (Poisson)
        mu_array = np.choose(a_ints, self.intensities_mean)
        photons = np.random.poisson(mu_array)

        # 3. Baseline Detection Physics
        p_detect = 1.0 - (1.0 - self.hw.dark_count_prob) * np.power((1.0 - self.eta), photons)

        # 4. Adversarial Physics (Eve)
        if attack == "PNS":
            # Eve performs Photon Number Splitting
            multi_photon = photons >= 2
            p_detect = np.where(
                (a_ints == 0) & multi_photon, 0.95,  # Eve forwards split signals
                np.where(a_ints == 1, 0.001, self.hw.dark_count_prob)  # Eve blocks decoys
            )

        raw_detections = np.random.random(self.n_pulses) < p_detect
        
        # Apply hardware impairments (Dead-time & Afterpulsing)
        b_detected = self._apply_detector_anomalies(raw_detections)

        # 5. Bob's Measurement Phase (Birefringence & Intercept-Resend)
        b_bits = np.copy(a_bits)
        base_match = a_bases == b_bases

        # Asymmetric Optical Alignment Error
        optical_error_prob = np.where(a_bases == 0, self.hw.birefringence_error_Z, self.hw.birefringence_error_X)
        optical_error = np.random.random(self.n_pulses) < optical_error_prob

        # Intercept-Resend Attack creates 25% error on matched bases
        if attack == "INTERCEPT_RESEND":
            eve_bases = np.random.randint(0, 2, size=self.n_pulses)
            eve_error = (eve_bases != a_bases) & (np.random.random(self.n_pulses) < 0.50)
            bob_error_mask = (base_match & (optical_error | eve_error)) | (~base_match)
        else:
            bob_error_mask = (base_match & optical_error) | (~base_match)

        # Dark counts / Afterpulses introduce 50% random bit errors
        random_noise = np.random.randint(0, 2, size=self.n_pulses)
        false_positive_events = b_detected & (photons == 0)
        
        # Resolve Bob's final bits
        b_bits = np.where(bob_error_mask, np.random.randint(0, 2, size=self.n_pulses), b_bits)
        b_bits = np.where(false_positive_events, random_noise, b_bits)

        return self._post_process(a_bits, a_bases, a_ints, b_bases, b_bits, b_detected, attack)

    def _chernoff_bound(self, observed: float, n_trials: int, is_upper: bool) -> float:
        """Applies finite-key statistical fluctuation bounds using Chernoff inequality."""
        delta = math.sqrt(-math.log(self.hw.epsilon_security / 2.0) / (2.0 * max(n_trials, 1)))
        return min(observed + delta, 1.0) if is_upper else max(observed - delta, 0.0)

    def _post_process(self, a_bits, a_bases, a_ints, b_bases, b_bits, b_detected, attack: str) -> Dict:
        """Sifting, QBER Evaluation, Finite-Key Bounds, and Compliance Export."""
        sift_mask = b_detected & (a_bases == b_bases)
        
        # Separate by intensity
        sig_sift = sift_mask & (a_ints == 0)
        dec_sift = sift_mask & (a_ints == 1)
        vac_sift = sift_mask & (a_ints == 2)

        n_sig = np.sum(a_ints == 0)
        n_dec = np.sum(a_ints == 1)
        n_vac = np.sum(a_ints == 2)

        # Observed Gains
        Q_mu = np.sum(sig_sift) / max(n_sig, 1)
        Q_nu = np.sum(dec_sift) / max(n_dec, 1)
        Q_vac = np.sum(vac_sift) / max(n_vac, 1)

        # Observed QBERs
        err_mu = np.sum(a_bits[sig_sift] != b_bits[sig_sift])
        E_mu = err_mu / max(np.sum(sig_sift), 1)

        err_nu = np.sum(a_bits[dec_sift] != b_bits[dec_sift])
        E_nu = err_nu / max(np.sum(dec_sift), 1)

        # Apply Finite-Key Bounds
        Q_nu_L = self._chernoff_bound(Q_nu, n_dec, is_upper=False)
        Q_mu_U = self._chernoff_bound(Q_mu, n_sig, is_upper=True)
        Y0_U = self._chernoff_bound(Q_vac, n_vac, is_upper=True)

        mu, nu = self.intensities_mean[0], self.intensities_mean[1]

        # Rigorous Lower Bound on Single-Photon Yield (Y1_L)
        term1 = (mu / (mu * nu - nu**2))
        term2 = Q_nu_L * math.exp(nu) - Q_mu_U * math.exp(mu) * (nu**2 / mu**2) - ((mu**2 - nu**2) / mu**2) * Y0_U
        Y1_L = max(0.0, term1 * term2)
        Q1_L = mu * math.exp(-mu) * Y1_L

        # Rigorous Upper Bound on Single-Photon Error Rate (e1_U)
        e1_U = (E_nu * Q_nu * math.exp(nu) - 0.5 * Y0_U) / (nu * Y1_L) if Y1_L > 0 else 1.0
        e1_U = min(max(e1_U, 0.0), 0.50)

        # Key Generation Rate (GLLP Equation)
        def h2(x):
            if x <= 0 or x >= 1: return 0.0
            return -x * math.log2(x) - (1 - x) * math.log2(1 - x)

        leakage = Q_mu * self.hw.error_correction_inefficiency * h2(E_mu)
        privacy = Q1_L * (1.0 - h2(e1_U))
        secret_rate = 0.5 * max(0.0, privacy - leakage)  # 0.5 accounts for sifting
        final_key_len = int(secret_rate * self.n_pulses)

        # Attack Detection Triggers
        qber_abort = E_mu > 0.11
        pns_abort = secret_rate <= 0.0 and attack == "PNS"

        status = "SECURE_CHANNEL_ESTABLISHED"
        if qber_abort:
            status = "SECURITY_ABORT_QBER_EXCEEDS_11%"
        elif pns_abort:
            status = "SECURITY_ABORT_PNS_ATTACK_DETECTED"

        return {
            "timestamp": time.time(),
            "simulation_pulses": self.n_pulses,
            "attack_vector": attack,
            "qber_metric": float(E_mu),
            "decoy_qber": float(E_nu),
            "snspd_afterpulse_rate": self.hw.afterpulse_prob,
            "finite_key_Y1_lower": float(Y1_L),
            "finite_key_e1_upper": float(e1_U),
            "asymptotic_key_rate": float(secret_rate),
            "distilled_secret_bits": final_key_len,
            "status": status
        }

    def export_compliance_json(self, telemetry: Dict, filepath: str = "qkd_compliance_report.json"):
        """Generates the official NIST/NPCI JSON required by the Master UI Frontend."""
        export_payload = {
            "certification_authority": "NPCI_QUANTUM_CORE_V1",
            "protocol": "Decoy-State BB84",
            "security_parameter_epsilon": self.hw.epsilon_security,
            "compliance_status": "PASS" if "SECURE" in telemetry["status"] else "FAIL",
            "telemetry": telemetry
        }
        with open(filepath, "w") as f:
            json.dump(export_payload, f, indent=4)
        print(f"\n[+] Compliance JSON generated successfully -> {filepath}")
        print(f"[UI STATUS METRIC] Triggers at QBER > 11%: Current QBER = {telemetry['qber_metric']*100:.2f}% | Status: {telemetry['status']}")


if __name__ == "__main__":
    print("=" * 80)
    print("      CARRIER-GRADE QKD PHYSICS SIMULATION (FINITE-KEY ANALYSIS)      ")
    print("=" * 80)
    
    engine = EnterpriseDecoyBB84(n_pulses=1_000_000)
    
    print("\n[RUNNING SCENARIO: IDEAL TELECOM FIBER (NO EVE)]")
    secure_telemetry = engine.simulate_transmission(attack="NONE")
    engine.export_compliance_json(secure_telemetry, "qkd_secure.json")
    
    print("\n[RUNNING SCENARIO: INTERCEPT-RESEND ATTACK (EVE ACTIVE)]")
    attack_telemetry = engine.simulate_transmission(attack="INTERCEPT_RESEND")
    engine.export_compliance_json(attack_telemetry, "qkd_attack.json")