import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  AlertCircle,
  X,
  Award,
  Send,
  Loader2,
} from 'lucide-react';
import { api, PostMortem } from '../api/client';

interface PostMortemModalProps {
  challengeId: number;
  challengeTitle: string;
  submissionId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (pm: PostMortem) => void;
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({
  challengeId,
  challengeTitle,
  submissionId,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [rootCause, setRootCause] = useState('');
  const [prevention, setPrevention] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostMortem | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rootCause.trim().length < 15 || prevention.trim().length < 15) {
      setError('Please provide at least 15 characters for both root cause and preventative measures.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.postMortem.submit(challengeId, {
        submission_id: submissionId,
        root_cause_analysis: rootCause,
        preventative_measures: prevention,
      });

      setResult(res.post_mortem);
      if (onSaved) onSaved(res.post_mortem);
    } catch (err: any) {
      setError(err?.message || 'Failed to evaluate post-mortem');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-white border border-white/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200 block font-bold">
                Incident Response Studio
              </span>
              <h2 className="text-base font-bold text-white">
                Draft Production Post-Mortem (RCA)
              </h2>
              <span className="text-[11px] text-blue-200 block truncate max-w-md">
                Quest: {challengeTitle}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              In production environments, fixing the bug is only step one. Top engineering teams mandate an{' '}
              <strong>Incident Post-Mortem</strong> to evaluate defect triggers, prevent regressions, and improve telemetry.
              Our AI Evaluator grades your RCA across Root Cause Clarity, Remediation Depth, and Communication.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>1. Root Cause Analysis (What triggered the defect?)</span>
                  <span className="text-[11px] font-mono text-slate-400 font-normal">Min 15 chars</span>
                </label>
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="e.g. The double discount occurred because recalculate() mutated this.subtotal by subtracting the discount, so upon subsequent cart reloads, the calculation subtracted the discount a second time from an already discounted balance."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>2. Preventative Measures & Long-Term Safeguards</span>
                  <span className="text-[11px] font-mono text-slate-400 font-normal">Min 15 chars</span>
                </label>
                <textarea
                  value={prevention}
                  onChange={(e) => setPrevention(e.target.value)}
                  placeholder="e.g. Maintain this.subtotal as the pure sum of raw item prices (invariant) and make discount computation idempotent. Add CI/CD regression test asserting identical total across multiple reload cycles."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating via AI Agent...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit & Grade Post-Mortem
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {/* Score Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block font-bold">
                    Pedagogical Evaluation Score
                  </span>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-300" />
                    <span>{result.score} / 100</span>
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Verified workforce post-mortem appended to your candidate dossier.
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white text-emerald-800 shadow-sm">
                    {result.score >= 80 ? 'EXEMPLARY RCA' : 'PROFICIENT RCA'}
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              {result.feedback && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Root Cause</span>
                    <span className="text-sm font-bold text-blue-600 font-mono">
                      {result.feedback.root_cause_score || 30} / 35
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Remediation</span>
                    <span className="text-sm font-bold text-emerald-600 font-mono">
                      {result.feedback.remediation_score || 28} / 35
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Communication</span>
                    <span className="text-sm font-bold text-indigo-600 font-mono">
                      {result.feedback.communication_score || 25} / 30
                    </span>
                  </div>
                </div>
              )}

              {/* Strengths & Recommendations */}
              {result.feedback?.summary && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">Evaluator Feedback:</span>
                  <p>{result.feedback.summary}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
                >
                  Close & View Dossier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
