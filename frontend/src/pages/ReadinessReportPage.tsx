import React, { useEffect, useState } from 'react';
import { api, ReadinessReport } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  Share2, 
  Printer, 
  ShieldCheck, 
  Copy, 
  Check, 
  Trash2, 
  Calendar, 
  Sparkles
} from 'lucide-react';

export const ReadinessReportPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReadinessReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [allowDiagnostics, setAllowDiagnostics] = useState(true);
  const [allowCodeSamples, setAllowCodeSamples] = useState(false);
  const [expiresDays, setExpiresDays] = useState(30);
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.list();
      setReports(res.reports);
      if (res.reports.length > 0) {
        setSelectedReport(res.reports[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const res = await api.reports.generate();
      setReports([res.report, ...reports]);
      setSelectedReport(res.report);
    } catch (err: any) {
      alert(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateShareToken = async () => {
    if (!selectedReport) return;
    try {
      const res = await api.reports.createShare(selectedReport.report_uuid, {
        allow_diagnostics: allowDiagnostics,
        allow_code_samples: allowCodeSamples,
        expires_days: expiresDays,
      });

      const fullUrl = `${window.location.origin}/report/shared/${res.share_token}`;
      setGeneratedShareUrl(fullUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to create share token');
    }
  };

  const handleRevokeShareToken = async (token: string) => {
    if (!confirm('Are you sure you want to revoke this share link? Anyone with the link will immediately lose access.')) return;
    try {
      await api.reports.revokeShare(token);
      alert('Share link has been revoked.');
      setGeneratedShareUrl(null);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke token');
    }
  };

  const handleCopyUrl = () => {
    if (generatedShareUrl) {
      navigator.clipboard.writeText(generatedShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 bg-obsidian-850 rounded-xl border border-white/[0.08] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Workforce Readiness Dossier</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirically verified candidate dossiers with consent-controlled cryptographic share tokens.
          </p>
        </div>

        {error && (
          <div className="w-full p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold text-xs shadow-glow-sm transition-all"
        >
          {generating ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Generate Fresh Dossier</span>
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="quest-card p-12 text-center space-y-3">
          <Award className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Reports Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Generate Fresh Dossier" above to compile your stored coding assessment evidence into a verified report.
          </p>
        </div>
      ) : selectedReport ? (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-obsidian-850 p-3 rounded-xl border border-white/[0.08] text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generated on: {new Date(selectedReport.generated_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-obsidian-900 text-slate-200 hover:text-white transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={() => {
                  setGeneratedShareUrl(null);
                  setShareModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share with Consent</span>
              </button>
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="quest-card p-8 md:p-12 border-white/[0.08] bg-obsidian-950 space-y-8 print:border-none print:bg-white print:text-black">
            
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase font-bold tracking-wider text-indigo-400 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  BugQuest AI Verified Candidate Dossier
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">{user?.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target Role: <span className="text-slate-200 font-medium">{user?.target_role || 'Software Engineer'}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Readiness Score
                </span>
                <div className="flex items-baseline sm:justify-end gap-1.5">
                  <span className="text-4xl font-extrabold text-white font-mono">{selectedReport.overall_readiness_score}</span>
                  <span className="text-slate-500 font-mono text-sm">/ 100</span>
                </div>
                <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase">
                  {selectedReport.readiness_level}
                </span>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">Assessment Executive Summary</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-obsidian-900 p-4 rounded-xl border border-white/[0.06]">
                {selectedReport.summary}
              </p>
            </div>

            {/* Skill Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">Assessed Skill Evidence Breakdown</h3>
              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-obsidian-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-obsidian-950 text-slate-400 uppercase font-semibold text-[10px] font-mono border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4">Domain Topic</th>
                      <th className="py-3 px-4">Proficiency Tier</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4 text-right">Challenges Passed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-slate-300">
                    {selectedReport.skill_breakdown?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-semibold text-white capitalize">
                          {item.topic.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-xs">{item.proficiency_level.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-indigo-400">
                          {item.score} / 100
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {item.challenges_passed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification Seal Footer */}
            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cryptographically Verified Execution</span>
              </div>
              <span className="truncate max-w-[200px]">UUID: {selectedReport.report_uuid}</span>
            </div>

          </div>

          {/* Share Modal Dialog */}
          {shareModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-obsidian-900 p-6 space-y-5 shadow-2xl animate-fade-in">
                
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-white text-sm">Create Consent Share Token</h3>
                  </div>
                  <button
                    onClick={() => setShareModalOpen(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                {!generatedShareUrl ? (
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-400 leading-relaxed">
                      Generate an unguessable 64-character link to share with recruiters or employers. You can revoke it anytime.
                    </p>

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowDiagnostics}
                          onChange={(e) => setAllowDiagnostics(e.target.checked)}
                          className="rounded border-white/[0.1] bg-obsidian-950 text-indigo-600 focus:ring-0"
                        />
                        <span>Include Detailed Diagnostic Metrics</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowCodeSamples}
                          onChange={(e) => setAllowCodeSamples(e.target.checked)}
                          className="rounded border-white/[0.1] bg-obsidian-950 text-indigo-600 focus:ring-0"
                        />
                        <span>Include Executed Code Samples</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Token Expiration
                      </label>
                      <select
                        value={expiresDays}
                        onChange={(e) => setExpiresDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white text-xs focus:outline-none"
                      >
                        <option value={7}>7 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={90}>90 Days</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCreateShareToken}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-glow-sm transition-all"
                    >
                      Generate Share Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Cryptographic share token created successfully!</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Share Link:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedShareUrl}
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white font-mono text-xs select-all"
                        />
                        <button
                          onClick={handleCopyUrl}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-slate-500">
                        Recruiters can inspect this report without an account.
                      </p>
                      <button
                        onClick={() => {
                          const token = generatedShareUrl.split('/').pop() || '';
                          handleRevokeShareToken(token);
                        }}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};
