import { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface LogEntry {
  timestamp: string;
  source: string;
  message: string;
  level?: string;
}

export function QuantumTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [qiskitVersion, setQiskitVersion] = useState<string>('1.4.6');
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchTerminalLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quantum/terminal-logs`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
        if (data.qiskit_version) {
          setQiskitVersion(data.qiskit_version);
        }
      }
    } catch {
      // Fallback local synthetic execution logs if backend is initializing
    }
  };

  useEffect(() => {
    fetchTerminalLogs();
    const interval = setInterval(fetchTerminalLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAutoScroll && isExpanded) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded, isAutoScroll]);

  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter((l) => l.source.toUpperCase().includes(filter));

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const getSourceBadgeClass = (source: string) => {
    const s = source.toUpperCase();
    if (s.includes('QISKIT')) return 'bg-cyan-950/80 border-cyan-700 text-cyan-300';
    if (s.includes('STATEVECTOR')) return 'bg-purple-950/80 border-purple-700 text-purple-300';
    if (s.includes('QSVM') || s.includes('KERNEL')) return 'bg-emerald-950/80 border-emerald-700 text-emerald-300';
    if (s.includes('QKD')) return 'bg-amber-950/80 border-amber-700 text-amber-300';
    return 'bg-zinc-800 border-zinc-600 text-zinc-300';
  };

  return (
    <div className="fixed bottom-0 right-0 left-0 lg:left-64 z-50 border-t border-zinc-800 bg-[#09090b]/95 backdrop-blur-md transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 select-none border-b border-zinc-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-white tracking-wide">
              QUANTUM BACKEND RAW STDOUT TERMINAL
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/80 bg-emerald-950/40 text-emerald-300">
            Qiskit {qiskitVersion} (Statevector Kernel)
          </span>
          {logs.length > 0 && (
            <span className="text-[10px] font-mono text-zinc-400 hidden md:inline">
              Latest: <span className="text-zinc-200">{logs[logs.length - 1]?.message}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setFilter(filter === 'ALL' ? 'QISKIT' : filter === 'QISKIT' ? 'STATEVECTOR' : filter === 'STATEVECTOR' ? 'QSVM' : 'ALL')}
            className="px-2 py-0.5 rounded text-[10px] font-mono border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
          >
            Filter: {filter}
          </button>
          <button
            onClick={copyLogs}
            title="Copy Terminal Logs"
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLogs([])}
            title="Clear Logs"
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-300"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Terminal Area */}
      {isExpanded && (
        <div className="h-64 bg-[#050507] p-4 overflow-y-auto font-mono text-xs space-y-1.5 custom-scrollbar border-t border-zinc-900">
          <div className="text-[10px] text-zinc-500 pb-2 border-b border-zinc-900 flex justify-between items-center">
            <span>// LIVE QISKIT PYTHON BACKEND STREAM — PORT 8002</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoScroll}
                  onChange={(e) => setIsAutoScroll(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 w-3 h-3"
                />
                <span className="text-[10px] text-zinc-400">Auto-scroll</span>
              </label>
              <span>{filteredLogs.length} events logged</span>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 italic">
              Awaiting live Qiskit statevector execution logs... Trigger a transaction scoring or circuit run above.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 leading-relaxed hover:bg-zinc-900/30 p-0.5 rounded">
                <span className="text-zinc-500 text-[10px] shrink-0 pt-0.5">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold shrink-0 ${getSourceBadgeClass(log.source)}`}>
                  {log.source}
                </span>
                <span className="text-zinc-200 break-all">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
