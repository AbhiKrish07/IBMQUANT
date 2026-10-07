export interface CanonicalTransaction {
  id: string;
  title: string;
  category: string;
  amount_inr: number;
  velocity_1h: number;
  velocity_24h: number;
  geo_speed_kmh: number;
  device_age_days: number;
  is_new_payee: number;
  payee_in_degree_24h: number;
  ground_truth: 'MULE_FRAUD' | 'LEGITIMATE';
  description: string;
  s1_score: number;
  s2_score: number;
  stage_used: string;
  decision: string;
  quantum_angles: [number, number, number, number];
  qkd_status: string;
  qkd_qber: number;
}

export const CANONICAL_TRANSACTIONS: CanonicalTransaction[] = [
  {
    id: 'TXN-84921',
    title: 'Ambiguous Mule Split Burst',
    category: 'Gray Zone Mule',
    amount_inr: 15000,
    velocity_1h: 3,
    velocity_24h: 10,
    geo_speed_kmh: 110,
    device_age_days: 2,
    is_new_payee: 1,
    payee_in_degree_24h: 12,
    ground_truth: 'MULE_FRAUD',
    description: 'High velocity split-transfer to newly added payee. Classical Stage 1 scores s_1=0.52 (Gray Zone). Stage 2 Quantum Hilbert Kernel detects phase correlation anomaly (s_2=0.784).',
    s1_score: 0.52,
    s2_score: 0.784,
    stage_used: 'Stage 2 Quantum Hilbert Review',
    decision: 'FLAGGED FOR ANALYST REVIEW',
    quantum_angles: [2.35, 0.40, 0.73, 0.38],
    qkd_status: 'SECURE_QKD_KEY_EXCHANGE_ACTIVE',
    qkd_qber: 0.014
  },
  {
    id: 'TXN-8801',
    title: 'High-Velocity Mule Cashout',
    category: 'Mule Network',
    amount_inr: 45000,
    velocity_1h: 9,
    velocity_24h: 28,
    geo_speed_kmh: 310,
    device_age_days: 1,
    is_new_payee: 1,
    payee_in_degree_24h: 34,
    ground_truth: 'MULE_FRAUD',
    description: 'Rapid series of high-value transfers to a newly created account with extreme incoming velocity.',
    s1_score: 0.61,
    s2_score: 0.912,
    stage_used: 'Stage 2 Quantum Hilbert Review',
    decision: 'FLAGGED FOR ANALYST REVIEW',
    quantum_angles: [2.69, 0.60, 1.03, 0.66],
    qkd_status: 'SECURE_QKD_KEY_EXCHANGE_ACTIVE',
    qkd_qber: 0.018
  },
  {
    id: 'TXN-8802',
    title: 'High-Volume Executive Salary Batch',
    category: 'Corporate Payroll',
    amount_inr: 125000,
    velocity_1h: 6,
    velocity_24h: 15,
    geo_speed_kmh: 25,
    device_age_days: 420,
    is_new_payee: 0,
    payee_in_degree_24h: 85,
    ground_truth: 'LEGITIMATE',
    description: 'Classical model false-flags this due to high amount and 1h velocity (s_1=0.48), but Quantum phase correlation detects established payee relationship (s_2=0.145).',
    s1_score: 0.48,
    s2_score: 0.145,
    stage_used: 'Stage 2 Quantum Hilbert Review',
    decision: 'AUTO-APPROVED (CLASSICAL FALSE POSITIVE CORRECTED)',
    quantum_angles: [2.98, 0.40, 0.16, 0.85],
    qkd_status: 'SECURE_QKD_KEY_EXCHANGE_ACTIVE',
    qkd_qber: 0.012
  },
  {
    id: 'TXN-8803',
    title: 'Impossible Travel ATO Drainer',
    category: 'Account Takeover',
    amount_inr: 89000,
    velocity_1h: 4,
    velocity_24h: 8,
    geo_speed_kmh: 840,
    device_age_days: 0,
    is_new_payee: 1,
    payee_in_degree_24h: 12,
    ground_truth: 'MULE_FRAUD',
    description: 'Login location shifted 800+ km within 1 hour on an unregistered device. Fast-path auto-blocked in Stage 1.',
    s1_score: 0.985,
    s2_score: 0.991,
    stage_used: 'Stage 1 Fast-Path Auto-Block',
    decision: 'BLOCKED AT STAGE 1 FAST PATH',
    quantum_angles: [2.89, 0.27, 2.80, 0.38],
    qkd_status: 'EAVESDROPPER_DETECTED_QKD_ABORTED',
    qkd_qber: 0.148
  },
  {
    id: 'TXN-8804',
    title: 'Daily Merchant Grocery Payment',
    category: 'Retail UPI',
    amount_inr: 450,
    velocity_1h: 1,
    velocity_24h: 3,
    geo_speed_kmh: 5,
    device_age_days: 180,
    is_new_payee: 0,
    payee_in_degree_24h: 150,
    ground_truth: 'LEGITIMATE',
    description: 'Standard low-risk UPI QR code payment at verified local merchant. Fast-path auto-approved in Stage 1.',
    s1_score: 0.032,
    s2_score: 0.021,
    stage_used: 'Stage 1 Fast-Path Auto-Approve',
    decision: 'AUTO-APPROVED AT STAGE 1 FAST PATH',
    quantum_angles: [1.52, 0.07, 0.03, 0.95],
    qkd_status: 'SECURE_QKD_KEY_EXCHANGE_ACTIVE',
    qkd_qber: 0.011
  }
];
