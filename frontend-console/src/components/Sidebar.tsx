import { 
  ListOrdered, 
  BarChart2, 
  Cpu, 
  Radio, 
  GitBranch, 
  FlaskConical, 
  Database,
  ArrowUpRight
} from 'lucide-react';

const navItems = [
  { id: 'replay', label: 'Transaction Replay', icon: ListOrdered },
  { id: 'benchmarks', label: 'Model Benchmarks', icon: BarChart2 },
  { id: 'circuit', label: 'Circuit & Measurements', icon: Cpu },
  { id: 'qkd', label: 'QKD Channel Lab', icon: Radio },
  { id: 'policy', label: 'Adaptive Security Policy', icon: GitBranch },
  { id: 'experiments', label: 'Experiments & Provenance', icon: FlaskConical },
  { id: 'schema', label: 'Data Schema', icon: Database },
];

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isConnected: boolean;
}

export function Sidebar({ activePage, setActivePage, isConnected }: SidebarProps) {
  return (
    <div className="w-[280px] min-w-[280px] h-screen bg-white dark:bg-[#0c0c0c] border-r border-gray-200 dark:border-[#27272a] flex flex-col font-sans text-sm">
      {/* Logo */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-gray-300 dark:border-zinc-700 flex items-center justify-center bg-zinc-900 shadow-inner">
            <div className="w-3 h-3 bg-zinc-400 rounded-sm"></div>
          </div>
          <span className="text-xl font-mono tracking-widest text-gray-900 dark:text-white">Q-UPI</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-600 tracking-wider mb-1">Security Workspace</div>
        <div className="text-xs text-gray-600 dark:text-zinc-400">Quantum-resilient payment research</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activePage === item.id 
                ? 'bg-black dark:bg-[#1e1e1e] text-white hover:bg-gray-800 dark:bg-zinc-800 border border-gray-800' 
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-[#121212]'
            }`}
          >
            <item.icon className="w-4 h-4 opacity-80" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Environment */}
      <div className="p-6 pt-4 border-t border-gray-200 dark:border-[#27272a]">
        <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-600 tracking-wider mb-3">Environment</div>
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded border mb-3 ${isConnected ? 'border-red-200 dark:border-green-900 bg-red-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-red-500 dark:bg-green-500' : 'bg-zinc-500'}`}></div>
          <span className={`text-[10px] font-mono ${isConnected ? 'text-red-600 dark:text-green-400' : 'text-gray-600 dark:text-zinc-400'}`}>
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-zinc-500 leading-relaxed mb-3">
          {isConnected ? 'Unified API and Qiskit statevector core are live on port 8002.' : 'No dataset, runtime or payment gateway connected.'}
        </p>
        <button className=" text-xs flex items-center gap-1 hover:underline text-white">
          Configure environment <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Profile */}
      <div className="p-6 border-t border-gray-200 dark:border-[#27272a] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-gray-600 dark:text-zinc-400 font-mono">
          AW
        </div>
        <div>
          <div className="text-xs font-medium text-gray-800 dark:text-zinc-300">Analyst workspace</div>
          <div className="text-[10px] font-mono text-gray-500 dark:text-zinc-500">LOCAL PROTOTYPE</div>
        </div>
      </div>
    </div>
  );
}
