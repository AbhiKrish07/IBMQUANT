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
    <div className="w-[300px] min-w-[300px] h-screen bg-[#080908] border-r border-[rgba(231,235,219,0.11)] flex flex-col font-sans text-sm overflow-y-auto text-[#e8e9e4]">
      {/* Logo Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#d4ff55]/30 bg-[#101110] flex items-center justify-center shadow-[0_0_12px_rgba(212,255,85,0.15)]">
            <span className="brand-aperture" aria-hidden="true" style={{ scale: '0.65' }}>
              <i /><i /><i /><i />
            </span>
          </div>
          <div>
            <span className="text-xl font-mono tracking-widest text-[#e8e9e4] font-bold">Q-UPI</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 bg-[#d4ff55]/10 text-[#d4ff55] border border-[#d4ff55]/30 rounded font-semibold">QML 2.0</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-1">
        <div className="text-[10px] uppercase font-mono font-semibold text-[#747871] tracking-wider mb-0.5">Security Workspace</div>
        <div className="text-xs text-[#a0a39c]">Quantum-resilient payment engine</div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 mt-4 space-y-1.5">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all ${
                isActive 
                  ? 'bg-[#141613] text-[#d4ff55] font-semibold border-l-2 border-[#d4ff55] shadow-sm' 
                  : 'text-[#a0a39c] hover:text-[#e8e9e4] hover:bg-[#101110]'
              }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#d4ff55]' : 'text-[#747871]'}`} />
              <span className={`font-medium text-xs transition-colors ${isActive ? 'text-[#d4ff55]' : 'text-[#e8e9e4]'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Dataset & Quantum Controls */}
      <div className="p-4 mx-3 my-3 bg-[#101110] border border-[rgba(231,235,219,0.11)] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#e8e9e4]">
            <Database className="w-3.5 h-3.5 text-[#d4ff55]" />
            <span>DATASET MODE</span>
          </div>
          {isRetraining && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#d4ff55] animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> FIT
            </span>
          )}
        </div>

        {/* Dataset Dropdown */}
        <select
          value={currentDataset}
          onChange={(e) => handleDatasetChange(e.target.value)}
          disabled={isRetraining}
          className="w-full bg-[#141613] border border-[rgba(231,235,219,0.19)] text-xs font-mono text-[#e8e9e4] rounded-md p-2 focus:outline-none focus:border-[#d4ff55] cursor-pointer"
        >
          {datasets.map(d => (
            <option key={d.id} value={d.id} className="bg-[#101110] text-[#e8e9e4]">
              {d.name} ({d.tag})
            </option>
          ))}
        </select>

        {/* Quantum Parameters Toggle */}
        <div className="pt-2 border-t border-[rgba(231,235,219,0.11)]">
          <button 
            onClick={() => setShowQSettings(!showQSettings)}
            className="w-full flex items-center justify-between text-xs text-[#a0a39c] hover:text-[#e8e9e4] py-1"
          >
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Sliders className="w-3 h-3 text-[#d4ff55]" /> Quantum Model Config
            </span>
            <span className="text-[10px] font-mono text-[#d4ff55]">{showQSettings ? '[-]' : '[+]'}</span>
          </button>

          {showQSettings && (
            <div className="mt-2 space-y-2.5 pt-2 border-t border-[rgba(231,235,219,0.11)] text-xs font-mono">
              <div>
                <div className="flex justify-between text-[11px] text-[#a0a39c] mb-1">
                  <span>Qubits (N)</span>
                  <span className="text-[#d4ff55] font-bold">{qConfig.n_qubits}</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="6" 
                  value={qConfig.n_qubits}
                  onChange={(e) => handleConfigUpdate({ n_qubits: parseInt(e.target.value) })}
                  className="w-full accent-[#d4ff55] bg-[#27272a] h-1 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#a0a39c] mb-1">
                  <span>Circuit Reps (L)</span>
                  <span className="text-[#d4ff55] font-bold">{qConfig.reps}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={qConfig.reps}
                  onChange={(e) => handleConfigUpdate({ reps: parseInt(e.target.value) })}
                  className="w-full accent-[#d4ff55] bg-[#27272a] h-1 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="text-[11px] text-[#a0a39c] mb-1">Entanglement Scheme</div>
                <select
                  value={qConfig.entanglement}
                  onChange={(e) => handleConfigUpdate({ entanglement: e.target.value })}
                  className="w-full bg-[#141613] border border-[rgba(231,235,219,0.19)] text-[11px] font-mono text-[#e8e9e4] rounded p-1.5 focus:outline-none focus:border-[#d4ff55]"
                >
                  <option value="linear" className="bg-[#101110] text-[#e8e9e4]">Linear (Nearest Neighbor)</option>
                  <option value="full" className="bg-[#101110] text-[#e8e9e4]">Full (All-to-All)</option>
                  <option value="circular" className="bg-[#101110] text-[#e8e9e4]">Circular (Ring)</option>
                </select>
              </div>

              <div className="text-[9px] text-[#a0a39c] font-mono flex items-center gap-1 pt-1">
                <Zap className="w-3 h-3 text-[#d4ff55] inline" /> Fit-time caching active (~12ms statevector evaluation)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Environment Status */}
      <div className="p-4 pt-2 border-t border-[rgba(231,235,219,0.11)]">
        <div className="text-[10px] uppercase font-mono font-semibold text-[#747871] tracking-wider mb-2">Environment Status</div>
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border mb-2 ${isConnected ? 'border-[#d4ff55]/30 bg-[#d4ff55]/10' : 'border-[rgba(231,235,219,0.11)] bg-[#101110]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#d4ff55] shadow-[0_0_8px_rgba(212,255,85,0.8)] animate-pulse' : 'bg-[#747871]'}`}></div>
          <span className={`text-[10px] font-mono ${isConnected ? 'text-[#d4ff55] font-semibold' : 'text-[#a0a39c]'}`}>
            {isConnected ? 'ONLINE — QISKIT 1.4.6' : 'DISCONNECTED'}
          </span>
        </div>
        <p className="text-[11px] text-[#747871] leading-tight mb-2">
          {isConnected ? 'Fast statevector engine on port 8002 with AI explanation assistance.' : 'Backend disconnected.'}
        </p>
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-[rgba(231,235,219,0.11)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#141613] flex items-center justify-center text-xs text-[#d4ff55] font-mono border border-[#d4ff55]/30 font-bold">
          QML
        </div>
        <div>
          <div className="text-xs font-medium text-[#e8e9e4]">Sentinel Analyst</div>
          <div className="text-[10px] font-mono text-[#d4ff55]">FAST STATEVECTOR RUNTIME</div>
        </div>
      </div>
    </div>
  );
}

