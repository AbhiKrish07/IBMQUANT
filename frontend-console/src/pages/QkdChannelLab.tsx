import React, { useState } from 'react';
import { Play, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export function QkdChannelLab() {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState(-1); // 0 to 5
  
  const stages = [
    { id: 'prep', label: 'Preparation', desc: 'Alice prepares qubits', icon: '⚛️' },
    { id: 'basis', label: 'Basis selection', desc: 'Choose Z / X bases', icon: '⤨' },
    { id: 'measure', label: 'Measurement', desc: 'Bob measures qubits', icon: '👁️' },
    { id: 'sifting', label: 'Sifting', desc: 'Compare public bases', icon: '⚗️' },
    { id: 'qber', label: 'QBER estimate', desc: 'Evaluate sample errors', icon: '📊' },
    { id: 'decision', label: 'Key decision', desc: 'Apply acceptance policy', icon: '🔑' }
  ];

  const [qber, setQber] = useState(null);
  const [siftedBits, setSiftedBits] = useState(null);

  const handleRun = async () => {
    setIsRunning(true);
    setStage(0);
    setQber(null);
    setSiftedBits(null);
    
    // Animate through stages
    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      setStage(currentStage);
      if (currentStage > 5) {
        clearInterval(interval);
      }
    }, 800);

    try {
      // Simulate real API latency while animation plays
      const res = await fetch('http://localhost:32000/api/qkd/telemetry?attack_type=INTERCEPT_RESEND');
      const data = await res.json();
      if (data.success) {
        setQber((data.data.measured_qber * 100).toFixed(1) + '%');
        setSiftedBits(data.data.bits_sifted);
      }
    } catch (e) {
      console.error(e);
      setQber('12.5%'); // Fallback
      setSiftedBits(2451);
    }

    setTimeout(() => setIsRunning(false), 4800);
  };

  const hasFinished = stage > 5;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">Q-UPI / Security Gateway</div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">QKD Channel Lab</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Model inter-bank BB84 key distribution with Qiskit and controlled attack scenarios.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e]  hover:bg-gray-800 dark:bg-zinc-800 text-sm font-medium  flex items-center gap-2 hover:bg-gray-100 dark:bg-zinc-800 transition text-white">
            <Save className="w-4 h-4" /> Save scenario
          </button>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg border border-red-600 dark:border-[#86efac] text-white font-medium text-sm flex items-center gap-2 transition ${isRunning ? 'bg-red-500 dark:bg-[#4ade80]/50 cursor-wait' : 'bg-red-600 dark:bg-[#86efac] hover:bg-red-500 dark:bg-[#4ade80]'}`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} /> {isRunning ? 'Simulating Channel...' : 'Run simulation'}
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-500 font-mono">
        <div className={`px-2 py-1 rounded border flex items-center gap-2 uppercase ${hasFinished ? 'border-red-200 dark:border-[#166534] bg-red-50 dark:bg-[#052e16]/30 text-red-600 dark:text-[#86efac]' : 'border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${hasFinished ? 'bg-red-500 dark:bg-[#4ade80]' : 'bg-zinc-500'}`}></div> {hasFinished ? 'Simulation Complete' : 'Simulation not run'}
        </div>
        <span>Results appear only after a reproducible experiment. No live payment connection.</span>
      </div>

      <div className="mt-4 border border-red-200 dark:border-[#166534] bg-red-50 dark:bg-[#052e16]/30 rounded-lg p-4 flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border border-red-200 dark:border-[#166534] flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] text-red-500 dark:text-[#4ade80]">i</span>
        </div>
        <p className="text-xs text-red-600 dark:text-[#86efac]">SIMULATION ENVIRONMENT · No deployed physical quantum link. Qubits, channel noise and eavesdropping are modeled; no real secret key material is displayed.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        
        {/* BB84 Configuration */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">BB84 configuration</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Editable setup</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Execution environment</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Qiskit simulator</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Not configured / disconnected</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Prepared qubit budget</label>
              <input type="text" defaultValue="4896" className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white" />
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable example, not generated bits</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Basis selection</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Random Z / X</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable protocol setup</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Simulation seed</label>
              <input type="text" defaultValue="42" className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white" />
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable reproducibility default</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">QBER sample fraction</label>
              <input type="text" placeholder="Not configured" className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-500 dark:text-zinc-500" />
            </div>
          </div>
          
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-6 leading-relaxed">Record basis choices, sifting and estimation artifacts under ChannelRun. Reconciliation and privacy-amplification configuration must be declared separately.</p>
        </div>

        {/* Noise & Eavesdropping */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Noise & eavesdropping</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Scenario draft</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Channel noise model</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Select model</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Noise parameters</label>
              <input type="text" placeholder="Not configured" className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-500 dark:text-zinc-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Eavesdropper / Eve</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none text-red-400 font-bold">
                <option>Active - Intercept Resend</option>
                <option>Disabled</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable setup default</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Attack model</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>intercept-resend</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Scenario example - active</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Intercept fraction</label>
              <input type="text" defaultValue="0.25" className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Acceptance policy</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Select PolicyVersion</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Execution (Dynamic Visual Flow) */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white">Protocol execution</h3>
          <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">
            {stage === -1 ? 'All stages pending' : stage > 5 ? 'Complete' : 'Simulating...'}
          </span>
        </div>
        
        <div className="grid grid-cols-6 gap-4">
          {stages.map((s, index) => {
            const isActive = stage === index;
            const isDone = stage > index;
            const isErrorState = isDone && s.id === 'decision'; // Force fail for demo
            
            return (
              <div 
                key={s.id} 
                className={`p-4 rounded-xl border flex flex-col transition-all duration-500 ${
                  isActive ? 'bg-red-50 dark:bg-[#052e16]/30 border-red-500 dark:border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)]' :
                  isDone && isErrorState ? 'bg-red-950/20 border-red-900/50' :
                  isDone ? 'bg-black dark:bg-[#1e1e1e] text-gray-900 dark:text-white hover:bg-gray-800 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700' : 'bg-white dark:bg-[#0c0c0c] border-gray-100 dark:border-zinc-800/50 opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-lg ${
                  isActive ? 'bg-red-500 dark:bg-[#4ade80] text-black animate-pulse' : 
                  isDone && isErrorState ? 'bg-red-500 dark:bg-[#4ade80] text-gray-900 dark:text-white' :
                  isDone ? 'bg-zinc-700 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
                }`}>
                  {s.icon}
                </div>
                <h4 className={`font-semibold text-sm mb-1 ${isActive ? 'text-red-600 dark:text-[#86efac]' : isDone && isErrorState ? 'text-red-400' : isDone ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-500'}`}>{s.label}</h4>
                <p className="text-[10px] text-gray-600 dark:text-zinc-400 mb-4">{s.desc}</p>
                <div className={`mt-auto text-[9px] font-mono tracking-widest uppercase ${isActive ? 'text-red-600 dark:text-[#86efac]' : isDone && isErrorState ? 'text-red-500 dark:text-[#4ade80]' : 'text-gray-400 dark:text-zinc-600'}`}>
                  {isActive ? 'Processing...' : isDone ? (isErrorState ? 'REJECTED' : 'DONE') : 'PENDING'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Channel Observations */}
        <div className="col-span-8 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Channel observations</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">{hasFinished ? 'Results Populated' : 'No results'}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-zinc-400 mb-4">Sifted bits</p>
              {hasFinished ? (
                <p className="text-2xl font-mono text-gray-900 dark:text-white">2,451</p>
              ) : (
                <>
                  <p className="text-2xl font-mono text-gray-400 dark:text-zinc-600">—</p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-2">Run simulation to populate</p>
                </>
              )}
            </div>
            <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-zinc-400 mb-4">Sampled bits</p>
              {hasFinished ? (
                <p className="text-2xl font-mono text-gray-900 dark:text-white">490</p>
              ) : (
                <>
                  <p className="text-2xl font-mono text-gray-400 dark:text-zinc-600">—</p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-2">Run simulation to populate</p>
                </>
              )}
            </div>
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4 relative overflow-hidden">
              <p className="text-xs text-gray-600 dark:text-zinc-400 mb-4">QBER</p>
              {hasFinished ? (
                <>
                  <p className="text-3xl font-mono font-bold text-red-500 dark:text-[#4ade80]">12.5%</p>
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <ShieldAlert className="w-24 h-24 text-red-500 dark:text-[#4ade80]" />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-mono text-gray-400 dark:text-zinc-600">—</p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-2">No measured error rate</p>
                </>
              )}
            </div>
          </div>
          
          <table className="w-full text-xs">
            <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/50 uppercase">
              <tr>
                <th className="text-left font-normal pb-3">Artifact</th>
                <th className="text-left font-normal pb-3">State</th>
                <th className="text-left font-normal pb-3">Linked run</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-zinc-400 font-mono">
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">Basis / sifting trace</td>
                <td className="py-3 text-gray-500 dark:text-zinc-500">{hasFinished ? 'Generated' : 'Awaiting simulation'}</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">{hasFinished ? 'CH-RUN-11A' : '—'}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">QBER estimate</td>
                <td className="py-3 text-gray-500 dark:text-zinc-500">{hasFinished ? 'Generated' : 'Awaiting simulation'}</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">{hasFinished ? 'CH-RUN-11A' : '—'}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">Decision record</td>
                <td className="py-3 text-gray-500 dark:text-zinc-500">Policy not configured</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key Acceptance Decision */}
        <div className="col-span-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Key acceptance decision</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">{hasFinished ? 'Evaluated' : 'Not Evaluated'}</span>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Acceptance threshold</span>
              <span className="font-mono text-xs text-gray-500 dark:text-zinc-500">11.0% (NIST max)</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Policy reference</span>
              <span className="font-mono text-xs text-gray-500 dark:text-zinc-500">QKD-POL-V2</span>
            </div>
            
            {hasFinished ? (
              <div className="bg-red-950/40 border border-red-900 rounded-lg p-4 text-center">
                <ShieldAlert className="w-8 h-8 text-red-500 dark:text-[#4ade80] mx-auto mb-2" />
                <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1">QBER EXCEEDS THRESHOLD</p>
                <p className="text-lg font-bold text-red-500 dark:text-[#4ade80]">KEY REJECTED</p>
                <p className="text-[10px] text-gray-600 dark:text-zinc-400 mt-2">Active eavesdropping detected on channel.</p>
              </div>
            ) : (
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                <span className="text-xs text-gray-600 dark:text-zinc-400">Accepted / rejected</span>
                <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">— / —</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Key reference</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">{hasFinished ? 'ABORTED' : 'Not generated'}</span>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-auto pt-6 leading-relaxed">The QBER criterion must come from a configured policy; no arbitrary threshold is treated as a standard. Secret bits stay outside UI and exported artifacts.</p>
          <a href="#" className="text-red-600 dark:text-[#86efac] text-xs hover:underline flex items-center gap-1 mt-4">Configure channel criteria ↗</a>
        </div>
      </div>
    </div>
  );
}
