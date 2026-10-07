import { useState, useEffect } from 'react';
import { 
  ListOrdered, 
  BarChart2, 
  Cpu, 
  Radio, 
  FlaskConical, 
  Database,
  Sliders,
  RefreshCw,
  Zap
} from 'lucide-react';
import { fetchApi } from '../config';

const navItems = [
  { id: 'replay', label: 'Transaction Replay', icon: ListOrdered },
  { id: 'compare', label: 'Classical vs Quantum', icon: Cpu },
  { id: 'benchmarks', label: 'Model Benchmarks', icon: BarChart2 },
  { id: 'circuit', label: 'Circuit & Measurements', icon: Cpu },
  { id: 'qkd', label: 'QKD Channel Lab', icon: Radio },
  { id: 'experiments', label: 'Experiments & Provenance', icon: FlaskConical },
  { id: 'schema', label: 'Data Schema', icon: Database },
];

interface DatasetOption {
  id: string;
  name: string;
  rows: number;
  tag: string;
}

interface QuantumConfig {
  n_qubits: number;
  reps: number;
  entanglement: string;
  subset_size: number;
}

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isConnected: boolean;
  onDatasetOrConfigChange?: () => void;
}

export function Sidebar({ activePage, setActivePage, isConnected, onDatasetOrConfigChange }: SidebarProps) {
  const [datasets, setDatasets] = useState<DatasetOption[]>([
    { id: 'synthetic', name: 'Synthetic UPI Stream', rows: 1500, tag: 'Benchmark' },
    { id: 'upi_real', name: 'UPI Real Transactions', rows: 2500, tag: 'Live Production' },
    { id: 'creditcard', name: 'Credit Card Fraud', rows: 284807, tag: 'Kaggle Classic' },
    { id: 'paysim', name: 'PaySim Mobile Money', rows: 6362620, tag: 'Synthetic Pay' },
    { id: 'ieee_cis', name: 'IEEE-CIS Fraud', rows: 590540, tag: 'High-Dim Vesta' },
    { id: 'bank_fraud', name: 'Bank Account Fraud', rows: 1000000, tag: 'NeurIPS 2022' },
    { id: 'retail', name: 'Retail Banking UPI', rows: 8450, tag: 'Merchant Flow' },
  ]);

  const [currentDataset, setCurrentDataset] = useState('synthetic');
  const [qConfig, setQConfig] = useState<QuantumConfig>({
    n_qubits: 4,
    reps: 2,
    entanglement: 'linear',
    subset_size: 60
  });
  const [isRetraining, setIsRetraining] = useState(false);
  const [showQSettings, setShowQSettings] = useState(false);

  useEffect(() => {
    // Fetch options and status on load
    fetchApi<{ datasets: DatasetOption[]; quantum_config: QuantumConfig }>('/api/options')
      .then(res => {
        if (res.datasets) setDatasets(res.datasets);
        if (res.quantum_config) setQConfig(res.quantum_config);
      })
      .catch(() => {});

    fetchApi<{ dataset_mode: string; quantum_config: QuantumConfig }>('/api/dataset/status')
      .then(res => {
        if (res.dataset_mode) setCurrentDataset(res.dataset_mode);
        if (res.quantum_config) setQConfig(res.quantum_config);
      })
      .catch(() => {});
  }, []);

  const handleDatasetChange = async (newMode: string) => {
    setCurrentDataset(newMode);
    setIsRetraining(true);
    try {
      await fetchApi('/api/dataset/select', {
        method: 'POST',
        body: JSON.stringify({ mode: newMode })
      });
      if (onDatasetOrConfigChange) onDatasetOrConfigChange();
    } catch (e) {
      console.error('Failed to change dataset', e);
    } finally {
      setIsRetraining(false);
    }
  };

  const handleConfigUpdate = async (updated: Partial<QuantumConfig>) => {
    const nextConfig = { ...qConfig, ...updated };
    setQConfig(nextConfig);
    setIsRetraining(true);
    try {
      await fetchApi('/api/quantum/config', {
        method: 'POST',
        body: JSON.stringify(nextConfig)
      });
      if (onDatasetOrConfigChange) onDatasetOrConfigChange();
    } catch (e) {
      console.error('Failed to update quantum config', e);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="w-[300px] min-w-[300px] h-screen bg-white dark:bg-[#0c0c0c] border-r border-gray-200 dark:border-[#27272a] flex flex-col font-sans text-sm overflow-y-auto">
      {/* Logo */}
      <div className="p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-gray-300 dark:border-zinc-700 flex items-center justify-center bg-zinc-900 shadow-inner">
            <div className="w-3 h-3 bg-red-600 rounded-sm animate-pulse"></div>
          </div>
          <div>
            <span className="text-xl font-mono tracking-widest text-gray-900 dark:text-white font-bold">Q-UPI</span>
            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded">QML 2.0</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-2">
        <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-600 tracking-wider mb-0.5">Security Workspace</div>
        <div className="text-xs text-gray-600 dark:text-zinc-400">Quantum-resilient payment engine</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activePage === item.id 
                ? 'bg-black dark:bg-[#1e1e1e] text-white hover:bg-gray-800 dark:hover:bg-zinc-800 border border-gray-800 dark:border-zinc-700' 
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#121212]'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activePage === item.id ? 'text-red-500' : 'opacity-80'}`} />
            <span className="font-medium text-xs">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Dataset & Quantum Controls */}
      <div className="p-4 mx-3 my-2 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-200">
            <Database className="w-3.5 h-3.5 text-red-500" />
            <span>DATASET MODE</span>
          </div>
          {isRetraining && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-red-500 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> FIT
            </span>
          )}
        </div>

        {/* Dataset Dropdown */}
        <select
          value={currentDataset}
          onChange={(e) => handleDatasetChange(e.target.value)}
          disabled={isRetraining}
          className="w-full bg-white dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 rounded-md p-2 focus:outline-none focus:border-red-500 cursor-pointer"
        >
          {datasets.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.tag})
            </option>
          ))}
        </select>

        {/* Quantum Parameters Toggle */}
        <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => setShowQSettings(!showQSettings)}
            className="w-full flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1"
          >
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Sliders className="w-3 h-3 text-red-500" /> Quantum Model Config
            </span>
            <span className="text-[10px] font-mono text-red-500">{showQSettings ? '[-]' : '[+]'}</span>
          </button>

          {showQSettings && (
            <div className="mt-2 space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
                  <span>Qubits (N)</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">{qConfig.n_qubits}</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="6" 
                  value={qConfig.n_qubits}
                  onChange={(e) => handleConfigUpdate({ n_qubits: parseInt(e.target.value) })}
                  className="w-full accent-red-600 bg-zinc-700 h-1 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
                  <span>Circuit Reps (L)</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">{qConfig.reps}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={qConfig.reps}
                  onChange={(e) => handleConfigUpdate({ reps: parseInt(e.target.value) })}
                  className="w-full accent-red-600 bg-zinc-700 h-1 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="text-[11px] text-zinc-500 mb-1">Entanglement Scheme</div>
                <select
                  value={qConfig.entanglement}
                  onChange={(e) => handleConfigUpdate({ entanglement: e.target.value })}
                  className="w-full bg-white dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 text-[11px] font-mono text-zinc-900 dark:text-zinc-100 rounded p-1.5 focus:outline-none focus:border-red-500"
                >
                  <option value="linear">Linear (Nearest Neighbor)</option>
                  <option value="full">Full (All-to-All)</option>
                  <option value="circular">Circular (Ring)</option>
                </select>
              </div>

              <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-1 pt-1">
                <Zap className="w-3 h-3 text-red-500 inline" /> Fit-time caching active (~12ms statevector evaluation)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Environment */}
      <div className="p-4 pt-2 border-t border-gray-200 dark:border-[#27272a]">
        <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-600 tracking-wider mb-2">Environment Status</div>
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded border mb-2 ${isConnected ? 'border-red-500/30 bg-red-500/10' : 'border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`}></div>
          <span className={`text-[10px] font-mono ${isConnected ? 'text-red-500' : 'text-gray-600 dark:text-zinc-400'}`}>
            {isConnected ? 'ONLINE — QISKIT 1.4.6' : 'DISCONNECTED'}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-zinc-500 leading-tight mb-2">
          {isConnected ? 'Fast statevector engine on port 8002 with AI explanation assistance.' : 'Backend disconnected.'}
        </p>
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-[#27272a] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-gray-600 dark:text-zinc-400 font-mono border border-zinc-700">
          QML
        </div>
        <div>
          <div className="text-xs font-medium text-gray-800 dark:text-zinc-300">Sentinel Analyst</div>
          <div className="text-[10px] font-mono text-red-500">FAST STATEVECTOR RUNTIME</div>
        </div>
      </div>
    </div>
  );
}

