import React, { useState } from 'react';
import { Play, Download, Loader2 } from 'lucide-react';

export function ModelBenchmarks() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState(null);

  const runBenchmark = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('http://localhost:32000/api/qml/benchmark');
      const data = await res.json();
      if (data.status === 'success') {
        setResults(data.models);
      }
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
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">Model Benchmarks</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Compare classical ML, QSVM and QNN under one reproducible evaluation contract.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e]  hover:bg-gray-800 dark:bg-zinc-800 text-sm font-medium transition text-white">Save setup</button>
          <button 
            onClick={runBenchmark}
            disabled={isExecuting}
            className={`px-4 py-2 rounded-lg border border-red-600 dark:border-[#86efac] bg-red-600 dark:bg-[#86efac] hover:bg-red-700 dark:hover:bg-[#4ade80] text-sm font-medium flex items-center gap-2 text-white dark:text-gray-900 transition ${isExecuting ? 'opacity-75 cursor-wait' : ''}`}
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
            {isExecuting ? 'Benchmarking...' : 'Run comparison'}
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-500 font-mono">
        <div className={`px-2 py-1 rounded border flex items-center gap-2 uppercase ${results ? 'border-red-200 dark:border-green-900 bg-red-50 dark:bg-green-900/30 text-red-600 dark:text-green-400' : 'border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${results ? 'bg-red-500 dark:bg-green-500' : 'bg-zinc-500'}`}></div> 
          {results ? 'EXPERIMENT COMPLETED' : 'EXPERIMENT NOT RUN'}
        </div>
        <span>Results appear only after a reproducible experiment. No live payment connection.</span>
      </div>

      {/* Shared Evaluation Contract */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white">Shared evaluation contract</h3>
          <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Setup Draft</span>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Dataset / version</label>
            <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-zinc-600 appearance-none">
              <option>Select dataset</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Feature pipeline / hash</label>
            <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-zinc-600 appearance-none">
              <option>Not configured</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Target label / positive class</label>
            <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-zinc-600 appearance-none">
              <option>Map label field</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Split / random seed</label>
            <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-zinc-600 appearance-none">
              <option>80:20 stratified / 42</option>
            </select>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-1">Editable example - not applied</p>
          </div>
        </div>
        <div className="mt-6 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-4 flex items-start gap-3">
          <div className="w-4 h-4 rounded-full border border-red-200 dark:border-[#166534] bg-red-50 dark:bg-[#052e16]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-[#4ade80]"></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            Every model must use the same dataset, feature columns, split indices, seed and evaluation metrics. Fit preprocessing on the training set only; lock the contract before comparing results.
          </p>
        </div>
        <div className="mt-4 flex justify-between text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase">
          <span>DATASET HASH -- · FEATURE HASH -- · SPLIT HASH --</span>
          <a href="#" className="text-red-600 dark:text-[#86efac] hover:underline flex items-center gap-1">Configure shared features ↗</a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Classical Baseline */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Classical baseline</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Not Trained</span>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-2">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Estimator</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>SVM · RBF kernel</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable candidate</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Parameter search</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Configure search space</option>
              </select>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-4">Record kernel parameters, class weighting, preprocessing and fit environment in ModelRun.</p>
        </div>

        {/* Quantum Candidates */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quantum candidates</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Not Trained</span>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-2">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Candidate family</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>QSVM + QNN</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable experiment candidates</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Feature map / ansatz</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Select configuration</option>
              </select>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-4">Qiskit circuit execution · Bloq experiment and benchmark configuration · backend not connected.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Metrics comparison */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Metrics comparison</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">No Results</span>
          </div>
          
          <table className="w-full text-sm">
            <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-200 dark:border-[#27272a] uppercase">
              <tr>
                <th className="text-left font-normal pb-3">Evaluation Metric</th>
                <th className="text-left font-normal pb-3">Classical ML</th>
                <th className="text-left font-normal pb-3">QSVM</th>
                <th className="text-left font-normal pb-3">QNN</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-zinc-300 font-mono">
              {['Accuracy', 'Precision', 'Recall', 'F1-score', 'ROC-AUC'].map(metric => {
                const getVal = (idx) => {
                  if (!results || !results[idx]) return '—';
                  const m = metric.toLowerCase().replace('-', '_');
                  return (results[idx][m] * 100).toFixed(2) + '%';
                };
                return (
                  <tr key={metric} className="border-b border-gray-100 dark:border-zinc-800/50">
                    <td className="py-4 font-sans text-xs">{metric}</td>
                    <td className="py-4 text-gray-800 dark:text-zinc-300">{getVal(0)}</td>
                    <td className="py-4 text-gray-800 dark:text-zinc-300">{getVal(1)}</td>
                    <td className="py-4 text-gray-800 dark:text-zinc-300">{getVal(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-6 leading-relaxed">
            Run experiment to populate. Precision, recall and F1 use the mapped positive class; averaging and score thresholds must be saved in the evaluation contract.
          </p>
          <div className="mt-4 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-4 flex items-center gap-3">
             <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
               <span className="text-[8px]">i</span>
             </div>
             <p className="text-[11px] text-gray-600 dark:text-zinc-400">No winner or quantum advantage is established. Simulator wall time includes classical simulation overhead and is not hardware performance.</p>
          </div>
        </div>

        {/* ROC Comparison */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">ROC comparison</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Not Run</span>
          </div>
          <div className="flex gap-6 border-b border-gray-200 dark:border-[#27272a] mb-6 text-sm">
            <button className="pb-3  border-b-2 border-red-600 dark:border-[#86efac] text-white">ROC curves</button>
            <button className="pb-3  hover: text-white">Confusion matrices</button>
          </div>
          
          <div className="flex-1 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-zinc-800/50 rounded-lg p-6 flex flex-col relative min-h-[300px]">
            <span className="absolute top-4 left-4 text-[9px] font-mono text-gray-400 dark:text-zinc-600 tracking-widest uppercase">True Positive Rate</span>
            <div className="border-l border-b border-gray-200 dark:border-[#27272a] flex-1 flex flex-col items-center justify-center text-center mt-6 ml-4">
              <p className="font-mono text-sm text-gray-600 dark:text-zinc-400 mb-1">Run experiment to populate</p>
              <p className="font-mono text-xs text-gray-400 dark:text-zinc-600">No predictions or ROC traces available</p>
            </div>
            <span className="absolute bottom-4 right-4 text-[9px] font-mono text-gray-400 dark:text-zinc-600 tracking-widest uppercase">False Positive Rate / 0 → 1</span>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-6 leading-relaxed">
            Classical ML / QSVM / QNN traces require test-set predictions and continuous scores from the same held-out split.
          </p>
          <div className="mt-4 text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase">
            TEST SPLIT -- · PREDICTIONS ARTIFACT --
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Latency breakdown */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Latency breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Preprocessing / training</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">— / — ms</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Inference / circuit execution</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">— / — ms</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Queue / transpilation</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">— / — ms</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-6">Record per-model timing scope, repetitions and summary statistics. Run experiment to populate.</p>
        </div>

        {/* Resource requirements */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Resource requirements</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">CPU / peak memory</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">— / —</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Qubits / depth / gates</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">— / — / —</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Shots / device allocation</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">— / —</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-6">Measured usage is separate from configured shot budgets. Compare on a declared environment.</p>
        </div>

        {/* Reproducibility */}
        <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Reproducibility</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Run / manifest</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">Not generated</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Environment lock</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">Not configured</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Execution status</span>
              <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">Not run</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e]  hover:bg-gray-800 dark:bg-zinc-800 text-xs font-medium  text-white">View provenance</button>
            <button className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-[#27272a] bg-gray-800 dark:bg-zinc-800 text-xs font-medium  text-white">Export</button>
          </div>
        </div>
      </div>
    </div>
  );
}
