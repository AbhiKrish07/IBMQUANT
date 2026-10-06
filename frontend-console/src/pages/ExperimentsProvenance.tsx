import { useState } from 'react';
import { Download } from 'lucide-react';

export function ExperimentsProvenance() {
  const [expType, setExpType] = useState('all');
  const [runStatus, setRunStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const experiments = [
    { id: 'E1-BM-001', type: 'E1 Main Benchmark', dataset: 'Synthetic UPI v1.0', backend: 'Bloq / Qiskit Aer', started: '2026-10-06 23:45', status: 'SUCCESS', pr_auc: '0.914' },
    { id: 'E2-GS-002', type: 'E2 Grid Search (N x Feats)', dataset: 'Synthetic UPI Drifted', backend: 'Bloq / Qiskit Aer', started: '2026-10-06 23:10', status: 'SUCCESS', pr_auc: '0.892' },
    { id: 'E3-GZ-003', type: 'E3 Gray Zone Boost', dataset: 'Synthetic UPI (2k txns)', backend: 'Bloq / Qiskit Aer', started: '2026-10-06 22:30', status: 'SUCCESS', pr_auc: '0.925' },
  ];

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "experiments_provenance_manifest.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">
            Q-UPI / Security Gateway
          </div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">
            Experiments & Provenance Manifest
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Track reproducible runs, checksum manifests, and 95% bootstrap confidence intervals (FR-7 & FR-9).
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportJson}
            className="px-4 py-2 rounded-lg border border-red-600 dark:border-[#86efac] bg-red-600 dark:bg-[#86efac] text-white dark:text-gray-900 text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Manifest JSON
          </button>
        </div>
      </div>

      {/* Registry Filters */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Experiment Registry</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Experiment Type</label>
            <select
              value={expType}
              onChange={(e) => setExpType(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Experiment Types</option>
              <option value="E1">E1 Main Benchmark</option>
              <option value="E2">E2 Grid Search (Sample x Feature)</option>
              <option value="E3">E3 Gray Zone Recall Boost</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Run Status</label>
            <select
              value={runStatus}
              onChange={(e) => setRunStatus(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="RUNNING">RUNNING</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Search</label>
            <input
              type="text"
              placeholder="Search Experiment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <table className="w-full text-xs font-mono">
          <thead className="text-[10px] text-gray-500 uppercase border-b border-gray-200 dark:border-[#27272a]">
            <tr>
              <th className="text-left pb-3">Experiment ID</th>
              <th className="text-left pb-3">Type</th>
              <th className="text-left pb-3">Dataset Version</th>
              <th className="text-left pb-3">Backend</th>
              <th className="text-left pb-3">Started At</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-left pb-3">PR-AUC</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-zinc-300">
            {experiments.map((exp) => (
              <tr key={exp.id} className="border-b border-gray-100 dark:border-zinc-800/50">
                <td className="py-3 text-red-600 dark:text-[#86efac] font-bold">{exp.id}</td>
                <td className="py-3">{exp.type}</td>
                <td className="py-3">{exp.dataset}</td>
                <td className="py-3">{exp.backend}</td>
                <td className="py-3">{exp.started}</td>
                <td className="py-3 text-green-500 font-bold">{exp.status}</td>
                <td className="py-3 font-bold">{exp.pr_auc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
