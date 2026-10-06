import { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { API_BASE_URL } from '../config';

export function DataSchema() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [datasetSummary, setDatasetSummary] = useState<any>(null);

  // Generator Options
  const [nTxns, setNTxns] = useState(2000);
  const [fraudRate, setFraudRate] = useState(0.04);
  const [seed, setSeed] = useState(42);
  const [drift, setDrift] = useState(true);

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

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">
            Q-UPI / Security Gateway
          </div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">
            Data Schema & Generator
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Generate synthetic UPI-style payment datasets with 5 realistic fraud typologies (FR-1 & FR-2).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg border border-red-600 dark:border-[#86efac] bg-red-600 dark:bg-[#86efac] hover:bg-red-500 dark:bg-[#4ade80] text-white dark:text-gray-900 text-sm font-medium flex items-center gap-2 transition ${
              isGenerating ? 'opacity-75 cursor-wait' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating Dataset...' : 'Generate dataset'}
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Generator Parameters (FR-1)
        </h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Transaction Volume</label>
            <select
              value={nTxns}
              onChange={(e) => setNTxns(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value={1500}>1,500 Transactions</option>
              <option value={5000}>5,000 Transactions</option>
              <option value={20000}>20,000 Transactions (Full Split)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Fraud Rate</label>
            <select
              value={fraudRate}
              onChange={(e) => setFraudRate(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value={0.01}>1.0% (Realistic Imbalance)</option>
              <option value={0.04}>4.0% (SRS Standard)</option>
              <option value={0.10}>10.0% (High Stress Benchmark)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Random Seed</label>
            <select
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value={42}>Seed 42</option>
              <option value={43}>Seed 43</option>
              <option value={44}>Seed 44</option>
              <option value={45}>Seed 45</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Concept Drift</label>
            <button
              onClick={() => setDrift(!drift)}
              className={`w-full p-2.5 rounded-lg border text-sm font-medium transition ${
                drift
                  ? 'border-red-600 dark:border-[#86efac] bg-red-50 dark:bg-green-950/20 text-red-600 dark:text-[#86efac]'
                  : 'border-gray-300 dark:border-zinc-700 text-gray-500'
              }`}
            >
              {drift ? 'Day 20 Drift Active' : 'No Concept Drift'}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      {datasetSummary && (
        <div className="grid grid-cols-2 gap-6">
          {/* Amount Distribution */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Amount Distribution (Legit vs Fraud Tail)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datasetSummary.amount_distribution}>
                <XAxis dataKey="bin" stroke="#71717a" tick={{ fontSize: 9 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
                <Legend />
                <Bar dataKey="legit" fill="#3b82f6" name="Legitimate Txns" />
                <Bar dataKey="fraud" fill="#ef4444" name="Fraudulent Txns" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Typology Breakdown */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Injected Fraud Typologies</h3>
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
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Schema Table */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Canonical UPI Transaction Schema</h3>
        <table className="w-full text-xs font-mono">
          <thead className="text-[10px] text-gray-500 uppercase border-b border-gray-200 dark:border-[#27272a]">
            <tr>
              <th className="text-left pb-2">Field</th>
              <th className="text-left pb-2">Type</th>
              <th className="text-left pb-2">Description</th>
              <th className="text-left pb-2">Feature Group</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-zinc-300">
            <tr className="border-b border-gray-100 dark:border-zinc-800/50">
              <td className="py-2 text-red-600 dark:text-[#86efac]">txn_id</td>
              <td>uuid</td>
              <td>Unique transaction locator</td>
              <td>Identifier</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-zinc-800/50">
              <td className="py-2 text-red-600 dark:text-[#86efac]">amount_inr</td>
              <td>float</td>
              <td>Transaction value in INR</td>
              <td>Transaction</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-zinc-800/50">
              <td className="py-2 text-red-600 dark:text-[#86efac]">velocity_1h / 24h</td>
              <td>int</td>
              <td>Number of transactions in rolling window</td>
              <td>Behavioral</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-zinc-800/50">
              <td className="py-2 text-red-600 dark:text-[#86efac]">geo_speed_kmh</td>
              <td>float</td>
              <td>Implied speed between consecutive transactions</td>
              <td>Behavioral</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-zinc-800/50">
              <td className="py-2 text-red-600 dark:text-[#86efac]">ring_score</td>
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
