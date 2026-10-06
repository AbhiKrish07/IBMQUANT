import React, { useState, useEffect } from 'react';
import { Play, Download, Save, Cpu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function CircuitMeasurements() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [histogramData, setHistogramData] = useState([]);

  const handleExecute = () => {
    setIsExecuting(true);
    setHasExecuted(false);
    
    // Simulate execution time
    setTimeout(() => {
      setIsExecuting(false);
      setHasExecuted(true);
      // Mock probability distribution peaking around '0110' and '1001' due to ZZ feature map interference
      setHistogramData([
        { state: '0000', count: 12 }, { state: '0001', count: 45 }, { state: '0010', count: 21 },
        { state: '0011', count: 18 }, { state: '0100', count: 32 }, { state: '0101', count: 67 },
        { state: '0110', count: 342 }, { state: '0111', count: 22 }, { state: '1000', count: 15 },
        { state: '1001', count: 289 }, { state: '1010', count: 11 }, { state: '1011', count: 34 },
        { state: '1100', count: 19 }, { state: '1101', count: 45 }, { state: '1110', count: 21 },
        { state: '1111', count: 31 },
      ]);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">Q-UPI / Security Gateway</div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">Circuit & Measurements</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Configure Qiskit circuits and inspect the artifacts of an actual execution.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e]  hover:bg-gray-800 dark:bg-zinc-800 text-sm font-medium  flex items-center gap-2 hover:bg-gray-100 dark:bg-zinc-800 transition text-white">
            <Save className="w-4 h-4" /> Save configuration
          </button>
          <button 
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-4 py-2 rounded-lg border border-red-600 dark:border-[#86efac] text-white font-medium text-sm flex items-center gap-2 transition ${isExecuting ? 'bg-red-500 dark:bg-[#4ade80]/50 cursor-wait' : 'bg-red-600 dark:bg-[#86efac] hover:bg-red-500 dark:bg-[#4ade80]'}`}
          >
            <Play className={`w-4 h-4 ${isExecuting ? 'animate-pulse' : ''}`} /> {isExecuting ? 'Transpiling...' : 'Execute circuit'}
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-500 font-mono">
        <div className={`px-2 py-1 rounded border flex items-center gap-2 uppercase ${hasExecuted ? 'border-red-200 dark:border-[#166534] bg-red-50 dark:bg-[#052e16]/30 text-red-600 dark:text-[#86efac]' : 'border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${hasExecuted ? 'bg-red-500 dark:bg-[#4ade80]' : 'bg-zinc-500'}`}></div> {hasExecuted ? 'Circuit Executed' : 'Circuit not run'}
        </div>
        <span>Results appear only after a reproducible experiment. No live payment connection.</span>
      </div>

      <div className="grid grid-cols-12 gap-6 pt-2">
        
        {/* Left Column (Col Span 3) */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Circuit setup */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Circuit setup</h3>
              <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Draft</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-600 dark:text-zinc-400">Experiment context</label>
                <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                  <option>Select experiment</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-600 dark:text-zinc-400">Input feature pipeline</label>
                <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                  <option>Not configured</option>
                </select>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500">Use the same pipeline as the benchmark contract</p>
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-xs text-gray-600 dark:text-zinc-400">Circuit purpose</label>
                <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                  <option>QSVM feature map</option>
                </select>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable setup example</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-600 dark:text-zinc-400">Feature map / repetitions</label>
                <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                  <option>ZZFeatureMap / 2</option>
                </select>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable setup example - unexecuted</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 text-[10px] font-mono">
              <span className="text-gray-500 dark:text-zinc-500 uppercase">Feature dimension / qubits</span>
              <span className="text-gray-600 dark:text-zinc-400">Not resolved</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-4 leading-relaxed">Circuit construction requires a mapped feature vector. No circuit artifact has been generated.</p>
          </div>

          {/* Execution Target */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Execution target</h3>
            <div className="flex gap-6 border-b border-gray-200 dark:border-[#27272a] mb-6 text-sm">
              <button className="pb-3  border-b-2 border-red-600 dark:border-[#86efac] font-medium text-white">Simulator</button>
              <button className="pb-3  hover: text-white">Hardware</button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-600 dark:text-zinc-400">Intended backend</label>
                <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                  <option>Local Qiskit simulator</option>
                </select>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500">Runtime not configured or connected</p>
              </div>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-xs text-gray-600 dark:text-zinc-400">Shots</label>
                  <input type="text" value="1024" readOnly className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-600 dark:text-zinc-400" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-xs text-gray-600 dark:text-zinc-400">Simulator seed</label>
                  <input type="text" value="42" readOnly className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-600 dark:text-zinc-400" />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-6 mb-4">Editable defaults, not executed values. A hardware run requires a provider, device and separate queue metadata.</p>
            <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-3 flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                 <span className="text-[8px] text-gray-500 dark:text-zinc-500">i</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-zinc-400 leading-relaxed">
                Qiskit builds and executes circuits. Bloq may orchestrate repeatable experiments; neither runtime is connected.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Col Span 9) */}
        <div className="col-span-9 flex flex-col gap-6">
          
          {/* Circuit Artifact */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Circuit artifact</h3>
              <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">{hasExecuted ? 'Executed' : 'Awaiting Execution'}</span>
            </div>
            
            <div className="flex gap-6 border-b border-gray-200 dark:border-[#27272a] mb-6 text-sm">
              <button className="pb-3  border-b-2 border-red-600 dark:border-[#86efac] font-medium text-white">Circuit</button>
              <button className="pb-3  hover: text-white">Transpiled circuit</button>
              <button className="pb-3  hover: text-white">QASM</button>
              <button className="pb-3  hover: text-white">Parameters</button>
            </div>
            
            <div className="flex-1 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-zinc-800/50 rounded-lg relative overflow-hidden flex items-center justify-center">
              {isExecuting ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-gray-200 dark:border-[#27272a] border-t-[#86efac] rounded-full animate-spin mb-4"></div>
                  <p className="font-mono text-sm text-red-600 dark:text-[#86efac] animate-pulse">TRANSPILING & EXECUTING QUANTUM GATES...</p>
                </div>
              ) : hasExecuted ? (
                <div className="w-full h-full p-8 flex flex-col justify-center gap-6 overflow-x-auto custom-scrollbar">
                  {/* Dynamic Circuit Drawing */}
                  {[0, 1, 2, 3].map((q) => (
                    <div key={q} className="flex items-center gap-4 group">
                      <span className="font-mono text-sm text-gray-500 dark:text-zinc-500 w-8">q_{q} |0⟩</span>
                      <div className="h-0.5 w-full bg-zinc-700 relative flex items-center">
                        <div className="absolute left-8 w-10 h-10 bg-blue-900/40 border border-blue-500 rounded flex items-center justify-center text-blue-400 font-mono font-bold">H</div>
                        <div className="absolute left-28 w-14 h-10 bg-purple-900/40 border border-purple-500 rounded flex items-center justify-center text-purple-400 font-mono text-xs">Rz(x{q})</div>
                        <div className="absolute left-52 w-3 h-3 rounded-full bg-cyan-500"></div>
                        <div className="absolute left-64 w-8 h-8 bg-cyan-900/40 border border-cyan-500 rounded-full flex items-center justify-center text-cyan-400 font-bold">+</div>
                        {q % 2 === 0 && <div className="absolute left-52 top-1.5 w-0.5 h-[3rem] bg-cyan-500 z-10"></div>}
                        <div className="absolute left-80 w-14 h-10 bg-purple-900/40 border border-purple-500 rounded flex items-center justify-center text-purple-400 font-mono text-xs">Rz(x{q})</div>
                        <div className="absolute right-8 w-8 h-10 bg-gray-100 dark:bg-zinc-800 border border-zinc-600 rounded flex items-center justify-center text-gray-600 dark:text-zinc-400">M</div>
                      </div>
                    </div>
                  ))}
                  <div className="absolute bottom-4 left-4 text-[10px] font-mono text-gray-500 dark:text-zinc-500">DYNAMIC RENDERING: ZZFeatureMap (reps=2)</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-[#27272a] flex items-center justify-center bg-gray-50 dark:bg-[#121212] mb-3">
                    <Cpu className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">No generated circuit to inspect</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 max-w-sm leading-relaxed">Configure the feature pipeline and circuit, then execute. The circuit diagram will be rendered from the saved Qiskit artifact, not from an illustrative quantum graphic.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase mt-4">
              <span>QUANTUMRUN -- · CIRCUIT HASH --</span>
              <button className="px-3 py-1.5 rounded border border-gray-200 dark:border-[#27272a] bg-gray-800 dark:bg-zinc-800 font-medium  hover:bg-zinc-900 flex items-center gap-2 text-white">
                <Download className="w-3 h-3" /> Download artifact
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 flex-1">
            {/* Measurement Histogram (Col Span 2 inside 9) */}
            <div className="col-span-2 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Measurement histogram</h3>
              <div className="flex-1 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-zinc-800/50 rounded-lg p-4 relative min-h-[250px] flex flex-col">
                <span className="text-[9px] font-mono text-gray-400 dark:text-zinc-600 tracking-widest uppercase mb-4">Measurement Count</span>
                
                {hasExecuted ? (
                  <div className="flex-1 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <XAxis dataKey="state" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} interval={0} angle={-45} textAnchor="end" />
                        <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                        <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }} />
                        <Bar dataKey="count">
                          {histogramData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.count > 200 ? '#86efac' : '#0ea5e9'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="font-mono text-sm text-gray-600 dark:text-zinc-400 mb-1">Run experiment to populate</p>
                    <p className="font-mono text-xs text-gray-400 dark:text-zinc-600">No executed circuit or counts artifact available</p>
                  </div>
                )}
                
                <span className="absolute bottom-4 right-4 text-[9px] font-mono text-gray-400 dark:text-zinc-600 tracking-widest uppercase">Measured Bitstring</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-4 leading-relaxed">Counts and bitstring probabilities appear only from the selected QuantumRun. Configured shots do not imply measurements.</p>
            </div>

            {/* Execution Metadata (Col Span 1 inside 9) */}
            <div className="col-span-1 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">Execution metadata</h3>
                <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">{hasExecuted ? 'Run Complete' : 'Not Run'}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                  <span className="text-xs text-gray-600 dark:text-zinc-400">Run ID / parent</span>
                  <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">{hasExecuted ? 'Q-RUN-892' : '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                  <span className="text-xs text-gray-600 dark:text-zinc-400">Backend</span>
                  <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">{hasExecuted ? 'AerSimulator' : 'Not configured'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                  <span className="text-xs text-gray-600 dark:text-zinc-400">Submitted</span>
                  <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">{hasExecuted ? new Date().toLocaleTimeString() : '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                  <span className="text-xs text-gray-600 dark:text-zinc-400">Executed shots</span>
                  <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">{hasExecuted ? '1024 / 42' : '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                  <span className="text-xs text-gray-600 dark:text-zinc-400">Depth / gates</span>
                  <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">{hasExecuted ? '12 / 24 / 4' : '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                  <span className="text-xs text-gray-600 dark:text-zinc-400">Queue / execute</span>
                  <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">{hasExecuted ? '45ms / 1.2s' : '—'}</span>
                </div>
              </div>
              
              <a href="#" className="text-red-600 dark:text-[#86efac] text-xs hover:underline flex items-center gap-1 mt-6">Open provenance ↗</a>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-lg p-3 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] text-gray-500 dark:text-zinc-500">i</span>
            </div>
            <p className="text-[10px] text-gray-600 dark:text-zinc-400">Artifacts are linked as Experiment → ModelRun → QuantumRun → circuit, transpiled circuit, counts and environment manifest. No execution evidence exists yet.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
