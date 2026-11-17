import React, { useState } from 'react';
import {
  Zap,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';

interface ChaosTestDrawerProps {
  submissionId: number;
  initialResults?: any;
  onChaosCompleted?: (results: any) => void;
}

export const ChaosTestDrawer: React.FC<ChaosTestDrawerProps> = ({
  submissionId,
  initialResults,
  onChaosCompleted,
}) => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(initialResults || null);
  const [error, setError] = useState<string | null>(null);

  const handleRunChaos = async () => {
    try {
      setRunning(true);
      setError(null);
      const res = await api.submissions.runChaosTest(submissionId);
      setResults(res.chaos_results);
      if (onChaosCompleted) onChaosCompleted(res.chaos_results);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute Chaos Monkey stress testing');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-900/60 text-white shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Adversarial Mutation Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900 text-amber-200 border border-amber-700 font-bold">
                Chaos Monkey v2.0
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Production Stress & Defensive Resilience Verification
            </h3>
          </div>
        </div>

        <button
          onClick={handleRunChaos}
          disabled={running}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Unleashing Chaos Mutations...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{results ? 'Re-Run Chaos Test' : 'Unleash Chaos Monkey'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {results ? (
        <div className="space-y-3 animate-fadeIn">
          {/* Summary Metric */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  results.status === 'RESILIENT'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                {results.status === 'RESILIENT' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                    Resilience Verdict
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      results.status === 'RESILIENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {results.status} ({results.resilience_score}%)
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5 font-medium">{results.verdict}</p>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-[10px] text-slate-400 block uppercase">Mutations Passed</span>
              <span className="font-bold text-emerald-600 text-base">
                {results.passed_mutations} / {results.total_mutations}
              </span>
            </div>
          </div>

          {/* Mutation Cards */}
          <div className="grid grid-cols-1 gap-2.5">
            {results.mutations?.map((m: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {m.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white text-slate-600 border border-slate-200">
                      ~{m.duration_ms}ms
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] pl-6">{m.description}</p>
                  <p className="text-emerald-800 font-mono text-[11px] pl-6 bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                    {m.detail}
                  </p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    m.passed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center text-slate-600">
          <Zap className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
          <h4 className="text-xs font-bold text-slate-800">
            Adversarial Stress Testing Ready
          </h4>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1">
            Hit <strong>Unleash Chaos Monkey</strong> to stress test your accepted code against 50 concurrent request bursts,
            boundary null payloads, and clock jitter to guarantee zero regression risk.
          </p>
        </div>
      )}
    </div>
  );
};
