import { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { API_BASE_URL } from '../config';

import { type CanonicalTransaction, CANONICAL_TRANSACTIONS } from '../config/transactions';

interface DataSchemaProps {
  activeTx?: CanonicalTransaction;
  onSelectTx?: (tx: CanonicalTransaction) => void;
  onNavigate?: (page: string) => void;
}

export function DataSchema({ activeTx: _activeTx = CANONICAL_TRANSACTIONS[0] }: DataSchemaProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [datasetSummary, setDatasetSummary] = useState<any>(null);

  // Generator Options
  const [nTxns, setNTxns] = useState(2000);
  const [fraudRate, setFraudRate] = useState(0.04);
  const [seed, setSeed] = useState(42);
  const [drift, setDrift] = useState(true);
  const [datasetMode, setDatasetMode] = useState<'synthetic' | 'csv_benchmark'>('synthetic');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n_users: 1000,
          n_merchants: 200,
          n_txns: nTxns,
          fraud_rate: fraudRate,
          seed: seed,
          drift: drift,
          mode: datasetMode,
        }),
      });
      const data = await res.json();
      setDatasetSummary(data);
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];
  const selectCls = "w-full bg-slate-50 dark:bg-[#0c0c0c] border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono";

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 font-mono text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-[#070707] min-h-screen">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-mono text-emerald-600 dark:text-[#86efac] tracking-widest mb-2 uppercase flex items-center gap-1.5 font-bold">
            <Database className="w-3.5 h-3.5" /> Q-UPI / Security Gateway
          </div>
          <h1 className="text-3xl md:text-4xl font-['VT323'] tracking-widest text-slate-900 dark:text-white mb-1">
            Data Schema &amp; Generator
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans">
            Generate synthetic UPI-style payment datasets with 5 realistic fraud typologies.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg border border-[#d4ff55] bg-[#d4ff55] hover:bg-[#e4ff9e] text-[#080908] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-sm cursor-pointer ${
              isGenerating ? 'opacity-75 cursor-wait' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate dataset'}
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-xs font-mono uppercase">
          <Database className="w-4 h-4 text-emerald-600 dark:text-[#86efac]" /> Generator Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Dataset Source</label>
            <select value={datasetMode} onChange={(e) => setDatasetMode(e.target.value as 'synthetic' | 'csv_benchmark')} className={selectCls}>
              <option value="synthetic">Seeded Synthetic UPI</option>
              <option value="csv_benchmark">Adapted CSV Benchmark</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Transaction Volume</label>
            <select
              value={nTxns}
              onChange={(e) => setNTxns(Number(e.target.value))}
              className={selectCls}
            >
              <option value={1500}>1,500 Transactions</option>
              <option value={5000}>5,000 Transactions</option>
              <option value={20000}>20,000 Transactions</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Fraud Rate</label>
            <select
              value={fraudRate}
              onChange={(e) => setFraudRate(Number(e.target.value))}
              className={selectCls}
            >
              <option value={0.01}>1.0% (Realistic Imbalance)</option>
              <option value={0.04}>4.0% (SRS Standard)</option>
              <option value={0.10}>10.0% (High Stress Benchmark)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Random Seed</label>
            <select
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className={selectCls}
            >
              <option value={42}>Seed 42</option>
              <option value={43}>Seed 43</option>
              <option value={44}>Seed 44</option>
              <option value={45}>Seed 45</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Concept Drift</label>
            <button
              onClick={() => setDrift(!drift)}
              className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold transition ${
                drift
                  ? 'border-emerald-500 dark:border-[#86efac] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-[#86efac]'
                  : 'border-slate-300 dark:border-zinc-700 text-slate-500'
              }`}
            >
              {drift ? 'Day 20 Drift Active' : 'No Concept Drift'}
            </button>
          </div>
        </div>
      </div>

      {datasetSummary?.provenance && <p className="text-xs font-mono text-amber-600 dark:text-amber-300">Data provenance: {datasetSummary.provenance}</p>}

      {/* Visual Charts */}
      {datasetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Distribution */}
          <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-xs uppercase">Amount Distribution (Legit vs Fraud Tail)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datasetSummary.amount_distribution}>
                <XAxis dataKey="bin" stroke="#71717a" tick={{ fontSize: 9 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000' }} />
                <Legend />
                <Bar dataKey="legit" fill="#3b82f6" name="Legitimate Txns" />
                <Bar dataKey="fraud" fill="#ef4444" name="Fraudulent Txns" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Typology Breakdown */}
          <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-xs uppercase">Injected Fraud Typologies</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={datasetSummary.typology_breakdown}
                  dataKey="count"
                  nameKey="typology"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name }) => name}
                >
                  {datasetSummary.typology_breakdown.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Schema Table */}
      <div className="border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-xs uppercase font-mono">Canonical UPI Transaction Schema</h3>
        <table className="w-full text-xs font-mono">
          <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-200 dark:border-[#27272a]">
            <tr>
              <th className="text-left pb-2">Field</th>
              <th className="text-left pb-2">Type</th>
              <th className="text-left pb-2">Description</th>
              <th className="text-left pb-2">Feature Group</th>
            </tr>
          </thead>
          <tbody className="text-slate-800 dark:text-zinc-300">
            <tr className="border-b border-slate-100 dark:border-zinc-800/50">
              <td className="py-2 text-emerald-600 dark:text-[#86efac] font-bold">txn_id</td>
              <td>uuid</td>
              <td>Unique transaction locator</td>
              <td>Identifier</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-zinc-800/50">
              <td className="py-2 text-emerald-600 dark:text-[#86efac] font-bold">amount_inr</td>
              <td>float</td>
              <td>Transaction value in INR</td>
              <td>Transaction</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-zinc-800/50">
              <td className="py-2 text-emerald-600 dark:text-[#86efac] font-bold">velocity_1h / 24h</td>
              <td>int</td>
              <td>Number of transactions in rolling window</td>
              <td>Behavioral</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-zinc-800/50">
              <td className="py-2 text-emerald-600 dark:text-[#86efac] font-bold">geo_speed_kmh</td>
              <td>float</td>
              <td>Implied speed between consecutive transactions</td>
              <td>Behavioral</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-zinc-800/50">
              <td className="py-2 text-emerald-600 dark:text-[#86efac] font-bold">ring_score</td>
              <td>float [0,1]</td>
              <td>Rolling 24h graph community detection score</td>
              <td>Graph Network</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
