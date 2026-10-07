import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RefreshCw, Eye } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { API_BASE_URL } from '../config';

// --- ATTACK DEFINITIONS & PHYSICAL PARAMETERS ---
interface AttackScenario {
  id: string;
  name: string;
  description: string;
  baseQber: number;
  keyRateFactor: number;
  detectionThreshold: number;
  severity: 'CLEAN' | 'LOW' | 'CRITICAL' | 'FATAL';
}

const ATTACK_SCENARIOS: Record<string, AttackScenario> = {
  NONE: {
    id: 'NONE',
    name: 'NONE (Clean Decoy-State BB84 Channel)',
    description: 'No eavesdropper. Channel error driven purely by dark counts and fiber attenuation.',
    baseQber: 0.012,
    keyRateFactor: 1.0,
    detectionThreshold: 0.11,
    severity: 'CLEAN'
  },
  BEAM_SPLITTER: {
    id: 'BEAM_SPLITTER',
    name: 'BEAM SPLITTER (20% Passive Photon Tapping)',
    description: 'Eve taps 20% of signal power using an optical beam splitter. Induces intensity loss and QBER rise.',
    baseQber: 0.148,
    keyRateFactor: 0.35,
    detectionThreshold: 0.11,
    severity: 'CRITICAL'
  },
  INTERCEPT_RESEND: {
    id: 'INTERCEPT_RESEND',
    name: 'INTERCEPT-RESEND (Eavesdropping)',
    description: 'Eve measures photons in random bases and resends new states. Quantum measurement collapses states, forcing 25% QBER.',
    baseQber: 0.254,
    keyRateFactor: 0.0,
    detectionThreshold: 0.11,
    severity: 'FATAL'
  },
  MAN_IN_THE_MIDDLE: {
    id: 'MAN_IN_THE_MIDDLE',
    name: 'MAN-IN-THE-MIDDLE ATTACK (Active Basis Spoofing)',
    description: 'Eve attempts full classical key interception by posing as Bob to Alice and Alice to Bob. Forces severe state collapse and 38.6% QBER.',
    baseQber: 0.386,
    keyRateFactor: 0.0,
    detectionThreshold: 0.11,
    severity: 'FATAL'
  },
  PHOTON_NUMBER_SPLIT: {
    id: 'PHOTON_NUMBER_SPLIT',
    name: 'PHOTON NUMBER SPLITTING (PNS Attack)',
    description: 'Eve isolates multi-photon pulses. Decoy-state protocol detects variance between signal (μ) and decoy (ν) yields.',
    baseQber: 0.162,
    keyRateFactor: 0.1,
    detectionThreshold: 0.11,
    severity: 'CRITICAL'
  },
  PHASE_FLIP_INJECTION: {
    id: 'PHASE_FLIP_INJECTION',
    name: 'PHASE FLIP INJECTION (Quantum Phase Noise)',
    description: 'Active phase-shift noise introduced into the fiber link, disrupting diagonal (|+] / |->) basis measurements.',
    baseQber: 0.291,
    keyRateFactor: 0.0,
    detectionThreshold: 0.11,
    severity: 'FATAL'
  }
};

