import { Settings2, ArrowLeft } from 'lucide-react';
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

export function Header({ pageTitle, isConnected, onBackToLanding }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-[rgba(231,235,219,0.11)] bg-[#080908] text-[#e8e9e4] z-30 font-mono">
      <div className="flex items-center gap-3 text-xs">
        {onBackToLanding && (
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-1 text-[#747871] hover:text-[#d4ff55] uppercase tracking-widest transition-colors font-medium mr-2"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>[ LANDING ]</span>
          </button>
        )}
        <span className="text-[#747871] uppercase tracking-widest font-medium">WORKSPACE</span>
        <span className="text-[#747871]">/</span>
        <span className="text-[#e8e9e4] font-medium">{pageTitle}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="status-pill">EXPERIMENTAL</span>
        <span className="status-pill">
          <span className={`status-dot ${isConnected ? 'bg-[#d4ff55] shadow-[0_0_8px_rgba(212,255,85,0.8)]' : 'bg-[#747871]'}`} />
          {isConnected ? 'BACKEND CONNECTED' : 'BACKEND DISCONNECTED'}
        </span>
        {onBackToLanding && (
          <button 
            onClick={onBackToLanding}
            className="p-2 text-[#747871] hover:text-[#d4ff55] transition-colors"
            title="Landing Page"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
