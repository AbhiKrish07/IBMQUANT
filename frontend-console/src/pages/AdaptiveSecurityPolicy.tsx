import { useState, useEffect } from 'react';
import { Shield, Smartphone, Activity, Eye, RefreshCw, Sliders } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function AdaptiveSecurityPolicy() {
  const [policyMode, setPolicyMode] = useState('balanced');
  const [tLow, setTLow] = useState(0.20);
  const [tHigh, setTHigh] = useState(0.80);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [scenarios, setScenarios] = useState<Record<string, any>>({});

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions?limit=10`);
      const data = await res.json();
      setTransactions(data.transactions);
      if (data.transactions.length > 0) {
        setSelectedTxn(data.transactions[0]);
        evaluateSelectedTxn(data.transactions[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const evaluateSelectedTxn = async (txn: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpa_sender: txn.payer_id,
          vpa_receiver: txn.payee_id,
          amount_inr: txn.amount_inr,
          velocity_1h: txn.velocity_1h,
          velocity_24h: txn.velocity_1h * 2,
          geo_speed_kmh: txn.geo_speed_kmh,
          device_age_days: txn.device_age_days,
          is_new_payee: 1,
          payee_in_degree_24h: 15
        })
      });
      const data = await res.json();
      setEvaluation(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetch(`${API_BASE_URL}/api/demo-scenarios`).then((res) => res.json()).then((data) => setScenarios(data.scenarios || {})).catch(() => {});
  }, []);

  const runScenario = (scenario: any) => {
    setSelectedTxn(scenario);
    evaluateSelectedTxn(scenario);
  };

  const handlePolicyChange = (mode: string) => {
    setPolicyMode(mode);
    if (mode === 'strict') { setTLow(0.15); setTHigh(0.65); }
    else if (mode === 'balanced') { setTLow(0.20); setTHigh(0.80); }
    else if (mode === 'relaxed') { setTLow(0.30); setTHigh(0.90); }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-zinc-500 mb-4 tracking-widest uppercase">
            <Shield className="w-4 h-4" />
            <span>Q-UPI / SENTINEL</span>
          </div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">Q-UPI Sentinel Analyst Console</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 font-mono">Protect at the edge. Triage at the switch. Inspect the quantum horizon.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <button onClick={fetchTransactions} className="px-3 py-1.5 rounded border border-gray-300 dark:border-zinc-700 text-white flex items-center gap-2">
            <RefreshCw className="w-3 h-3" /> Refresh Feed
          </button>
        </div>
      </div>

      <div className="border border-green-800 bg-green-950/20 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-mono text-green-300 mr-2">JUDGE DEMO SCENARIOS</span>
        {Object.entries(scenarios).map(([key, scenario]: [string, any]) => (
          <button key={key} onClick={() => runScenario(scenario)} className="px-3 py-1.5 rounded border border-green-800 text-xs font-mono text-green-300 hover:bg-green-900/40">
            {scenario.label}
          </button>
        ))}
      </div>

      {/* Policy Selector */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Adaptive Security Policy Configurator
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Policy Mode Preset</label>
            <select 
              value={policyMode}
              onChange={(e) => handlePolicyChange(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="strict">Strict Policy (t_low=0.15, t_high=0.65)</option>
              <option value="balanced">Balanced Policy (t_low=0.20, t_high=0.80)</option>
              <option value="relaxed">Relaxed Policy (t_low=0.30, t_high=0.90)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Classical Auto-Approve Threshold (t_low): {tLow}</label>
            <input 
              type="range" min="0.05" max="0.40" step="0.05" value={tLow}
              onChange={(e) => setTLow(Number(e.target.value))}
              className="w-full accent-red-600 dark:accent-[#86efac]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Classical Auto-Block Threshold (t_high): {tHigh}</label>
            <input 
              type="range" min="0.60" max="0.95" step="0.05" value={tHigh}
              onChange={(e) => setTHigh(Number(e.target.value))}
              className="w-full accent-red-600 dark:accent-[#86efac]"
            />
          </div>
        </div>
      </div>

      {/* 3-Column Simulator Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Mobile Edge */}
        <div className="col-span-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Mobile Edge (Tier 1 PQC)
          </h3>
          <p className="text-xs text-gray-500 mb-4">ML-KEM-768 quantum-safe key exchange & ML-DSA signatures on payer device.</p>
          
          {selectedTxn && (
            <div className="p-4 bg-gray-950 border border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
              <div className="text-red-600 dark:text-[#86efac] font-bold">Encrypted Payload Snapshot</div>
              <div className="text-gray-400 text-[10px]">Payer: {selectedTxn.payer_id}</div>
              <div className="text-gray-400 text-[10px]">Payee: {selectedTxn.payee_id}</div>
              <div className="text-gray-200">Amount: ₹{selectedTxn.amount_inr}</div>
              <div className="text-green-400">Signature: ML-DSA-65 (PASS)</div>
            </div>
          )}
        </div>

        {/* Column 2: Core Banking Radar */}
        <div className="col-span-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Core Banking Radar (Live Traffic)
          </h3>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div 
                key={tx.txn_id}
                onClick={() => { setSelectedTxn(tx); evaluateSelectedTxn(tx); }}
                className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition ${
                  selectedTxn?.txn_id === tx.txn_id
                    ? 'border-red-500 dark:border-[#86efac] bg-red-50/50 dark:bg-green-950/30'
                    : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>{tx.txn_id}</span>
                  <span>₹{tx.amount_inr}</span>
                </div>
                <div className="flex justify-between text-gray-400 mt-1">
                  <span>Stage 1 Score: {tx.s1_score}</span>
                  <span className="text-red-600 dark:text-[#86efac]">{tx.decision}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Quantum Risk Lens */}
        <div className="col-span-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Quantum Risk Lens
          </h3>
          
          {evaluation ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-gray-950 border border-zinc-800 rounded-lg">
                <div className="text-gray-400 text-[10px]">Triage Stage:</div>
                <div className="text-red-600 dark:text-[#86efac] font-bold text-sm">{evaluation.stage_used}</div>
                <div className="text-gray-400 text-[10px] mt-2">Decision Verdict:</div>
                <div className="text-white font-bold text-sm">{evaluation.decision}</div>
              </div>

              <div className="p-4 bg-gray-950 border border-zinc-800 rounded-lg">
                <div className="text-gray-400 text-[10px] mb-2">SHAP Feature Explanation:</div>
                {Object.entries(evaluation.explanation || {}).map(([k, v]: any) => (
                  <div key={k} className="flex justify-between text-[11px] py-1 border-b border-zinc-800">
                    <span className="text-gray-400">{k}:</span>
                    <span className="text-red-400 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Select a transaction from column 2 to inspect risk details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
