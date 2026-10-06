import { useState } from 'react';
import { Play, Save, Layers, Grid } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function CircuitMeasurements() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [kernelMatrix, setKernelMatrix] = useState<number[][]>([]);
  const [alignmentScore, setAlignmentScore] = useState<number>(0.842);

  // Form parameters
  const [featureMap, setFeatureMap] = useState('ZZFeatureMap (Reps=2, Linear)');
  const [qubits, setQubits] = useState(4);
  const [shots, setShots] = useState(1024);

  const handleExecute = async () => {
    setIsExecuting(true);
    setHasExecuted(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/quantum/kernel-matrix?feature_map=${encodeURIComponent(featureMap)}&qubits=${qubits}&dim=8`);
      const data = await res.json();
      setKernelMatrix(data.matrix);
      setAlignmentScore(data.alignment_score);
      setHasExecuted(true);
    } catch (e) {
      console.error(e);
    }
    setIsExecuting(false);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">Q-UPI / Security Gateway</div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">Circuit & Measurements</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Configure Bloq & Qiskit feature maps, inspect kernel matrices, and execute aer simulation (FR-5 & FR-10).</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e] hover:bg-gray-800 dark:bg-zinc-800 text-sm font-medium flex items-center gap-2 transition text-white">
            <Save className="w-4 h-4" /> Save setup
          </button>
          <button 
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-4 py-2 rounded-lg border border-red-600 dark:border-[#86efac] text-white font-medium text-sm flex items-center gap-2 transition ${isExecuting ? 'bg-red-500 dark:bg-[#4ade80]/50 cursor-wait' : 'bg-red-600 dark:bg-[#86efac] hover:bg-red-500 dark:bg-[#4ade80] dark:text-gray-900'}`}
          >
            <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} /> {isExecuting ? 'Transpiling...' : 'Execute circuit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Setup Parameters (Col Span 4) */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Quantum Feature Map Setup
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-600 dark:text-zinc-400">Feature Map Architecture</label>
                <select 
                  value={featureMap}
                  onChange={(e) => setFeatureMap(e.target.value)}
                  className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
                >
                  <option value="ZZFeatureMap (Reps=2, Linear)">ZZFeatureMap (Reps=2, Linear)</option>
                  <option value="ZZFeatureMap (Reps=2, Full)">ZZFeatureMap (Reps=2, Full Entanglement)</option>
                  <option value="PauliFeatureMap">PauliFeatureMap (Z, ZZ)</option>
                  <option value="AngleEncoding">AngleEncoding Baseline</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 dark:text-zinc-400">Qubits</label>
                  <select 
                    value={qubits}
                    onChange={(e) => setQubits(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
                  >
                    <option value={2}>2 Qubits</option>
                    <option value={4}>4 Qubits</option>
                    <option value={6}>6 Qubits</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600 dark:text-zinc-400">Shots</label>
                  <select 
                    value={shots}
                    onChange={(e) => setShots(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
                  >
                    <option value={1024}>1024 Shots</option>
                    <option value={4096}>4096 Shots</option>
                    <option value={8192}>8192 Shots</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-600 dark:text-zinc-400">Execution Backend</label>
                <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white">
                  <option>Qiskit AerSimulator (Local GPU/CPU)</option>
                  <option>Bloq Hardware Emulator</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kernel-Target Alignment Score */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Grid className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Kernel-Target Alignment
            </h3>
            <p className="text-xs text-gray-500 mb-4">Measures mathematical correlation between quantum state fidelity and target labels.</p>
            <div className="p-4 bg-red-50 dark:bg-green-950/20 border border-red-200 dark:border-green-800 rounded-lg text-center">
              <span className="text-3xl font-bold font-mono text-red-600 dark:text-[#86efac]">
                {hasExecuted ? alignmentScore.toFixed(3) : '0.842'}
              </span>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono tracking-wider">Alignment Index (Optimal &gt; 0.75)</p>
            </div>
          </div>
        </div>

        {/* Dynamic Circuit Diagram & Kernel Heatmap (Col Span 8) */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Circuit Diagram & Gate Layout</h3>
              <span className="text-xs font-mono text-red-600 dark:text-[#86efac]">{featureMap}</span>
            </div>

            <div className="bg-gray-900 border border-zinc-800 rounded-lg p-6 overflow-x-auto">
              {Array.from({ length: qubits }).map((_, q) => (
                <div key={q} className="flex items-center gap-4 my-3 font-mono text-xs">
                  <span className="text-gray-400 w-12">q_{q} |0⟩</span>
                  <div className="flex-1 h-0.5 bg-zinc-700 relative flex items-center min-w-[400px]">
                    <div className="absolute left-4 px-2 py-1 bg-blue-900/80 border border-blue-400 text-blue-300 rounded text-[10px] font-bold">H</div>
                    <div className="absolute left-20 px-2 py-1 bg-purple-900/80 border border-purple-400 text-purple-300 rounded text-[10px]">Rz(x{q})</div>
                    <div className="absolute left-40 w-3 h-3 rounded-full bg-cyan-400"></div>
                    <div className="absolute left-52 w-6 h-6 border-2 border-cyan-400 rounded-full flex items-center justify-center text-cyan-300 text-xs font-bold">+</div>
                    {q % 2 === 0 && <div className="absolute left-40 top-1.5 w-0.5 h-[2.5rem] bg-cyan-400 z-10"></div>}
                    <div className="absolute left-68 px-2 py-1 bg-purple-900/80 border border-purple-400 text-purple-300 rounded text-[10px]">Rz(x{q}·x{q+1})</div>
                    <div className="absolute right-4 px-2 py-1 bg-zinc-800 border border-zinc-600 text-gray-300 rounded text-[10px]">M</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Kernel Matrix Heatmap */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quantum Kernel Heatmap Matrix \(K(x_i, x_j) = |\langle \phi(x_i)|\phi(x_j)\rangle|^2\)
            </h3>
            
            {hasExecuted && kernelMatrix.length > 0 ? (
              <div className="grid grid-cols-8 gap-1.5 p-2 bg-gray-950 rounded-lg">
                {kernelMatrix.map((row, i) =>
                  row.map((val, j) => {
                    const opacity = Math.max(0.15, val);
                    return (
                      <div
                        key={`${i}-${j}`}
                        title={`K(${i}, ${j}) = ${val.toFixed(3)}`}
                        className="h-10 rounded flex items-center justify-center text-[10px] font-mono transition-all hover:scale-110 cursor-pointer"
                        style={{
                          backgroundColor: i === j ? '#86efac' : `rgba(59, 130, 246, ${opacity})`,
                          color: i === j ? '#000' : '#fff'
                        }}
                      >
                        {val.toFixed(2)}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center text-gray-500 font-mono text-xs">
                Click "Execute circuit" to compute 8x8 Quantum Kernel Matrix in Qiskit Aer.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
