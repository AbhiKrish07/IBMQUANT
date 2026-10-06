import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw, Network, Zap, CheckCircle2, XCircle, Shield, Cpu } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function TransactionReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [networkGraph, setNetworkGraph] = useState<any>(null);

  // Filters
  const [stageFilter, setStageFilter] = useState('all');
  const [typologyFilter, setTypologyFilter] = useState('all');

  // Custom Score Test Form State
  const [testAmount, setTestAmount] = useState(15000);
  const [testVelocity, setTestVelocity] = useState(2);
  const [testSpeed, setTestSpeed] = useState(110);
  const [testDeviceAge, setTestDeviceAge] = useState(8);
  const [testNewPayee, setTestNewPayee] = useState(1);
  const [scoringResult, setScoringResult] = useState<any>(null);
  const [isScoring, setIsScoring] = useState(false);

  const fetchStreamData = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/stream?stage_filter=${stageFilter}&typology=${typologyFilter}&limit=25`
      );
      const data = await res.json();
      setTransactions(data.transactions || []);
      setNetworkGraph(data.network_graph || null);
      if (data.transactions && data.transactions.length > 0) {
        setSelectedTx((prev: any) => prev || data.transactions[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [stageFilter, typologyFilter]);

  useEffect(() => {
    fetchStreamData();
  }, [fetchStreamData]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        fetchStreamData();
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, fetchStreamData]);

  const handleScorePayload = async (payload: any) => {
    setIsScoring(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setScoringResult(data);
    } catch (e) {
      console.error(e);
    }
    setIsScoring(false);
  };

  const loadScenario = (type: 'low_risk' | 'gray_zone' | 'high_risk') => {
    if (type === 'low_risk') {
      const payload = { amount_inr: 250, velocity_1h: 0, velocity_24h: 1, geo_speed_kmh: 4, device_age_days: 365, is_new_payee: 0, payee_in_degree_24h: 1 };
      setTestAmount(250); setTestVelocity(0); setTestSpeed(4); setTestDeviceAge(365); setTestNewPayee(0);
      handleScorePayload(payload);
    } else if (type === 'gray_zone') {
      const payload = { amount_inr: 15000, velocity_1h: 2, velocity_24h: 5, geo_speed_kmh: 110, device_age_days: 8, is_new_payee: 1, payee_in_degree_24h: 8 };
      setTestAmount(15000); setTestVelocity(2); setTestSpeed(110); setTestDeviceAge(8); setTestNewPayee(1);
      handleScorePayload(payload);
    } else {
      const payload = { amount_inr: 95000, velocity_1h: 18, velocity_24h: 35, geo_speed_kmh: 850, device_age_days: 0, is_new_payee: 1, payee_in_degree_24h: 30 };
      setTestAmount(95000); setTestVelocity(18); setTestSpeed(850); setTestDeviceAge(0); setTestNewPayee(1);
      handleScorePayload(payload);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-2 uppercase flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Q-UPI / Live Stream & Interactive Tier Evaluator
          </div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-1">
            Transaction Replay Stream & Demo Scenarios
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Replay synthetic UPI transactions through the 3-stage tiered pipeline and test judge scenarios (FR-8 & FR-11).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 py-2.5 rounded-lg text-white font-medium text-sm flex items-center gap-2 transition shadow-lg ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 font-bold'
                : 'bg-red-600 dark:bg-[#86efac] dark:text-gray-900 hover:bg-red-500 font-bold'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause Stream' : 'Start Live Replay'}
          </button>
        </div>
      </div>

      {/* Demo Scenarios for Judges */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Deterministic Demo Scenarios for Judges
          </h3>
          <span className="text-[10px] font-mono text-gray-500 uppercase">One-click Tier Pipeline Validation</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => loadScenario('low_risk')}
            className="p-4 rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-left transition space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-green-700 dark:text-green-400 font-mono">SCENARIO 1: LOW RISK</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Coffee Purchase (₹250)</p>
            <p className="text-[11px] text-gray-500 font-mono">Stage 1 Auto-Cleared (&lt;0.5ms)</p>
          </button>

          <button
            onClick={() => loadScenario('gray_zone')}
            className="p-4 rounded-xl border border-red-300 dark:border-green-700 bg-red-50/50 dark:bg-green-950/40 hover:bg-red-100 dark:hover:bg-green-900/40 text-left transition space-y-1 ring-2 ring-red-500/20 dark:ring-[#86efac]/20"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-red-600 dark:text-[#86efac] font-mono">SCENARIO 2: GRAY ZONE</span>
              <Cpu className="w-4 h-4 text-red-600 dark:text-[#86efac] animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Ambiguous Transfer (₹15,000)</p>
            <p className="text-[11px] text-red-600 dark:text-[#86efac] font-mono font-bold">Stage 2 Qiskit QSVM Evaluated</p>
          </button>

          <button
            onClick={() => loadScenario('high_risk')}
            className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-left transition space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-rose-700 dark:text-rose-400 font-mono">SCENARIO 3: HIGH RISK</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Mule Burst (₹95,000)</p>
            <p className="text-[11px] text-gray-500 font-mono">Stage 1 Auto-Blocked (Velocity 18/h)</p>
          </button>
        </div>
      </div>

      {/* Filter & Custom Score Form Controls */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-zinc-400 font-mono">STAGE FILTER</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white font-mono"
            >
              <option value="all">All Stages (Full Traffic)</option>
              <option value="stage1">Stage 1 Only (Classical Fast-Path)</option>
              <option value="stage2">Stage 2 Only (Quantum Gray Zone)</option>
              <option value="flagged">Flagged Fraud Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-zinc-400 font-mono">TYPOLOGY FILTER</label>
            <select
              value={typologyFilter}
              onChange={(e) => setTypologyFilter(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white font-mono"
            >
              <option value="all">All Fraud Typologies</option>
              <option value="mule ring">Mule Ring (Fan-In/Out)</option>
              <option value="velocity burst">Velocity Burst</option>
              <option value="sim swap">SIM Swap Takeover</option>
              <option value="impossible travel">Impossible Travel</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-zinc-400 font-mono">TEST AMOUNT (INR)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white font-mono"
            />
          </div>

          <div className="space-y-1 flex items-end">
            <button
              onClick={() => handleScorePayload({ amount_inr: testAmount, velocity_1h: testVelocity, geo_speed_kmh: testSpeed, device_age_days: testDeviceAge, is_new_payee: testNewPayee })}
              disabled={isScoring}
              className="w-full p-2.5 rounded-lg border border-red-600 dark:border-[#86efac] bg-red-600 dark:bg-[#86efac] text-white dark:text-gray-900 font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              {isScoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isScoring ? 'Scoring...' : 'Score Custom Txn'}
            </button>
          </div>
        </div>
      </div>

      {/* Scoring Result & Proof Badge Banner (If computed) */}
      {scoringResult && (
        <div className="border border-red-300 dark:border-green-800 bg-red-50/80 dark:bg-green-950/30 shadow-md rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start border-b border-red-200 dark:border-green-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-600 dark:text-[#86efac] uppercase">LIVE TIERED SCORING RESULT</span>
                <span className="px-2 py-0.5 bg-red-600 dark:bg-[#86efac] text-white dark:text-gray-900 text-[10px] font-bold rounded">
                  {scoringResult.stage_used || 'Stage Evaluation'}
                </span>
              </div>
              <h2 className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1">
                Decision: {scoringResult.decision}
              </h2>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-gray-500 block">TOTAL LATENCY</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{scoringResult.processing_time_ms} ms</span>
            </div>
          </div>

          {/* Probabilities Comparison */}
          <div className="grid grid-cols-5 gap-3 font-mono text-xs">
            {Object.entries(scoringResult.all_model_probabilities || {}).map(([model, prob]: any) => (
              <div key={model} className={`p-3 rounded-lg border ${model.includes('Qiskit') ? 'bg-red-100 dark:bg-green-950 border-red-300 dark:border-green-700 font-bold' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800'}`}>
                <span className="text-[10px] text-gray-500 block">{model}</span>
                <span className={`text-base font-bold ${model.includes('Qiskit') ? 'text-red-600 dark:text-[#86efac]' : 'text-gray-800 dark:text-gray-200'}`}>
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          {/* Qiskit Execution Proof Card */}
          {scoringResult.qiskit_execution && (
            <div className="p-4 bg-gray-950 border border-zinc-800 rounded-lg font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-red-500 dark:text-[#86efac] border-b border-zinc-800 pb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> QISKIT EXECUTION PROOF & TELEMETRY
                </span>
                <span className="text-[10px] text-gray-400">Qiskit v{scoringResult.qiskit_execution.qiskit_version}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[11px]">
                <div><span className="text-gray-500 block">BACKEND</span><span className="text-gray-200 font-bold">{scoringResult.qiskit_execution.backend}</span></div>
                <div><span className="text-gray-500 block">FEATURE MAP</span><span className="text-gray-200">{scoringResult.qiskit_execution.feature_map} (n={scoringResult.qiskit_execution.qubits})</span></div>
                <div><span className="text-gray-500 block">CIRCUIT DEPTH</span><span className="text-gray-200">{scoringResult.qiskit_execution.circuit_depth}</span></div>
                <div><span className="text-gray-500 block">STATEVECTOR NORM</span><span className="text-green-400 font-bold">{scoringResult.qiskit_execution.statevector_norm}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Transaction Stream Table (Col Span 8) */}
        <div className="col-span-8 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Replayed Event Stream</h3>
            <span className="text-[10px] font-mono text-gray-500">Live 25-Row Buffer</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-[10px] text-gray-500 uppercase border-b border-gray-200 dark:border-[#27272a]">
                <tr>
                  <th className="text-left pb-2">Txn ID</th>
                  <th className="text-left pb-2">Payer → Payee</th>
                  <th className="text-left pb-2">Amount</th>
                  <th className="text-left pb-2">Stage 1</th>
                  <th className="text-left pb-2">Stage 2 (Quantum)</th>
                  <th className="text-left pb-2">Decision</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 dark:text-zinc-300">
                {transactions.map((tx) => (
                  <tr
                    key={tx.txn_id}
                    onClick={() => setSelectedTx(tx)}
                    className={`border-b border-gray-100 dark:border-zinc-800/50 cursor-pointer hover:bg-red-50/30 dark:hover:bg-zinc-800/50 transition ${
                      selectedTx?.txn_id === tx.txn_id ? 'bg-red-50 dark:bg-green-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 font-sans">{tx.txn_id}</td>
                    <td className="py-2.5 text-gray-500">{tx.payer_id.split('@')[0]} → {tx.payee_id.split('@')[0]}</td>
                    <td className="py-2.5">₹{tx.amount_inr}</td>
                    <td className="py-2.5">{tx.s1_score}</td>
                    <td className="py-2.5 text-red-600 dark:text-[#86efac]">
                      {tx.s2_score ? `${tx.s2_score}` : '— (Bypassed)'}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.decision.includes('FLAGGED') || tx.decision.includes('BLOCKED')
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        }`}
                      >
                        {tx.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Inspector & Linked Accounts Graph (Col Span 4) */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Event Inspector</h3>
            {selectedTx ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="text-gray-200">{selectedTx.txn_id}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Typology:</span>
                  <span className="text-amber-400">{selectedTx.fraud_type}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Velocity (1h):</span>
                  <span>{selectedTx.velocity_1h} txns</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Implied Speed:</span>
                  <span>{selectedTx.geo_speed_kmh} km/h</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Stage Used:</span>
                  <span className="text-red-600 dark:text-[#86efac]">{selectedTx.stage_used}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Select a transaction from the table to inspect details.</p>
            )}
          </div>

          {/* Linked Account Ring Graph Visualizer */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Network className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Payee Network Ring Graph
            </h3>
            <p className="text-[10px] text-gray-500 mb-4">Visualizes payer-payee cluster connections for mule detection.</p>
            <div className="h-44 bg-gray-950 border border-zinc-800 rounded-lg p-4 relative flex items-center justify-center">
              {networkGraph?.nodes ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-red-500 bg-red-950/50 flex items-center justify-center text-[10px] font-mono text-red-300 font-bold">
                    Collector
                  </div>
                  {networkGraph.nodes.slice(0, 6).map((node: any, i: number) => {
                    const angle = (i * 360) / 6;
                    const rad = (angle * Math.PI) / 180;
                    const x = Math.cos(rad) * 60;
                    const y = Math.sin(rad) * 60;
                    return (
                      <div
                        key={node.id}
                        className="absolute w-8 h-8 rounded-full bg-blue-900/80 border border-blue-400 flex items-center justify-center text-[8px] font-mono text-blue-200"
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                      >
                        P{i}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-mono">No network graph loaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
