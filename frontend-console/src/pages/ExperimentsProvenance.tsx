import { useState, useEffect } from 'react';
import { Download, RefreshCw, Zap } from 'lucide-react';
import { fetchApi } from '../config';

export function ExperimentsProvenance() {
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "experiments_provenance_manifest.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = experiments.filter(e => {
    if (expType !== 'all' && e.category !== expType) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase()) && !e.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 font-mono text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-[#070707] min-h-screen">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-mono text-emerald-600 dark:text-[#86efac] tracking-widest mb-2 uppercase flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Q-UPI / Cryptographic Audit Ledger
          </div>
          <h1 className="text-3xl md:text-4xl font-['VT323'] tracking-widest text-slate-900 dark:text-white mb-1">
            Experiments &amp; Provenance Manifest
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans">
            Persistent ledger of all model retraining events, benchmark runs, head-to-head tests, and QKD sessions.
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
            <Download className="w-4 h-4" /> Export Manifest JSON
          </button>
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
