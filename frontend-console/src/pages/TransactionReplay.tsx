import React from 'react';
import { Upload, Play, Pause, Filter, List } from 'lucide-react';

export function TransactionReplay() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">Q-UPI / Security Gateway</div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">Transaction Replay</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Import a financial dataset, replay events and inspect each security decision.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-red-600 dark:bg-[#86efac] text-white font-medium text-sm flex items-center gap-2 hover:bg-red-500 dark:bg-[#4ade80] transition">
            <Upload className="w-4 h-4" /> Import dataset
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-500 font-mono">
        <div className="px-2 py-1 rounded border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212] flex items-center gap-2 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div> Replay not started
        </div>
        <span>Results appear only after a reproducible experiment. No live payment connection.</span>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Replay Source (Col Span 8) */}
        <div className="col-span-8 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Replay source</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Dataset Empty</span>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Financial transaction dataset</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Select or import dataset</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">CSV or Parquet - map source fields before replay</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Feature pipeline</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Not configured</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Versioned transformations shared with benchmarks</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Event ordering</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Source event time</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable setup default</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Replay speed</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>1x original timing</option>
              </select>
              <p className="text-[10px] text-gray-500 dark:text-zinc-500">Editable setup default</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-zinc-400">Inference model run</label>
              <select className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white appearance-none">
                <option>Select completed run</option>
              </select>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800/50 flex justify-between text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase">
            <span>VERSION -- · SHA-256 -- · MAPPED RECORDS --</span>
            <a href="#" className="text-red-600 dark:text-[#86efac] hover:underline flex items-center gap-1">Open Data Schema ↗</a>
          </div>
        </div>

        {/* Replay Control (Col Span 4) */}
        <div className="col-span-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Replay control</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Not Started</span>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Gateway connection</span>
              <span className="font-mono text-xs text-gray-500 dark:text-zinc-500">Disconnected</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50 pb-3">
              <span className="text-xs text-gray-600 dark:text-zinc-400">Policy version</span>
              <span className="font-mono text-xs text-gray-500 dark:text-zinc-500">No validated policy</span>
            </div>
          </div>
          
          <div className="flex gap-3 mb-4">
            <button className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e]  hover:bg-gray-800 dark:bg-zinc-800 text-sm font-medium  flex items-center justify-center gap-2 cursor-not-allowed text-white">
              <Play className="w-4 h-4" /> Start replay
            </button>
            <button className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-[#27272a] bg-gray-800 dark:bg-zinc-800 text-sm font-medium  flex items-center justify-center gap-2 cursor-not-allowed text-white">
              <Pause className="w-4 h-4" /> Pause
            </button>
          </div>
          <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-3 flex items-start gap-3">
            <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
               <span className="text-[8px] text-gray-500 dark:text-zinc-500">i</span>
            </div>
            <p className="text-[10px] text-gray-600 dark:text-zinc-400 leading-relaxed">
              Import and validate a dataset, select a completed model run and configure a policy before starting replay.
            </p>
          </div>
        </div>

        {/* Transaction Events (Col Span 8) */}
        <div className="col-span-8 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Transaction events</h3>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#27272a] mb-4 text-sm">
            <div className="flex gap-6">
              <button className="pb-3  border-b-2 border-red-600 dark:border-[#86efac] font-medium text-white">All events</button>
              <button className="pb-3  hover: text-white">Review queue</button>
              <button className="pb-3  hover: text-white">Blocked</button>
            </div>
            <button className="pb-3  hover: flex items-center gap-2 text-xs text-white">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>
          
          <table className="w-full text-sm mb-4">
            <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/50 uppercase">
              <tr>
                <th className="text-left font-normal pb-3">Transaction ID</th>
                <th className="text-left font-normal pb-3">Event time</th>
                <th className="text-left font-normal pb-3">Amount / unit</th>
                <th className="text-left font-normal pb-3">Risk</th>
                <th className="text-left font-normal pb-3">Model run</th>
                <th className="text-left font-normal pb-3">Policy decision</th>
                <th className="text-left font-normal pb-3">Timing / ms</th>
              </tr>
            </thead>
          </table>
          
          <div className="flex-1 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-zinc-800/50 rounded-lg flex flex-col items-center justify-center min-h-[250px] mb-4">
             <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-[#27272a] flex items-center justify-center bg-gray-50 dark:bg-[#121212] mb-3">
               <List className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
             </div>
             <p className="font-medium text-gray-900 dark:text-white mb-1">No dataset loaded</p>
             <p className="text-xs text-gray-500 dark:text-zinc-500 mb-4 text-center max-w-sm">Import a financial transaction dataset to begin. Events, model risk and policy decisions will appear here after replay starts.</p>
             <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e] hover:bg-gray-800 dark:bg-zinc-800  text-sm font-medium  flex items-center gap-2 hover:bg-gray-100 dark:bg-zinc-800 transition text-white">
               <Upload className="w-4 h-4" /> Select dataset
             </button>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-gray-400 dark:text-zinc-600 uppercase">
            <span>PROCESSED -- · REVIEW -- · BLOCKED --</span>
            <span>LAST EVENT --</span>
          </div>
        </div>

        {/* Event Inspector (Col Span 4) */}
        <div className="col-span-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Event inspector</h3>
            <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">No Selection</span>
          </div>
          <div className="flex gap-6 border-b border-gray-200 dark:border-[#27272a] mb-4 text-sm">
            <button className="pb-3  border-b-2 border-zinc-500 font-medium text-white">Features</button>
            <button className="pb-3  hover: text-white">Decision trace</button>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
            Select a replayed transaction to inspect the original event, derived features and decision explanation.
          </p>

          <table className="w-full text-xs">
            <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/50 uppercase">
              <tr>
                <th className="text-left font-normal pb-2">Feature group</th>
                <th className="text-left font-normal pb-2">Values</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-zinc-400 font-mono">
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">Payment context</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">Awaiting transaction</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">Amount / currency</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">Awaiting transaction</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">Entity / device tokens</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">Awaiting transaction</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">Temporal features</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">Pipeline not configured</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-[#27272a]/30">
                <td className="py-3 font-sans">Behavioral features</td>
                <td className="py-3 text-gray-400 dark:text-zinc-600">Pipeline not configured</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 space-y-2">
            <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Trace Links / Pending</p>
            <p className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">Dataset row → ModelRun → PolicyDecision</p>
            <p className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">ChannelRun → PolicyVersion → Artifact</p>
          </div>

          <div className="mt-auto pt-6">
            <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-3 flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                 <span className="text-[8px] text-gray-500 dark:text-zinc-500">i</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-zinc-400 leading-relaxed">
                Identifiers are tokenized. Raw account, device and payment credentials never appear in this workspace.
              </p>
            </div>
          </div>

        </div>

      </div>

      <div className="mt-4 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-lg p-4 flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] text-gray-500 dark:text-zinc-500">i</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-zinc-400">Replay is an offline analysis workflow, not a live payment switch. Event time, inference latency and decision latency are recorded separately when execution is connected.</p>
      </div>

      <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 dark:text-zinc-600 uppercase tracking-widest pt-4 pb-8">
        <div>RESEARCH PROTOTYPE · NO RECORDED RESULTS</div>
        <div>Dataset → Experiment → Artifacts → Policy decision</div>
      </div>
    </div>
  );
}
