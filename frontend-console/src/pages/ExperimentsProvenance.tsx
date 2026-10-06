import React from 'react';
import { Upload, Download, Search, FileJson } from 'lucide-react';

export function ExperimentsProvenance() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">Q-UPI / Security Gateway</div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">Experiments & Provenance</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Track runs, immutable artifacts and the configuration needed to reproduce each experiment.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e]  hover:bg-gray-800 dark:bg-zinc-800 text-sm font-medium  flex items-center gap-2 hover:bg-gray-100 dark:bg-zinc-800 transition text-white">
            <Upload className="w-4 h-4" /> Import run bundle
          </button>
          <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#27272a] bg-gray-800 dark:bg-zinc-800 text-sm font-medium  flex items-center gap-2 hover:bg-zinc-900 transition text-white">
            <Download className="w-4 h-4" /> Export manifest
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-500 font-mono">
        <div className="px-2 py-1 rounded border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212] flex items-center gap-2 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div> Registry Empty
        </div>
        <span>Results appear only after a reproducible experiment. No live payment connection.</span>
      </div>

      {/* Experiment Registry */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Experiment registry</h3>
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500 dark:text-zinc-500" />
              <input type="text" placeholder="Search ID, dataset or artifact..." className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 pl-9 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-zinc-600" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Experiment type</label>
            <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
              <option>All types</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Run status</label>
            <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
              <option>All statuses</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Backend environment</label>
            <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
              <option>All environments</option>
            </select>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-200 dark:border-[#27272a] uppercase bg-white dark:bg-[#0c0c0c]/50">
            <tr>
              <th className="text-left font-normal py-3 px-4">Experiment ID</th>
              <th className="text-left font-normal py-3 px-4">Type</th>
              <th className="text-left font-normal py-3 px-4">Dataset version</th>
              <th className="text-left font-normal py-3 px-4">Linked runs</th>
              <th className="text-left font-normal py-3 px-4">Backend</th>
              <th className="text-left font-normal py-3 px-4">Started at</th>
              <th className="text-left font-normal py-3 px-4">Status</th>
              <th className="text-left font-normal py-3 px-4">Manifest</th>
            </tr>
          </thead>
        </table>
        
        <div className="flex-1 bg-white dark:bg-[#0c0c0c] border-x border-b border-gray-100 dark:border-zinc-800/50 rounded-b-lg flex flex-col items-center justify-center py-16 mb-4">
           <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-[#27272a] flex items-center justify-center bg-gray-50 dark:bg-[#121212] mb-3">
             <FileJson className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
           </div>
           <p className="font-medium text-gray-900 dark:text-white mb-1">No experiments recorded</p>
           <p className="text-xs text-gray-500 dark:text-zinc-500 text-center max-w-sm">Save a setup and execute from Model Benchmarks, Circuit & Measurements or QKD Channel Lab. Completed and failed runs retain their configuration and artifacts here.</p>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-gray-400 dark:text-zinc-600 uppercase tracking-widest mt-4">
          <span>RECORDED RUNS -- · NO RUNTIME CONNECTED</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Reproducibility Manifest Template (Col Span 8) */}
        <div className="col-span-8 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Reproducibility manifest template</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Ungenerated</span>
          </div>
          
          <div className="flex gap-6 border-b border-gray-200 dark:border-[#27272a] mb-4 text-sm">
            <button className="pb-3  border-b-2 border-red-600 dark:border-[#86efac] font-medium text-white">Manifest fields</button>
            <button className="pb-3  hover: text-white">Artifacts</button>
            <button className="pb-3  hover: text-white">Environment</button>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6">Template only. No dataset hash, run identifier, package version or performance result has been recorded.</p>

          <table className="w-full text-xs">
            <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/50 uppercase">
              <tr>
                <th className="text-left font-normal pb-2">Manifest field group</th>
                <th className="text-left font-normal pb-2">Expected source</th>
                <th className="text-left font-normal pb-2">Recorded value</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-zinc-400 font-mono">
              {[
                ['dataset.id / version / sha256', 'Imported Dataset'],
                ['features.pipeline / columns / hash', 'Feature configuration'],
                ['split.indices / method / seed', 'Evaluation contract'],
                ['model.family / params / code_hash', 'ModelRun configuration'],
                ['circuit.map / ansatz / parameters', 'QuantumRun configuration'],
                ['backend.type / name / shots / seed', 'Execution target'],
                ['environment.os / cpu / memory', 'Connected runtime'],
                ['dependencies.lock / versions', 'Qiskit · Bloq · ML packages'],
                ['timings.started / ended / scopes', 'Execution timestamps'],
                ['metrics / evaluation_definition', 'Recorded results'],
                ['artifacts.ids / types / checksums', 'Saved artifact registry'],
                ['links.model / quantum / channel', 'Related run identifiers'],
                ['links.policy_version / decisions', 'Policy lineage']
              ].map(([field, source]) => (
                <tr key={field} className="border-b border-gray-200 dark:border-[#27272a]/30">
                  <td className="py-3 font-mono">{field}</td>
                  <td className="py-3 font-sans text-gray-500 dark:text-zinc-500">{source}</td>
                  <td className="py-3 text-gray-400 dark:text-zinc-600">—</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border-t border-gray-100 dark:border-zinc-800/50 pt-4">
            <span>MANIFEST ID -- · CHECKSUM --</span>
            <button className="px-3 py-1.5 rounded border border-gray-200 dark:border-[#27272a] bg-gray-800 dark:bg-zinc-800 font-medium  hover:bg-zinc-900 text-white">Export JSON</button>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-6">
          {/* Selected Experiment */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Selected experiment</h3>
              <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">No Selection</span>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                <span className="text-xs text-gray-600 dark:text-zinc-400">Experiment / parent</span>
                <span className="font-mono text-xs text-gray-400 dark:text-zinc-600">—</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                <span className="text-xs text-gray-600 dark:text-zinc-400">Run status</span>
                <span className="font-mono text-xs text-gray-600 dark:text-zinc-400">Not run</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
                <span className="text-xs text-gray-600 dark:text-zinc-400">Manifest state</span>
                <span className="font-mono text-xs text-gray-600 dark:text-zinc-400">Not generated</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-500">Select a recorded experiment to inspect configuration, execution logs and all linked artifacts.</p>
          </div>

          {/* Artifact relationships */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Artifact relationships</h3>
            <table className="w-full text-xs mb-4">
              <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/50 uppercase">
                <tr>
                  <th className="text-left font-normal pb-2">Parent record</th>
                  <th className="text-left font-normal pb-2">Linked artifacts</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-zinc-400 font-mono">
                {[
                  ['Dataset', 'Import map / feature pipeline'],
                  ['ModelRun', 'Predictions / metrics / ROC'],
                  ['QuantumRun', 'Circuit / QASM / counts'],
                  ['ChannelRun', 'Sifting / QBER / key decision'],
                  ['PolicyDecision', 'Matched rules / explanation']
                ].map(([parent, linked]) => (
                  <tr key={parent} className="border-b border-gray-200 dark:border-[#27272a]/30">
                    <td className="py-3 text-gray-800 dark:text-zinc-300">{parent}</td>
                    <td className="py-3 font-sans text-gray-500 dark:text-zinc-500">{linked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 leading-relaxed">Relationships shown are schema intent, not existing artifacts. Each artifact stores a checksum and creating run.</p>
          </div>

          {/* Environment requirements */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Environment requirements</h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">Declare Qiskit for circuit construction and execution. Configure Bloq for experiment orchestration, benchmarking and repeatability.</p>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3 mb-4">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Runtime / dependency lock</span>
              <span className="font-mono text-xs text-gray-600 dark:text-zinc-400">Not configured</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 leading-relaxed">Capture simulator versus hardware, package locks, code revision and machine resources for every run.</p>
          </div>
        </div>

      </div>

      <div className="mt-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-lg p-4 flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] text-gray-500 dark:text-zinc-500">i</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-zinc-400">Export is disabled until a manifest exists. Exported bundles include non-sensitive configuration and artifact checksums, never credentials, raw account identifiers or secret key material.</p>
      </div>

      <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 dark:text-zinc-600 uppercase tracking-widest pt-4 pb-8">
        <div>RESEARCH PROTOTYPE · NO RECORDED RESULTS</div>
        <div>Dataset → Experiment → Artifacts → Policy decision</div>
      </div>
    </div>
  );
}
