import { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface LogEntry {
  timestamp: string;
  source: string;
  message: string;
  level?: string;
}

interface TerminalMeta {
  qiskit_version: string;
  groq_available?: boolean;
}

const FILTERS = ['ALL', 'QISKIT', 'GROQ', 'STATEVECTOR', 'QSVM', 'DATASET', 'SYSTEM'];

export function QuantumTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [filterIdx, setFilterIdx] = useState(0);
  const [meta, setMeta] = useState<TerminalMeta>({ qiskit_version: '1.x' });
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const loadLogs = () => {
      fetch(`${API_BASE_URL}/api/quantum/terminal-logs`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data) {
            if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
            setMeta({
              qiskit_version: data.qiskit_version ?? '1.x',
              groq_available: data.groq_available ?? false,
            });
          }
        })
        .catch(() => {});
    };
    loadLogs();
    const interval = setInterval(loadLogs, 1500);
    return () => { active = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (isAutoScroll && isExpanded) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded, isAutoScroll]);

  const filter = FILTERS[filterIdx];
  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter((l) => l.source.toUpperCase().includes(filter));

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const getSourceBadgeClass = (_source: string) => {
    return 'bg-black border border-zinc-700 text-white dark:border-zinc-500';
  };

  const getMessageColor = (source: string, level?: string) => {
    if (level === 'WARN') return 'text-red-600 font-bold';
    const s = source.toUpperCase();
    if (s.includes('GROQ'))       return 'text-red-600 font-bold';
    if (s.includes('QISKIT'))     return 'text-zinc-400';
    if (s.includes('STATEVECTOR')) return 'text-zinc-300';
    if (s.includes('QSVM') || s.includes('KERNEL')) return 'text-white font-bold';
    return 'text-zinc-500';
  };

  const lastGroqMsg = [...logs].reverse().find(l => l.source.toUpperCase().includes('GROQ'))?.message;

  return (
    <div className="fixed bottom-0 right-0 left-0 lg:left-64 z-50 border-t-2 border-black dark:border-zinc-800 bg-white dark:bg-black transition-all font-mono">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 bg-red-600 animate-pulse" />
            <Terminal className="w-4 h-4 text-black dark:text-white" />
            <span className="text-xs font-bold text-black dark:text-white tracking-widest uppercase">
              TERMINAL STREAM
            </span>
          </div>
          {/* Badges */}
          <span className="text-[10px] px-2 py-0.5 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shrink-0 hidden sm:inline uppercase">
            Qiskit {meta.qiskit_version}
          </span>
          <span className={`text-[10px] px-2 py-0.5 border shrink-0 hidden md:inline flex items-center gap-1 uppercase ${
            meta.groq_available
              ? 'border-red-600 bg-red-600 text-white font-bold'
              : 'border-black dark:border-zinc-700 text-black dark:text-zinc-500 bg-transparent'
          }`}>
            <Zap className="w-2.5 h-2.5 inline" />
            {meta.groq_available ? 'SENTINEL AI ONLINE' : 'SENTINEL AI OFFLINE'}
          </span>
          {/* Live preview of last SENTINEL-AI message */}
          {lastGroqMsg && (
            <span className="text-[10px] text-red-600 truncate max-w-[280px] hidden lg:inline font-bold uppercase tracking-widest">
              [ {lastGroqMsg.slice(0, 90)}{lastGroqMsg.length > 90 ? '…' : ''} ]
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setFilterIdx((filterIdx + 1) % FILTERS.length)}
            className="px-2 py-0.5 text-[10px] border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-red-600 hover:border-red-600 dark:hover:bg-red-600 dark:hover:border-red-600 dark:hover:text-white hover:text-white transition-colors uppercase font-bold tracking-widest"
          >
            {filter}
          </button>
          <button onClick={copyLogs} title="Copy Logs"
            className="p-1 border border-transparent hover:border-black dark:hover:border-white text-black dark:text-white transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setLogs([])} title="Clear"
            className="p-1 border border-transparent hover:border-black dark:hover:border-white text-black dark:text-white transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 border border-transparent hover:border-black dark:hover:border-white text-black dark:text-white transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Terminal */}
      {isExpanded && (
        <div className="h-72 bg-[#050507] p-4 overflow-y-auto font-mono text-xs space-y-1.5 custom-scrollbar border-t border-zinc-900">
          <div className="text-[10px] text-zinc-500 pb-2 border-b border-zinc-900 flex justify-between items-center">
            <span>// LIVE PYTHON BACKEND STREAM — Qiskit Statevector + Sentinel AI Engine</span>
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
              <span>{filteredLogs.length} events</span>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-10 text-center text-zinc-600 italic">
              {filter !== 'ALL'
                ? `No ${filter} logs yet. Try running a transaction or circuit.`
                : 'Awaiting backend events… trigger a transaction or circuit run above.'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 leading-relaxed rounded px-0.5 py-0.5 transition-colors ${
                  log.source.toUpperCase().includes('GROQ')
                    ? 'bg-violet-950/10 hover:bg-violet-950/20'
                    : 'hover:bg-zinc-900/30'
                }`}
              >
                <span className="text-zinc-500 text-[10px] shrink-0 pt-0.5 tabular-nums">{log.timestamp}</span>
                <span className={`px-1.5 rounded border text-[9px] font-bold shrink-0 uppercase tracking-wider ${getSourceBadgeClass(log.source)}`}>
                  {log.source}
                </span>
                <span className={`break-all leading-snug ${getMessageColor(log.source, log.level)}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
