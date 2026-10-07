import { Settings2, ArrowLeft, Sun, Moon } from 'lucide-react';
import { type CanonicalTransaction } from '../config/transactions';

interface HeaderProps {
  pageTitle: string;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  isConnected: boolean;
  activeTx?: CanonicalTransaction;
  onSelectTx?: (tx: CanonicalTransaction) => void;
  onBackToLanding?: () => void;
}

export function Header({ pageTitle, isDarkMode, setIsDarkMode, isConnected, onBackToLanding }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-slate-200 dark:border-[rgba(231,235,219,0.11)] bg-white dark:bg-[#080908] text-slate-900 dark:text-[#e8e9e4] z-30 font-mono">
      <div className="flex items-center gap-3 text-xs">
        {onBackToLanding && (
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-1 text-slate-500 dark:text-[#747871] hover:text-emerald-600 dark:hover:text-[#d4ff55] uppercase tracking-widest transition-colors font-medium mr-2"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>[ LANDING ]</span>
          </button>
        )}
        <span className="text-slate-500 dark:text-[#747871] uppercase tracking-widest font-medium">WORKSPACE</span>
        <span className="text-slate-400 dark:text-[#747871]">/</span>
        <span className="text-slate-900 dark:text-[#e8e9e4] font-medium">{pageTitle}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {setIsDarkMode && (
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs border border-slate-300 dark:border-[rgba(231,235,219,0.19)] rounded-md bg-slate-100 dark:bg-[#101110] text-slate-800 dark:text-[#e8e9e4] hover:border-emerald-600 dark:hover:border-[#d4ff55] transition-all cursor-pointer font-bold"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#d4ff55]" />
                <span className="text-[10px] font-mono tracking-wider text-[#d4ff55]">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-[10px] font-mono tracking-wider text-slate-800">DARK</span>
              </>
            )}
          </button>
        )}
        <span className="status-pill">EXPERIMENTAL</span>
        <span className="status-pill">
          <span className={`status-dot ${isConnected ? 'bg-emerald-600 dark:bg-[#d4ff55] shadow-[0_0_8px_rgba(212,255,85,0.8)]' : 'bg-slate-400'}`} />
          {isConnected ? 'BACKEND CONNECTED' : 'BACKEND DISCONNECTED'}
        </span>
        {onBackToLanding && (
          <button 
            onClick={onBackToLanding}
            className="p-2 text-slate-500 dark:text-[#747871] hover:text-emerald-600 dark:hover:text-[#d4ff55] transition-colors"
            title="Landing Page"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
