import { useState } from 'react';
import { Zap, Loader2, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface GroqInsightProps {
  quantumRiskScore?: number;
  stage?: string;
  quantumFeatures?: Record<string, number>;
  txnId?: string;
  amountInr?: number;
}

export function GroqInsightPanel({
  quantumRiskScore,
  stage,
  quantumFeatures,
  txnId,
  amountInr,
}: GroqInsightProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchExplanation = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/groq/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txn_id: txnId ?? 'LIVE-DEMO',
          amount_inr: amountInr ?? 15000,
          quantum_risk_score: quantumRiskScore ?? 0.5,
          stage: stage ?? 'Stage 2',
          quantum_features: quantumFeatures ?? {},
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation ?? 'No explanation returned.');
    } catch (e) {
      console.error('Failed to fetch explanation:', e);
      setError('Backend unavailable — start unified_app.py first.');
    } finally {
      setLoading(false);
    }
  };

  const riskColor =
    (quantumRiskScore ?? 0) > 0.7
      ? 'text-red-600'
      : (quantumRiskScore ?? 0) > 0.4
      ? 'text-orange-500'
      : 'text-gray-900 dark:text-white';

  return (
    <div className="border-2 border-gray-900 dark:border-zinc-800 bg-white dark:bg-black p-5 space-y-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-1 border-2 border-gray-900 dark:border-zinc-800 bg-gray-900 dark:bg-white text-white dark:text-black rounded">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-['VT323'] text-gray-900 dark:text-white tracking-widest uppercase">SENTINEL AI INTELLIGENCE</h3>
            <p className="text-[10px] text-red-600 font-mono uppercase tracking-widest font-bold">QUANTUM NEURAL EXPLAINER</p>
          </div>
        </div>
        {quantumRiskScore !== undefined && (
          <div className={`font-['VT323'] text-2xl tracking-widest ${riskColor}`}>
            RISK: {(quantumRiskScore * 100).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Feature Pills */}
      {quantumFeatures && Object.keys(quantumFeatures).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {Object.entries(quantumFeatures).map(([k, v]) => (
            <span
              key={k}
              className="px-2 py-0.5 border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900 text-[10px] font-mono text-gray-700 dark:text-zinc-300 uppercase rounded"
            >
              {k}: <span className="font-bold text-red-600">{typeof v === 'number' ? v.toFixed(4) : v}</span>
            </span>
          ))}
        </div>
      )}

      {/* Explanation box */}
      <div className="min-h-[80px] bg-gray-50 dark:bg-zinc-950 border-2 border-gray-200 dark:border-zinc-800 p-4 font-mono text-xs leading-relaxed text-gray-800 dark:text-zinc-300 rounded">
        {loading ? (
          <div className="flex items-center gap-2 text-red-600 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="uppercase tracking-widest">GENERATING NARRATIVE...</span>
          </div>
        ) : error ? (
          <span className="text-red-600">{error}</span>
        ) : explanation ? (
          <span className="whitespace-pre-wrap">{explanation}</span>
        ) : (
          <span className="text-gray-400 dark:text-zinc-600 italic uppercase tracking-widest">
            Awaiting generation.
          </span>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={fetchExplanation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-red-600 hover:border-red-600 dark:hover:bg-red-600 dark:hover:border-red-600 dark:hover:text-white hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['VT323'] text-xl uppercase tracking-widest rounded"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> GENERATING...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> GENERATE EXPLANATION</>
        )}
      </button>
    </div>
  );
}
