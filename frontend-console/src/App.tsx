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
import { type CanonicalTransaction, CANONICAL_TRANSACTIONS } from './config/transactions';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [activePage, setActivePage] = useState('benchmarks');
  const isDarkMode = true;
  const [isConnected, setIsConnected] = useState(false);
  const [activeTx, setActiveTx] = useState<CanonicalTransaction>(CANONICAL_TRANSACTIONS[0]); // Default to TXN-84921

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

  const handleSelectTx = (tx: CanonicalTransaction) => {
    setActiveTx(tx);
  };

  if (viewMode === 'landing') {
    return <LandingPage onEnterWorkspace={handleEnterWorkspace} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'benchmarks': return <ModelBenchmarks key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
      case 'compare': return <ClassicalVsQuantum key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
      case 'replay': return <TransactionReplay key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
      case 'circuit': return <CircuitMeasurements key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
      case 'qkd': return <QkdChannelLab key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
      case 'experiments': return <ExperimentsProvenance key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
      case 'schema': return <DataSchema key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
      default: return <ModelBenchmarks key={refreshKey} activeTx={activeTx} onSelectTx={handleSelectTx} onNavigate={setActivePage} />;
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
    <div className="flex h-screen w-full bg-[#080908] text-[#e8e9e4] overflow-hidden relative">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isConnected={isConnected} 
        onDatasetOrConfigChange={handleDatasetOrConfigChange}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0c0d0c] text-[#e8e9e4] pb-10">
        <Header 
          pageTitle={getPageTitle()} 
          isConnected={isConnected}
          activeTx={activeTx}
          onSelectTx={handleSelectTx}
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
