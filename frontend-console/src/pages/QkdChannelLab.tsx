import { useState } from 'react';
import { Play } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function QkdChannelLab() {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState(-1);

  // Form selections
  const [attackType, setAttackType] = useState('INTERCEPT_RESEND');
  const [distanceKm, setDistanceKm] = useState(25);
  const [qubitBudget, setQubitBudget] = useState(4896);

  const [telemetry, setTelemetry] = useState<any>(null);

  const stages = [
    { id: 'prep', label: 'Preparation', desc: 'Alice prepares BB84 states', icon: '⚛️' },
    { id: 'basis', label: 'Basis selection', desc: 'Choose random Z/X bases', icon: '⤨' },
    { id: 'measure', label: 'Measurement', desc: 'Bob measures incoming photons', icon: '👁️' },
    { id: 'sifting', label: 'Sifting', desc: 'Public basis reconciliation', icon: '⚗️' },
    { id: 'qber', label: 'QBER estimate', desc: 'Evaluate sample error rate', icon: '📊' },
    { id: 'decision', label: 'Key decision', desc: 'Check 11.0% threshold', icon: '🔑' },
  ];

  const handleRun = async () => {
    setIsRunning(true);
    setStage(0);
    setTelemetry(null);

    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      setStage(currentStage);
      if (currentStage >= 5) {
        clearInterval(interval);
      }
    }, 600);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/qkd/telemetry?attack_type=${attackType}&distance_km=${distanceKm}`
      );
      const data = await res.json();
      if (data.success) {
        setTelemetry(data.data);
      }
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => setIsRunning(false), 3600);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">
            Q-UPI / Security Gateway
          </div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">
            QKD Channel Lab (Decoy-State BB84)
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Simulate inter-bank quantum key distribution under eavesdropping and channel attenuation (Tier 2 Roadmap).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg border border-red-600 dark:border-[#86efac] text-white font-medium text-sm flex items-center gap-2 transition ${
              isRunning
                ? 'bg-red-500 dark:bg-[#4ade80]/50 cursor-wait'
                : 'bg-red-600 dark:bg-[#86efac] hover:bg-red-500 dark:bg-[#4ade80] dark:text-gray-900'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Simulating QKD Channel...' : 'Run QKD simulation'}
          </button>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* BB84 Configuration */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">BB84 Channel Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Fiber Distance (km)</label>
              <select
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
              >
                <option value={10}>10 km (Metropolitan Core)</option>
                <option value={25}>25 km (Suburban Link)</option>
                <option value={50}>50 km (Inter-City Corridor)</option>
                <option value={100}>100 km (Long Haul)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Prepared Qubit Budget</label>
              <select
                value={qubitBudget}
                onChange={(e) => setQubitBudget(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
              >
                <option value={4896}>4,896 Qubits</option>
                <option value={8192}>8,192 Qubits</option>
                <option value={16384}>16,384 Qubits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Eavesdropping & Attack Setup */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Eavesdropper & Attack Simulation</h3>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Channel Attack Scenario</label>
            <select
              value={attackType}
              onChange={(e) => setAttackType(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-red-500 font-bold"
            >
              <option value="NONE">NONE (Clean Decoy-State BB84 Channel)</option>
              <option value="INTERCEPT_RESEND">EAVESDROPPING (BB84 Intercept-Resend)</option>
              <option value="BEAM_SPLITTER">BEAM SPLITTER (20% Photon Loss)</option>
              <option value="MAN_IN_THE_MIDDLE">MAN-IN-THE-MIDDLE ATTACK</option>
              <option value="PHOTON_NUMBER_SPLITTING">PHOTON NUMBER SPLITTING (PNS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Protocol Stage Execution */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Protocol Stage Execution</h3>
        <div className="grid grid-cols-6 gap-4">
          {stages.map((s, index) => {
            const isActive = stage === index;
            const isDone = stage >= index;
            const isRejected = isDone && s.id === 'decision' && telemetry?.status !== 'SECURE';

            return (
              <div
                key={s.id}
                className={`p-4 rounded-xl border flex flex-col transition-all duration-300 ${
                  isActive
                    ? 'bg-red-50 dark:bg-green-950/30 border-red-500 dark:border-[#4ade80]'
                    : isRejected
                    ? 'bg-red-950/20 border-red-900'
                    : isDone
                    ? 'bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-zinc-700'
                    : 'bg-white dark:bg-[#0c0c0c] border-gray-100 dark:border-zinc-800/50 opacity-50'
                }`}
              >
                <div className="text-xl mb-2">{s.icon}</div>
                <h4 className="font-semibold text-xs mb-1">{s.label}</h4>
                <p className="text-[10px] text-gray-500">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemetry Metrics */}
      {telemetry && (
        <div className="grid grid-cols-3 gap-6">
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <span className="text-xs text-gray-400">Sifted Key Bits</span>
            <p className="text-3xl font-bold font-mono text-gray-900 dark:text-white mt-2">
              {telemetry.bits_sifted} bits
            </p>
          </div>

          <div
            className={`border shadow-sm rounded-xl p-6 ${
              telemetry.measured_qber > 0.11
                ? 'border-red-900 bg-red-950/20 text-red-400'
                : 'border-green-800 bg-green-950/20 text-green-400'
            }`}
          >
            <span className="text-xs">Measured QBER (NIST Max 11.0%)</span>
            <p className="text-3xl font-bold font-mono mt-2">{(telemetry.measured_qber * 100).toFixed(1)}%</p>
          </div>

          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <span className="text-xs text-gray-400">Secure Key Rate</span>
            <p className="text-3xl font-bold font-mono text-red-600 dark:text-[#86efac] mt-2">
              {telemetry.key_rate_kbps} kbps
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