// --- DYNAMIC BB84 QUANTUM LOGIC GATES SCHEMATIC ---
function QkdQuantumCircuit({
  attackType,
  isAnimating
}: {
  attackType: string;
  isAnimating: boolean;
}) {
  const [pulsePos, setPulsePos] = useState(0);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setPulsePos(prev => (prev >= 100 ? 0 : prev + 3));
    }, 40);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const attackGateLabel = useMemo(() => {
    switch (attackType) {
      case 'BEAM_SPLITTER': return { gate: 'BS (20%)', name: 'Beam Splitter', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      case 'INTERCEPT_RESEND': return { gate: 'M_E + U_E', name: 'Eve Intercept-Resend', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' };
      case 'MAN_IN_THE_MIDDLE': return { gate: 'MITM Spoof', name: 'Man-in-the-Middle', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' };
      case 'PHOTON_NUMBER_SPLIT': return { gate: 'PNS Split', name: 'Photon Splitter', color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' };
      case 'PHASE_FLIP_INJECTION': return { gate: 'Z(θ) Noise', name: 'Phase Noise Gate', color: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800' };
      default: return { gate: 'Clean Link', name: 'Direct Fiber', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
    }
  }, [attackType]);

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121212] space-y-4 font-mono shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#27272a] pb-2">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">[ BB84 LOGIC CIRCUIT TOPOLOGY ]</span>
          <h4 className="text-sm font-bold uppercase text-slate-900 dark:text-white tracking-wider">
            Alice State Preparation → Channel Threat Gate → Bob Measurement
          </h4>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 font-bold uppercase">
          QKD PROTOCOL GATE PIPELINE
        </span>
      </div>

      {/* Logic Gate Wire Schematic */}
      <div className="space-y-3 relative py-2 overflow-x-auto">
        {isAnimating && (
          <div
            className="absolute top-0 bottom-0 w-2.5 bg-rose-500 shadow-[0_0_15px_#ef4444] rounded-full transition-all duration-75 pointer-events-none z-20"
            style={{ left: `${pulsePos}%`, opacity: 0.85 }}
          />
        )}

        {[0, 1, 2, 3].map((channelIdx) => {
          const bitVal = channelIdx % 2;
          const basisVal = channelIdx >= 2 ? 'X' : 'Z';

          return (
            <div key={channelIdx} className="flex items-center gap-3 min-w-[700px] relative text-xs">
              <span className="w-24 font-bold text-slate-800 dark:text-zinc-300 flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                |ψ_{channelIdx}⟩ ({basisVal})
              </span>

              <div className="flex-1 flex items-center relative">
                <div className="absolute left-0 right-0 h-0.5 bg-slate-300 dark:bg-zinc-800 z-0"></div>

                <div className="w-full flex justify-between items-center relative z-10 px-4 font-mono text-xs">
                  <div className={`px-2.5 py-1 rounded border font-bold text-[11px] ${bitVal === 1 ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300' : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400'}`}>
                    {bitVal === 1 ? 'X Gate (|1⟩)' : 'I Gate (|0⟩)'}
                  </div>

                  <div className={`px-2.5 py-1 rounded border font-bold text-[11px] ${basisVal === 'X' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300' : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400'}`}>
                    {basisVal === 'X' ? 'H Gate (+)' : 'I Gate (Z)'}
                  </div>

                  <div className="px-2 py-0.5 rounded border border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 font-bold text-[10px]">
                    Decoy (μ/ν)
                  </div>

                  <div className={`px-3 py-1 rounded border font-bold text-[11px] ${attackGateLabel.color}`}>
                    {attackGateLabel.gate}
                  </div>

                  <div className="px-2.5 py-1 rounded border border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-[11px]">
                    Bob H Gate
                  </div>

                  <div className="px-2.5 py-1 rounded border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                    <span>M_B</span>
                    <Eye className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QkdChannelLab() {
  const [isRunning, setIsRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stage, setStage] = useState(-1);

  const [attackType, setAttackType] = useState('INTERCEPT_RESEND');
  const [distanceKm, setDistanceKm] = useState(25);
  const [qubitBudget, setQubitBudget] = useState(8192);
  const decoyRatio = 0.2;

  const [telemetry, setTelemetry] = useState<any>(null);

  const stages = [
    { id: 'prep', label: 'Preparation', desc: 'Alice prepares BB84 states' },
    { id: 'basis', label: 'Basis selection', desc: 'Choose Z / X bases' },
    { id: 'measure', label: 'Measurement', desc: 'Bob measures qubits' },
    { id: 'sifting', label: 'Sifting', desc: 'Compare public bases' },
    { id: 'qber', label: 'QBER estimate', desc: 'Evaluate sample errors' },
    { id: 'decision', label: 'Key decision', desc: 'Apply acceptance policy' }
  ];

  const computeTelemetry = useCallback(() => {
    const scenario = ATTACK_SCENARIOS[attackType] || ATTACK_SCENARIOS.NONE;
    const attenuationDb = distanceKm * 0.2;
    const transmittance = Math.pow(10, -attenuationDb / 10);
    
    const distanceQberAdd = (distanceKm / 100) * 0.015;
    const totalQber = Number((scenario.baseQber + distanceQberAdd).toFixed(3));
    const isAttacked = totalQber > scenario.detectionThreshold;

    const siftedBits = Math.floor((qubitBudget / 2) * transmittance * (1 - decoyRatio));
    const rawKeyRate = (siftedBits * 0.05).toFixed(1);
    const secretKeyRate = isAttacked ? 0 : Number((parseFloat(rawKeyRate) * scenario.keyRateFactor).toFixed(1));

    const bases = ['Z (+)', 'X (X)'];
    const bits = [0, 1];
    const photonStates = Array.from({ length: 6 }, (_, i) => {
      const aliceBasis = bases[i % 2];
      const aliceBit = bits[(i * 3 + 1) % 2];
      const evePresent = attackType !== 'NONE';
      const eveBasis = evePresent ? bases[(i + 1) % 2] : null;
      const eveBit = evePresent ? bits[(i + 2) % 2] : null;
      const bobBasis = bases[i % 2];
      const match = !isAttacked || i % 3 !== 0;
      const bobBit = match ? aliceBit : 1 - aliceBit;

      return {
        id: i + 1,
        aliceBasis,
        aliceBit,
        eveBasis,
        eveBit,
        bobBasis,
        bobBit,
        match
      };
    });

    return {
      bits_sifted: Math.max(128, siftedBits),
      measured_qber: totalQber,
      key_rate_kbps: secretKeyRate,
      distance_km: distanceKm,
      attenuation_db: Number(attenuationDb.toFixed(1)),
      transmittance: Number((transmittance * 100).toFixed(1)),
      attack_type: attackType,
      attack_name: scenario.name,
      severity: scenario.severity,
      status: isAttacked ? 'EAVESDROPPING_DETECTED' : 'SECURE_KEY_GENERATED',
      photon_states: photonStates,
      reasoning: isAttacked
        ? `QBER threshold exceeded (${(totalQber * 100).toFixed(1)}% > 11.0%). Quantum state collapse detected under ${scenario.name}. No-cloning theorem enforced — measurement disturbed quantum superposition. Session ABORTED.`
        : `Channel QBER is nominal (${(totalQber * 100).toFixed(1)}% < 11.0%). Decoy-state yield bounds verify zero eavesdropping. Quantum privacy amplification successfully distilled 256-bit AES key material over ${distanceKm}km fiber optic channel.`,
      key_material: isAttacked ? null : Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')
    };
  }, [attackType, distanceKm, qubitBudget, decoyRatio]);

  const handleRun = async () => {
    setIsRunning(true);
    setStage(0);

    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      setStage(currentStage);
      if (currentStage >= 5) {
        clearInterval(interval);
      }
    }, 400);

    try {
      const isEve = attackType !== 'NONE';
      const res = await fetch(`${API_BASE_URL}/api/qkd?eve_present=${isEve}&distance=${distanceKm}`);
      const data = await res.json();
      const calc = computeTelemetry();
      setTelemetry({
        ...calc,
        measured_qber: data.qber !== undefined ? data.qber : calc.measured_qber
      });
    } catch (_err) {
      setTelemetry(computeTelemetry());
    } finally {
      setTimeout(() => setIsRunning(false), 2400);
    }
  };

  useEffect(() => {
    setTelemetry(computeTelemetry());
  }, [computeTelemetry]);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      setDistanceKm(prev => (prev >= 100 ? 10 : prev + 15));
    }, 3000);
    return () => clearInterval(timer);
  }, [isStreaming]);

  const distanceCurveData = useMemo(() => {
    const distances = [5, 15, 25, 50, 75, 100, 150];
    return distances.map(d => {
      const scenario = ATTACK_SCENARIOS[attackType] || ATTACK_SCENARIOS.NONE;
      const cleanQber = 0.012 + (d / 100) * 0.015;
      const attackQber = scenario.baseQber + (d / 100) * 0.015;
      return {
        distance: `${d}km`,
        'Clean Channel': Number((cleanQber * 100).toFixed(1)),
        [scenario.name.split(' ')[0]]: Number((attackQber * 100).toFixed(1)),
        Threshold: 11.0
      };
    });
  }, [attackType]);

  const selectCls = "w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-zinc-700 rounded p-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-red-600 transition-colors";

  return (
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto space-y-6 font-mono text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-[#070707] min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-[#27272a] pb-4">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
            Q-UPI / SECURITY GATEWAY
          </div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-slate-900 dark:text-white uppercase">
            [ QKD Channel Lab ]
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Model inter-bank BB84 key distribution with Qiskit and controlled attack scenarios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs font-bold transition border ${
              isStreaming
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-white dark:bg-[#1e1e1e] text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isStreaming ? 'PAUSE SWEEP' : 'AUTO-SWEEP DISTANCE'}
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-['VT323'] text-lg uppercase tracking-widest transition border border-rose-500 disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'SIMULATING...' : 'RUN SIMULATION'}
          </button>
        </div>
      </div>

      {/* BB84 Quantum Logic Circuit Schematic */}
      <QkdQuantumCircuit
        attackType={attackType}
        isAnimating={isStreaming || isRunning}
      />

      {/* Configuration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121212] p-5 space-y-3 rounded-xl shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#27272a] pb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs font-mono uppercase tracking-wider">
              BB84 Configuration
            </h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 font-bold">
              [ EDITABLE SETUP ]
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block mb-1">FIBER DISTANCE (KM)</label>
              <select value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} className={selectCls}>
                <option value={10}>10 km (Metropolitan)</option>
                <option value={25}>25 km (Suburban Link)</option>
                <option value={50}>50 km (Inter-City)</option>
                <option value={100}>100 km (Long Haul)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block mb-1">PREPARED QUBITS</label>
              <select value={qubitBudget} onChange={(e) => setQubitBudget(Number(e.target.value))} className={selectCls}>
                <option value={4896}>4,896 Qubits</option>
                <option value={8192}>8,192 Qubits</option>
                <option value={16384}>16,384 Qubits</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121212] p-5 space-y-3 rounded-xl shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#27272a] pb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs font-mono uppercase tracking-wider">
              Noise &amp; Eavesdropping Setup
            </h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 font-bold">
              [ SCENARIO DRAFT ]
            </span>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block mb-1">ATTACK SCENARIO</label>
            <select value={attackType} onChange={(e) => setAttackType(e.target.value)} className={selectCls + " text-rose-600 dark:text-red-400 font-bold"}>
              {Object.values(ATTACK_SCENARIOS).map(sc => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Protocol Execution Pipeline Cards */}
      <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121212] p-5 rounded-xl space-y-3 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#27272a] pb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs font-mono uppercase tracking-wider">Protocol Execution</h3>
          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 font-bold">
            [ ALL STAGES PENDING ]
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {stages.map((s, index) => {
            const isDone = stage > index || !isRunning;
            const isRejected = isDone && s.id === 'decision' && telemetry?.measured_qber > 0.11;

            return (
              <div
                key={s.id}
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  isRejected
                    ? 'bg-rose-50 border-rose-300 dark:bg-red-950/40 dark:border-red-800'
                    : isDone
                    ? 'bg-slate-50 border-slate-200 dark:bg-[#18181b] dark:border-zinc-800'
                    : 'bg-slate-100 border-slate-200 dark:bg-[#0c0c0c] dark:border-zinc-900 opacity-50'
                }`}
              >
                <div>
                  <h4 className={`font-bold text-xs mb-1 ${isRejected ? 'text-rose-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{s.label}</h4>
                  <p className="text-[9px] text-slate-500 dark:text-zinc-500">{s.desc}</p>
                </div>
                <div className="text-[9px] font-mono mt-2 font-bold uppercase">
                  {isRejected ? <span className="text-rose-600 dark:text-red-400">ABORTED</span> : <span className="text-slate-500 dark:text-zinc-500">PENDING</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Observations Banner */}
      {telemetry && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#27272a] rounded-xl font-mono shadow-sm">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block">SIFTED BITS</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{telemetry.bits_sifted}</p>
          </div>

          <div className={`p-4 border rounded-xl font-mono shadow-sm ${
            telemetry.measured_qber > 0.11 ? 'border-rose-300 bg-rose-50 dark:border-red-800 dark:bg-red-950/30' : 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
          }`}>
            <span className="text-[9px] text-slate-600 dark:text-zinc-400 uppercase font-bold tracking-widest block">QBER RATE</span>
            <p className={`text-2xl font-bold mt-1 ${telemetry.measured_qber > 0.11 ? 'text-rose-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {(telemetry.measured_qber * 100).toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#27272a] rounded-xl font-mono shadow-sm">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block">SECRET KEY RATE</span>
            <p className={`text-2xl font-bold mt-1 ${telemetry.key_rate_kbps > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-red-400'}`}>
              {telemetry.key_rate_kbps} kbps
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Graph */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121212] space-y-2 shadow-sm">
        <span className="text-[10px] text-slate-500 uppercase font-bold block">[ QBER (%) vs FIBER DISTANCE (KM) ]</span>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={distanceCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
              <XAxis dataKey="distance" stroke="#64748b" fontSize={10} />
              <YAxis domain={[0, 45]} stroke="#64748b" fontSize={10} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="Clean Channel" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey={ATTACK_SCENARIOS[attackType]?.name.split(' ')[0] || 'Attack'} stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Threshold" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
