import { Settings2, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  pageTitle: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isConnected: boolean;
  onBackToLanding?: () => void;
}

export function Header({ pageTitle, isDarkMode, setIsDarkMode, isConnected, onBackToLanding }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#27272a]">
      <div className="flex items-center gap-2 text-xs">
        {onBackToLanding && (
          <button 
            onClick={onBackToLanding}
            className="text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white font-mono uppercase tracking-widest transition-colors font-bold mr-1"
          >
            [ Landing ]
          </button>
        )}
        <span className="text-gray-500 dark:text-zinc-500 uppercase tracking-widest font-semibold">Workspace</span>
        <span className="text-gray-400 dark:text-zinc-600">/</span>
        <span className="text-gray-800 dark:text-zinc-300 font-medium">{pageTitle}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
          <span className="text-[10px] font-mono tracking-wide text-gray-600 dark:text-zinc-400">EXPERIMENTAL</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'border-red-200 dark:border-green-900 bg-red-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-red-500 dark:bg-green-500' : 'bg-zinc-500'}`}></div>
          <span className={`text-[10px] font-mono tracking-wide ${isConnected ? 'text-red-600 dark:text-green-400' : 'text-gray-600 dark:text-zinc-400'}`}>
            {isConnected ? 'BACKEND CONNECTED' : 'BACKEND DISCONNECTED'}
          </span>
        </div>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
