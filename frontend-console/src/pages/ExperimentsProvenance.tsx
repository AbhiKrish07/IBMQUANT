import { useState, useEffect } from 'react';
import { Download, RefreshCw, Zap, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { fetchApi } from '../config';
import { type CanonicalTransaction, CANONICAL_TRANSACTIONS } from '../config/transactions';

interface ExperimentsProvenanceProps {
  activeTx?: CanonicalTransaction;
  onSelectTx?: (tx: CanonicalTransaction) => void;
  onNavigate?: (page: string) => void;
}

export function ExperimentsProvenance({ activeTx = CANONICAL_TRANSACTIONS[0], onSelectTx, onNavigate }: ExperimentsProvenanceProps) {
  const [expType, setExpType] = useState('all');
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExperiments = () => {
    setLoading(true);
    fetchApi<{ experiments: any[] }>('/api/experiments')
      .then(res => {
        if (res.experiments) setExperiments(res.experiments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExperiments();
    const timer = setInterval(fetchExperiments, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      active_transaction: activeTx,
      lineage_trace: [
        { step: 1, name: "Dataset Stream", detail: `Txn ID: ${activeTx.id}` },
        { step: 2, name: "Feature Extraction", detail: `Amount: ₹${activeTx.amount_inr}, Vel: ${activeTx.velocity_1h}/h` },
        { step: 3, name: "Stage 1 Classical GBDT", detail: `Fast Filter Score s_1 = ${activeTx.s1_score}` },
        { step: 4, name: "Gray-Zone Router", detail: activeTx.s1_score >= 0.35 && activeTx.s1_score <= 0.70 ? "Routed to Stage 2 Quantum" : "Stage 1 Direct Path" },
        { step: 5, name: "Stage 2 Qiskit Hilbert Kernel", detail: `Hilbert Dim 16, Score s_2 = ${activeTx.s2_score}` },
        { step: 6, name: "Classification Decision", detail: activeTx.decision },
        { step: 7, name: "Adaptive Security Policy", detail: "Enforce Step-Up Authentication / Quarantine" },
        { step: 8, name: "QKD Settlement Channel", detail: `BB84 QBER: ${(activeTx.qkd_qber * 100).toFixed(1)}%` }
      ],
      provenance_ledger: experiments
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `provenance_manifest_${activeTx.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = experiments.filter(e => {
    if (expType !== 'all' && e.category !== expType) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase()) && !e.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const lineageSteps = [
    { num: '01', title: 'Dataset Ingestion', text: `Txn ID: ${activeTx.id}`, page: 'replay' },
    { num: '02', title: 'Feature Extraction', text: `₹${activeTx.amount_inr.toLocaleString()} • ${activeTx.velocity_1h}tx/h`, page: 'schema' },
    { num: '03', title: 'Classical GBDT', text: `s_1 Score = ${activeTx.s1_score}`, page: 'compare' },
    { num: '04', title: 'Gray-Zone Router', text: activeTx.s1_score >= 0.35 && activeTx.s1_score <= 0.70 ? 's_1 ∈ [0.35, 0.70] ➔ Quantum' : 'Fast-Path Exit', page: 'compare' },
    { num: '05', title: 'Qiskit ZZFeatureMap', text: `2⁴=16D Hilbert (θ_0=${activeTx.quantum_angles[0]})`, page: 'circuit' },
    { num: '06', title: 'Quantum Decision', text: activeTx.decision, page: 'compare' },
    { num: '07', title: 'Adaptive Policy', text: 'Step-Up Auth / Quarantine', page: 'replay' },
    { num: '08', title: 'QKD Settlement', text: `QBER: ${(activeTx.qkd_qber * 100).toFixed(1)}%`, page: 'qkd' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 font-mono text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-[#070707] min-h-screen">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-mono text-emerald-600 dark:text-[#86efac] tracking-widest mb-2 uppercase flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Q-UPI / Cryptographic Audit &amp; Lineage Ledger
          </div>
          <h1 className="text-3xl md:text-4xl font-['VT323'] tracking-widest text-slate-900 dark:text-white mb-1">
            Experiments &amp; Lineage Provenance
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans">
            Trace end-to-end execution lineage for active transaction <strong className="text-emerald-600 dark:text-[#86efac]">{activeTx.id}</strong> from dataset stream to QKD settlement.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchExperiments}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={handleExportJson}
            className="px-4 py-2 rounded-lg border border-emerald-600 dark:border-[#86efac] bg-emerald-600 dark:bg-[#86efac] text-white dark:text-black text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Lineage Manifest JSON
          </button>
        </div>
      </div>

      {/* END-TO-END TRANSACTION LINEAGE FLOW DIAGRAM */}
      <div className="border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-200 dark:border-emerald-900/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-[#86efac] uppercase tracking-wider">
              END-TO-END LINEAGE FLOW TRACE:
            </span>
            <select
              value={activeTx.id}
              onChange={(e) => {
                const target = CANONICAL_TRANSACTIONS.find(t => t.id === e.target.value);
                if (target && onSelectTx) onSelectTx(target);
              }}
              className="bg-white dark:bg-zinc-900 border border-emerald-400 dark:border-emerald-700 rounded-md px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-[#86efac]"
            >
              {CANONICAL_TRANSACTIONS.map((tx) => (
                <option key={tx.id} value={tx.id}>{tx.id} — {tx.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 uppercase ${
              activeTx.ground_truth === 'MULE_FRAUD' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
            }`}>
              {activeTx.ground_truth === 'MULE_FRAUD' ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {activeTx.ground_truth}
            </span>
          </div>
        </div>

        {/* 8-Step Pipeline Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
          {lineageSteps.map((step, idx) => (
            <div
              key={step.num}
              onClick={() => onNavigate && onNavigate(step.page)}
              className="p-3 bg-white dark:bg-[#0c0c0e] border border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500 rounded-xl space-y-1.5 cursor-pointer transition group relative"
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-emerald-600 dark:text-[#86efac] font-bold">{step.num}</span>
                {idx < 7 && <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />}
              </div>
              <h4 className="font-bold text-[11px] text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-[#86efac]">
                {step.title}
              </h4>
              <p className="text-[9px] text-slate-500 dark:text-zinc-400 leading-tight">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Registry Filters */}
      <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-mono font-bold">CATEGORY FILTER</label>
            <select
              value={expType}
              onChange={(e) => setExpType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c0c0c] border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono"
            >
              <option value="all">All Category Events</option>
              <option value="HEAD_TO_HEAD_COMPARISON">Head-to-Head Comparisons</option>
              <option value="BENCHMARK_RUN">Benchmark Runs</option>
              <option value="DATASET_SELECTION">Dataset Hot-Swaps</option>
              <option value="QUANTUM_CONFIG_UPDATE">Quantum Hyperparameter Updates</option>
              <option value="QKD_SIMULATION">QKD Simulations</option>
              <option value="SYSTEM_INIT">System Initialization</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-mono font-bold">SEARCH LEDGER</label>
            <input
              type="text"
              placeholder="Search by ID or event details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c0c0c] border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase border-b border-slate-200 dark:border-[#27272a]">
              <tr>
                <th className="text-left pb-3">Run ID</th>
                <th className="text-left pb-3">Timestamp</th>
                <th className="text-left pb-3">Category</th>
                <th className="text-left pb-3">Event Name / Details</th>
                <th className="text-left pb-3">Dataset / Feature Map</th>
                <th className="text-left pb-3">Classical vs Quantum AUC</th>
                <th className="text-right pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-slate-800 dark:text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No matching experiment events in provenance log. Perform actions in the console to populate ledger.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3 font-bold text-emerald-600 dark:text-[#86efac]">{e.id}</td>
                    <td className="py-3 text-slate-500 dark:text-zinc-400 text-[11px]">{e.timestamp}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 max-w-[280px]">
                      <div className="font-bold text-slate-900 dark:text-white">{e.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">{e.details}</div>
                    </td>
                    <td className="py-3 text-[11px] text-slate-500 dark:text-zinc-400">
                      <div>{e.dataset}</div>
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400">{e.feature_map}</div>
                    </td>
                    <td className="py-3 text-[11px]">
                      <span className="text-slate-500 dark:text-zinc-400">C: {e.classical_auc}</span> | <span className="text-emerald-600 dark:text-[#86efac] font-bold">Q: {e.quantum_auc}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

