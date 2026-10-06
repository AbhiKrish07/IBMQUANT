import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw, Network } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function TransactionReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [networkGraph, setNetworkGraph] = useState<any>(null);

  // Filters
  const [stageFilter, setStageFilter] = useState('all');
  const [typologyFilter, setTypologyFilter] = useState('all');

  const fetchStreamData = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/stream?stage_filter=${stageFilter}&typology=${typologyFilter}&limit=25`
      );
      const data = await res.json();
      setTransactions(data.transactions);
      setNetworkGraph(data.network_graph);
      if (data.transactions.length > 0) {
        setSelectedTx((prev: any) => prev || data.transactions[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [stageFilter, typologyFilter]);

  useEffect(() => {
    fetchStreamData();
  }, [fetchStreamData]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        fetchStreamData();
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, fetchStreamData]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">
            Q-UPI / Security Gateway
          </div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">
            Transaction Replay Stream
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Replay synthetic UPI transactions through the 3-stage tiered pipeline in real-time (FR-8 & FR-11).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg text-white font-medium text-sm flex items-center gap-2 transition ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-red-600 dark:bg-[#86efac] dark:text-gray-900 hover:bg-red-500'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause Replay' : 'Start Live Replay'}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Stage Filter</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Stages (Full Traffic)</option>
              <option value="stage1">Stage 1 Only (Classical Fast-Path)</option>
              <option value="stage2">Stage 2 Only (Quantum Gray Zone)</option>
              <option value="flagged">Flagged Fraud Only</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-zinc-400">Fraud Typology Filter</label>
            <select
              value={typologyFilter}
              onChange={(e) => setTypologyFilter(e.target.value)}
              className="w-full bg-white dark:bg-[#0c0c0c] border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All Fraud Typologies</option>
              <option value="mule ring">Mule Ring (Fan-In/Out)</option>
              <option value="velocity burst">Velocity Burst</option>
              <option value="sim swap">SIM Swap Takeover</option>
              <option value="impossible travel">Impossible Travel</option>
            </select>
          </div>

          <div className="space-y-2 flex items-end">
            <button
              onClick={fetchStreamData}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e] hover:bg-gray-800 text-sm font-medium text-white flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Fetch Latest Stream
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Transaction Stream Table (Col Span 8) */}
        <div className="col-span-8 border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Replayed Event Stream</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-[10px] text-gray-500 uppercase border-b border-gray-200 dark:border-[#27272a]">
                <tr>
                  <th className="text-left pb-2">Txn ID</th>
                  <th className="text-left pb-2">Payer → Payee</th>
                  <th className="text-left pb-2">Amount</th>
                  <th className="text-left pb-2">Stage 1</th>
                  <th className="text-left pb-2">Stage 2 (Quantum)</th>
                  <th className="text-left pb-2">Decision</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 dark:text-zinc-300">
                {transactions.map((tx) => (
                  <tr
                    key={tx.txn_id}
                    onClick={() => setSelectedTx(tx)}
                    className={`border-b border-gray-100 dark:border-zinc-800/50 cursor-pointer hover:bg-red-50/30 dark:hover:bg-zinc-800/50 transition ${
                      selectedTx?.txn_id === tx.txn_id ? 'bg-red-50 dark:bg-green-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 font-sans">{tx.txn_id}</td>
                    <td className="py-2.5 text-gray-500">{tx.payer_id.split('@')[0]} → {tx.payee_id.split('@')[0]}</td>
                    <td className="py-2.5">₹{tx.amount_inr}</td>
                    <td className="py-2.5">{tx.s1_score}</td>
                    <td className="py-2.5 text-red-600 dark:text-[#86efac]">
                      {tx.s2_score ? `${tx.s2_score}` : '— (Bypassed)'}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.decision.includes('FLAGGED') || tx.decision.includes('BLOCKED')
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        }`}
                      >
                        {tx.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Inspector & Linked Accounts Graph (Col Span 4) */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Event Inspector</h3>
            {selectedTx ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="text-gray-200">{selectedTx.txn_id}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Typology:</span>
                  <span className="text-amber-400">{selectedTx.fraud_type}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Velocity (1h):</span>
                  <span>{selectedTx.velocity_1h} txns</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Implied Speed:</span>
                  <span>{selectedTx.geo_speed_kmh} km/h</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-gray-400">Stage Used:</span>
                  <span className="text-red-600 dark:text-[#86efac]">{selectedTx.stage_used}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Select a transaction from the table to inspect details.</p>
            )}
          </div>

          {/* Linked Account Ring Graph Visualizer */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Network className="w-4 h-4 text-red-600 dark:text-[#86efac]" /> Payee Network Ring Graph
            </h3>
            <p className="text-[10px] text-gray-500 mb-4">Visualizes payer-payee cluster connections for mule detection.</p>
            <div className="h-44 bg-gray-950 border border-zinc-800 rounded-lg p-4 relative flex items-center justify-center">
              {networkGraph?.nodes ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-red-500 bg-red-950/50 flex items-center justify-center text-[10px] font-mono text-red-300 font-bold">
                    Collector
                  </div>
                  {networkGraph.nodes.slice(0, 6).map((node: any, i: number) => {
                    const angle = (i * 360) / 6;
                    const rad = (angle * Math.PI) / 180;
                    const x = Math.cos(rad) * 60;
                    const y = Math.sin(rad) * 60;
                    return (
                      <div
                        key={node.id}
                        className="absolute w-8 h-8 rounded-full bg-blue-900/80 border border-blue-400 flex items-center justify-center text-[8px] font-mono text-blue-200"
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                      >
                        P{i}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-mono">No network graph loaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
