import { Settings2, Moon, Sun, ArrowRightLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { type CanonicalTransaction, CANONICAL_TRANSACTIONS } from '../config/transactions';

interface HeaderProps {
  pageTitle: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isConnected: boolean;
  activeTx: CanonicalTransaction;
  onSelectTx: (tx: CanonicalTransaction) => void;
  onBackToLanding?: () => void;
}

export function Header({ pageTitle, isDarkMode, setIsDarkMode, isConnected, activeTx, onSelectTx, onBackToLanding }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] z-30">
      <div className="flex items-center gap-3 text-xs">
        {onBackToLanding && (
          <button 
            onClick={onBackToLanding}
            className="text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white font-mono uppercase tracking-widest transition-colors font-bold mr-1"
          >
            [ Landing ]
          </button>
        )}
        <span className="text-gray-500 dark:text-zinc-500 uppercase tracking-widest font-semibold font-mono">Workspace</span>
        <span className="text-gray-400 dark:text-zinc-600">/</span>
        <span className="text-gray-800 dark:text-zinc-300 font-medium font-mono">{pageTitle}</span>

        {/* Global Active Transaction Selector Badge */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 dark:border-zinc-800">
          <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase font-bold flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-emerald-600 dark:text-[#86efac]" /> FOCUS TXN:
          </span>
          <div className="relative group">
            <select
              value={activeTx.id}
              onChange={(e) => {
                const target = CANONICAL_TRANSACTIONS.find(t => t.id === e.target.value);
                if (target) onSelectTx(target);
              }}
              className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-emerald-800 dark:text-[#86efac] focus:outline-none cursor-pointer"
            >
              {CANONICAL_TRANSACTIONS.map((tx) => (
                <option key={tx.id} value={tx.id} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">
                  {tx.id} — {tx.title} (₹{tx.amount_inr.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
            activeTx.ground_truth === 'MULE_FRAUD' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
          }`}>
            {activeTx.ground_truth === 'MULE_FRAUD' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            {activeTx.ground_truth === 'MULE_FRAUD' ? 'FRAUD' : 'LEGIT'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
          <span className="text-[10px] font-mono tracking-wide text-gray-600 dark:text-zinc-400">RESEARCH PROTOTYPE</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40' : 'border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`}></div>
          <span className={`text-[10px] font-mono tracking-wide ${isConnected ? 'text-emerald-700 dark:text-[#86efac] font-bold' : 'text-gray-600 dark:text-zinc-400'}`}>
            {isConnected ? 'QISKIT SIMULATOR READY' : 'LOCAL SIMULATOR'}
          </span>
        </div>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 ml-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-2 text-white">
          <Settings2 className="w-4 h-4 text-gray-400 hover:text-gray-900 dark:hover:text-white" />
        </button>
      </div>
    </header>
  );
}

