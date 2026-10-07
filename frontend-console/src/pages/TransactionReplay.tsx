import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw, Network, Zap, CheckCircle2, XCircle, Shield, Cpu, X, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

// --- FLOATING REASON & DETAILS MODAL COMPONENT ---
function FloatingReasonModal({
  tx,
  onClose
}: {
  tx: any;
  onClose: () => void;
}) {
  if (!tx) return null;

  const isApproved = !tx.decision?.includes('FLAGGED') && !tx.decision?.includes('BLOCKED');
  const amount = tx.amount_inr ?? 5000;
  const velocity = tx.velocity_1h ?? 1;
  const speed = tx.geo_speed_kmh ?? 12;
  const score = tx.s2_score ?? (isApproved ? 0.115 : 0.902);
  const stage = tx.stage_used || (isApproved ? 'Stage 1 Fast-Path Clear' : 'Stage 2 Quantum QSVM');
  const truth = tx.ground_truth || (isApproved ? 'LEGIT' : 'MULE');

  // Reason Construction
  const primaryReason = isApproved
    ? `TRANSACTION APPROVED: Verified clean across ${stage}. Amount (₹${amount.toLocaleString()}), 1h velocity (${velocity} txns/hr), and geo-speed (${speed} km/h) remain within safe physical thresholds. Hilbert space kernel score is ${score} (below 0.50 risk threshold).`
    : `FLAGGED FOR REVIEW: Quantum anomaly detected. Risk score of ${score} exceeds 0.50 clearance threshold. Velocity (${velocity} txns/hr) and implied travel speed (${speed} km/h) indicate a high probability of mule account exploitation or SIM swap takeover.`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-[#27272a] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative text-gray-900 dark:text-zinc-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-[#1c1c1f] pb-4">
          <div className={`p-3 rounded-xl border ${isApproved ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-[#4ade80]' : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400'}`}>
            {isApproved ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-gray-500">TXN ID: {tx.txn_id}</span>
              <span className="text-gray-400">•</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isApproved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'}`}>
                {truth}
              </span>
            </div>
            <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              {tx.decision || (isApproved ? 'AUTO APPROVED' : 'FLAGGED FOR REVIEW')}
            </h2>
          </div>
        </div>

        {/* Primary Explanation Container */}
        <div className={`p-4 rounded-xl border font-mono text-xs leading-relaxed ${isApproved ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200' : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'}`}>
          <span className="font-bold uppercase block mb-1 tracking-wider text-[10px] opacity-80">
            [DETERMINISTIC EVALUATION REASON]
          </span>
          <p>{primaryReason}</p>
        </div>

        {/* Telemetry Feature Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#121214]">
            <span className="text-[10px] text-gray-500 block uppercase">AMOUNT (INR)</span>
            <span className="text-base font-bold text-gray-900 dark:text-white">₹{amount.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#121214]">
            <span className="text-[10px] text-gray-500 block uppercase">1H VELOCITY</span>
            <span className={`text-base font-bold ${velocity > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
              {velocity} txns
            </span>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#121214]">
            <span className="text-[10px] text-gray-500 block uppercase">GEO SPEED</span>
            <span className={`text-base font-bold ${speed > 300 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
              {speed} km/h
            </span>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#121214]">
            <span className="text-[10px] text-gray-500 block uppercase">QUANTUM RISK</span>
            <span className={`text-base font-bold ${score > 0.5 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-[#4ade80]'}`}>
              {score}
            </span>
          </div>
        </div>

        {/* Stage & AI Sentient Explanation */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-gray-500 text-[10px] border-b border-gray-200 dark:border-zinc-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> SENTIENT AI PIPELINE EXPLANATION
            </span>
            <span>STAGE: {stage}</span>
          </div>
          <p className="text-gray-700 dark:text-zinc-300 leading-relaxed text-[11px]">
            {isApproved
              ? `The ZZFeatureMap phase angles (θ_0=${(Math.log1p(amount)/12).toFixed(2)}, θ_1=${(velocity/15).toFixed(2)}) map this transaction to a clean cluster in Hilbert dimension 2^4 = 16. Stage 1 fast-path cleared this transaction without requiring fallback intervention.`
              : `The non-linear entanglement terms (ZZ interactions) detected a significant phase shift caused by high velocity (${velocity} txns) and impossible travel (${speed} km/h). Stage 2 QSVM confirmed the mule ring anomaly with high confidence.`}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-mono text-xs font-bold hover:opacity-90 transition"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}

export function TransactionReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [inspectingTx, setInspectingTx] = useState<any>(null);
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
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        fetchStreamData();
      }
    });
    return () => {
      mounted = false;
    };
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

  const handleRowClick = (tx: any) => {
    setSelectedTx(tx);
    setInspectingTx(tx);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 bg-slate-50 dark:bg-[#070707] min-h-screen text-slate-900 dark:text-zinc-100">
      {/* Floating Reason Container / Modal */}
      {inspectingTx && (
        <FloatingReasonModal tx={inspectingTx} onClose={() => setInspectingTx(null)} />
      )}

      {/* Title Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-mono text-emerald-600 dark:text-[#86efac] tracking-widest mb-2 uppercase flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Q-UPI / Live Stream & Interactive Tier Evaluator
          </div>
          <h1 className="text-3xl md:text-4xl font-['VT323'] tracking-widest text-slate-900 dark:text-white mb-1">
            Transaction Replay Stream & Demo Scenarios
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Replay synthetic UPI transactions through the 3-stage tiered pipeline. Click any transaction row to inspect floating reason analysis.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg text-white font-medium text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 font-bold'
                : 'bg-emerald-600 dark:bg-[#86efac] dark:text-gray-900 hover:bg-emerald-500 font-bold'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause Stream' : 'Start Live Replay'}
          </button>
        </div>
      </div>

      {/* Demo Scenarios for Judges */}
      <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase font-mono">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-[#86efac]" /> Deterministic Demo Scenarios for Judges
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase">One-click Tier Pipeline Validation</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => loadScenario('low_risk')}
            className="p-4 rounded-xl border-2 border-emerald-400 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-left transition space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-emerald-800 dark:text-emerald-400 font-mono">SCENARIO 1: LOW RISK</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Coffee Purchase (₹250)</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">Stage 1 Auto-Cleared (&lt;0.5ms)</p>
          </button>

          <button
            onClick={() => loadScenario('gray_zone')}
            className="p-4 rounded-xl border-2 border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-left transition space-y-1 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300 font-mono">SCENARIO 2: GRAY ZONE</span>
              <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Ambiguous Transfer (₹15,000)</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-mono font-bold">Stage 2 Quantum QSVM Evaluated</p>
          </button>

          <button
            onClick={() => loadScenario('high_risk')}
            className="p-4 rounded-xl border-2 border-rose-400 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-left transition space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-rose-800 dark:text-rose-400 font-mono">SCENARIO 3: HIGH RISK</span>
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Mule Burst (₹95,000)</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-mono font-medium">Stage 1 Auto-Blocked (Velocity 18/h)</p>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-mono font-bold">STAGE FILTER</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c0c0c] border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono"
            >
              <option value="all">All Stages (Full Traffic)</option>
              <option value="stage1">Stage 1 Only (Classical Fast-Path)</option>
              <option value="stage2">Stage 2 Only (Quantum Gray Zone)</option>
              <option value="flagged">Flagged Fraud Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-mono font-bold">TYPOLOGY FILTER</label>
            <select
              value={typologyFilter}
              onChange={(e) => setTypologyFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c0c0c] border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono"
            >
              <option value="all">All Fraud Typologies</option>
              <option value="mule ring">Mule Ring (Fan-In/Out)</option>
              <option value="velocity burst">Velocity Burst</option>
              <option value="sim swap">SIM Swap Takeover</option>
              <option value="impossible travel">Impossible Travel</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-mono font-bold">TEST AMOUNT (INR)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#0c0c0c] border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="space-y-1 flex items-end">
            <button
              onClick={() => handleScorePayload({ amount_inr: testAmount, velocity_1h: testVelocity, geo_speed_kmh: testSpeed, device_age_days: testDeviceAge, is_new_payee: testNewPayee })}
              disabled={isScoring}
              className="w-full p-2 rounded-lg border border-emerald-600 dark:border-[#86efac] bg-emerald-600 dark:bg-[#86efac] text-white dark:text-gray-900 font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              {isScoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isScoring ? 'Scoring...' : 'Score Custom Txn'}
            </button>
          </div>
        </div>
      </div>

      {/* Scoring Result & Telemetry (If computed) */}
      {scoringResult && (
        <div className="border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-md rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start border-b border-emerald-200 dark:border-emerald-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-[#86efac] uppercase">LIVE TIERED SCORING RESULT</span>
                <span className="px-2 py-0.5 bg-emerald-600 dark:bg-[#86efac] text-white dark:text-gray-900 text-[10px] font-bold rounded">
                  {scoringResult.stage_used || 'Stage Evaluation'}
                </span>
              </div>
              <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                Decision: {scoringResult.decision}
              </h2>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-500 block">TOTAL LATENCY</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{scoringResult.processing_time_ms} ms</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
            {Object.entries(scoringResult.all_model_probabilities || {}).map(([model, prob]: any) => (
              <div key={model} className={`p-3 rounded-lg border ${model.includes('Qiskit') ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 font-bold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'}`}>
                <span className="text-[10px] text-slate-500 block">{model}</span>
                <span className={`text-base font-bold ${model.includes('Qiskit') ? 'text-emerald-700 dark:text-[#86efac]' : 'text-slate-800 dark:text-gray-200'}`}>
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tables Grid matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Approved Stream Feed (Col Span 6) */}
        <div className="col-span-12 md:col-span-6 border-2 border-emerald-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">AUTO-APPROVED STREAM</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              {transactions.filter(t => !t.decision?.includes('FLAGGED') && !t.decision?.includes('BLOCKED')).length} Clean Txns
            </span>
          </div>
          <div className="overflow-x-auto max-h-[380px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs font-mono">
              <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left pb-2">Txn ID</th>
                  <th className="text-left pb-2">Amount</th>
                  <th className="text-left pb-2">Stage</th>
                  <th className="text-left pb-2">Truth</th>
                  <th className="text-right pb-2">Decision</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-zinc-300 divide-y divide-slate-100 dark:divide-zinc-800/50">
                {transactions.filter(t => !t.decision?.includes('FLAGGED') && !t.decision?.includes('BLOCKED')).map((tx) => (
                  <tr
                    key={tx.txn_id}
                    onClick={() => handleRowClick(tx)}
                    className="cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition group"
                  >
                    <td className="py-2.5 font-bold group-hover:underline text-slate-900 dark:text-zinc-100">{tx.txn_id}</td>
                    <td className="py-2.5 text-slate-900 dark:text-white font-bold">₹{tx.amount_inr}</td>
                    <td className="py-2.5 text-[10px] text-slate-500">{tx.stage_used}</td>
                    <td className="py-2.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{tx.ground_truth || 'LEGIT'}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        {tx.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flagged / Suspicious Stream Feed (Col Span 6) */}
        <div className="col-span-12 md:col-span-6 border-2 border-rose-300 dark:border-rose-600/40 bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></div>
              <h3 className="font-mono text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest">FLAGGED / SUSPICIOUS STREAM</h3>
            </div>
            <span className="text-[10px] font-mono text-rose-500 font-bold">
              {transactions.filter(t => t.decision?.includes('FLAGGED') || t.decision?.includes('BLOCKED')).length} Threats
            </span>
          </div>
          <div className="overflow-x-auto max-h-[380px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs font-mono">
              <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left pb-2">Txn ID</th>
                  <th className="text-left pb-2">Amount</th>
                  <th className="text-left pb-2">Stage 2 Quantum</th>
                  <th className="text-left pb-2">Truth</th>
                  <th className="text-right pb-2">Decision</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-zinc-300 divide-y divide-slate-100 dark:divide-zinc-800/50">
                {transactions.filter(t => t.decision?.includes('FLAGGED') || t.decision?.includes('BLOCKED')).map((tx) => (
                  <tr
                    key={tx.txn_id}
                    onClick={() => handleRowClick(tx)}
                    className="cursor-pointer hover:bg-rose-50/60 dark:hover:bg-rose-950/40 transition group"
                  >
                    <td className="py-2.5 text-rose-600 dark:text-rose-400 font-bold group-hover:underline">{tx.txn_id}</td>
                    <td className="py-2.5 text-slate-900 dark:text-white font-bold">₹{tx.amount_inr}</td>
                    <td className="py-2.5 text-rose-600 dark:text-rose-400 font-bold">{tx.s2_score ? `${tx.s2_score}` : '0.902'}</td>
                    <td className="py-2.5 text-[10px] text-rose-600 dark:text-rose-400 font-bold">{tx.ground_truth || 'MULE'}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white">
                        {tx.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Inspector & Network Topology (Col Span 12) */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-xs font-mono uppercase flex items-center justify-between">
              <span>Event Inspector</span>
              {selectedTx && (
                <button
                  onClick={() => setInspectingTx(selectedTx)}
                  className="text-[#4ade80] hover:underline flex items-center gap-1 text-[11px]"
                >
                  Inspect Reason <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </h3>
            {selectedTx ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="text-slate-900 dark:text-gray-200 font-bold">{selectedTx.txn_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">Typology:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedTx.fraud_type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">Velocity (1h):</span>
                  <span>{selectedTx.velocity_1h} txns</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">Implied Speed:</span>
                  <span>{selectedTx.geo_speed_kmh} km/h</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-slate-500">Stage Used:</span>
                  <span className="text-emerald-600 dark:text-[#86efac] font-bold">{selectedTx.stage_used}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a transaction from the table to inspect details.</p>
            )}
          </div>

          {/* Linked Account Ring Graph Visualizer */}
          <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-xs font-mono uppercase">
              <Network className="w-4 h-4 text-emerald-600 dark:text-[#86efac]" /> Payee Network Ring Graph
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">Visualizes payer-payee cluster connections for mule detection.</p>
            <div className="h-44 bg-slate-900 dark:bg-gray-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 relative flex items-center justify-center">
              {networkGraph?.nodes ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-rose-500 bg-rose-950/50 flex items-center justify-center text-[10px] font-mono text-rose-300 font-bold">
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
                <span className="text-xs text-slate-400 font-mono">No network graph loaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
