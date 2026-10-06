import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ModelBenchmarks } from './pages/ModelBenchmarks';
import { TransactionReplay } from './pages/TransactionReplay';
import { ExperimentsProvenance } from './pages/ExperimentsProvenance';
import { DataSchema } from './pages/DataSchema';
import { CircuitMeasurements } from './pages/CircuitMeasurements';
import { QkdChannelLab } from './pages/QkdChannelLab';
import { AdaptiveSecurityPolicy } from './pages/AdaptiveSecurityPolicy';
import { API_BASE_URL } from './config';

export default function App() {
  const [activePage, setActivePage] = useState('benchmarks');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Ping Backend on Load
  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const health = await response.json();
        if (mounted) setIsConnected(health.status === 'ready');
      } catch {
        if (mounted) setIsConnected(false);
      }
    };
    checkHealth();
    const timer = window.setInterval(checkHealth, 2000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  // Apply dark class to body based on state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderPage = () => {
    switch (activePage) {
      case 'benchmarks': return <ModelBenchmarks />;
      case 'replay': return <TransactionReplay />;
      case 'circuit': return <CircuitMeasurements />;
      case 'qkd': return <QkdChannelLab />;
      case 'policy': return <AdaptiveSecurityPolicy />;
      case 'experiments': return <ExperimentsProvenance />;
      case 'schema': return <DataSchema />;
      default: return <ModelBenchmarks />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'benchmarks': 'Model Benchmarks',
      'replay': 'Transaction Replay',
      'circuit': 'Circuit & Measurements',
      'qkd': 'QKD Channel Lab',
      'policy': 'Adaptive Security Policy',
      'experiments': 'Experiments & Provenance',
      'schema': 'Data Schema'
    };
    return titles[activePage] || 'Dashboard';
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0c0c0c] text-gray-900 dark:text-white overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isConnected={isConnected} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#121212]">
        <Header pageTitle={getPageTitle()} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} isConnected={isConnected} />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
