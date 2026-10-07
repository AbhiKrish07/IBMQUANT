import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QuantumTerminal } from './components/QuantumTerminal';
import { ClassicalVsQuantum } from './pages/ClassicalVsQuantum';
import { ModelBenchmarks } from './pages/ModelBenchmarks';
import { TransactionReplay } from './pages/TransactionReplay';
import { ExperimentsProvenance } from './pages/ExperimentsProvenance';
import { DataSchema } from './pages/DataSchema';
import { CircuitMeasurements } from './pages/CircuitMeasurements';
import { QkdChannelLab } from './pages/QkdChannelLab';
import { API_BASE_URL } from './config';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [activePage, setActivePage] = useState('benchmarks');
  const [isDarkMode, setIsDarkMode] = useState(true);
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

  const [refreshKey, setRefreshKey] = useState(0);

  const handleDatasetOrConfigChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEnterWorkspace = (targetPage?: string) => {
    if (targetPage) {
      setActivePage(targetPage);
    }
    setViewMode('workspace');
  };

  if (viewMode === 'landing') {
    return <LandingPage onEnterWorkspace={handleEnterWorkspace} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'benchmarks': return <ModelBenchmarks key={refreshKey} />;
      case 'compare': return <ClassicalVsQuantum key={refreshKey} />;
      case 'replay': return <TransactionReplay key={refreshKey} />;
      case 'circuit': return <CircuitMeasurements key={refreshKey} />;
      case 'qkd': return <QkdChannelLab key={refreshKey} />;
      case 'experiments': return <ExperimentsProvenance key={refreshKey} />;
      case 'schema': return <DataSchema key={refreshKey} />;
      default: return <ModelBenchmarks key={refreshKey} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'benchmarks': 'Model Benchmarks',
      'compare': 'Classical vs Quantum Head-to-Head',
      'replay': 'Transaction Replay',
      'circuit': 'Circuit & Measurements',
      'qkd': 'QKD Channel Lab',
      'experiments': 'Experiments & Provenance',
      'schema': 'Data Schema'
    };
    return titles[activePage] || 'Dashboard';
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0c0c0c] text-gray-900 dark:text-white overflow-hidden relative">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isConnected={isConnected} 
        onDatasetOrConfigChange={handleDatasetOrConfigChange}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#121212] pb-10">
        <Header 
          pageTitle={getPageTitle()} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          isConnected={isConnected}
          onBackToLanding={() => setViewMode('landing')}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-16">
          {renderPage()}
        </main>
      </div>
      <QuantumTerminal />
    </div>
  );
}
