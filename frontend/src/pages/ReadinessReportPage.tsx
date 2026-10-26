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
        <div className="h-64 bg-white rounded-2xl border border-slate-200 shadow-xs animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Workforce Readiness Dossier
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Empirically verified candidate dossiers with consent-controlled cryptographic share tokens.
          </p>
        </div>

        {error && (
          <div className="w-full p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-blue-sm transition-all"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-card">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Reports Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Generate Fresh Dossier" above to compile your stored coding assessment evidence into a verified report.
          </p>
        </div>
      ) : selectedReport ? (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-card text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Generated on: {new Date(selectedReport.generated_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={() => {
                  setGeneratedShareUrl(null);
                  setShareModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-blue-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share with Consent</span>
              </button>
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 md:p-12 shadow-card space-y-8 print:border-none print:shadow-none">
            
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold tracking-wider text-blue-700 mb-1.5 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  BugQuest AI Verified Candidate Dossier
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name}</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Target Track: <span className="text-slate-900 font-semibold">{user?.target_role || 'Software Engineer'}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Readiness Score
                </span>
                <div className="flex items-baseline sm:justify-end gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono">{selectedReport.overall_readiness_score}</span>
                  <span className="text-slate-500 font-mono text-sm font-semibold">/ 100</span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {selectedReport.readiness_level}
                </span>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600">Assessment Executive Summary</h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedReport.summary}
              </p>
            </div>

            {/* Skill Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600">Assessed Skill Evidence Breakdown</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] font-mono border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Domain Topic</th>
                      <th className="py-3 px-4">Proficiency Tier</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4 text-right">Challenges Passed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedReport.skill_breakdown?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900 capitalize">
                          {item.topic.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-xs font-medium text-slate-600">{item.proficiency_level.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">
                          {item.score} / 100
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                          {item.challenges_passed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification Seal Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cryptographically Verified Execution</span>
              </div>
              <span className="truncate max-w-[200px]">UUID: {selectedReport.report_uuid}</span>
            </div>

          </div>

          {/* Share Modal Dialog */}
          {shareModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-2xl animate-fade-in">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Create Consent Share Token</h3>
                  </div>
                  <button
                    onClick={() => setShareModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {!generatedShareUrl ? (
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-600 leading-relaxed">
                      Generate an unguessable 64-character link to share with recruiters or employers. You can revoke it anytime.
                    </p>

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={allowDiagnostics}
                          onChange={(e) => setAllowDiagnostics(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0"
                        />
                        <span>Include Detailed Diagnostic Metrics</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={allowCodeSamples}
                          onChange={(e) => setAllowCodeSamples(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0"
                        />
                        <span>Include Executed Code Samples</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">
                        Token Expiration
                      </label>
                      <select
                        value={expiresDays}
                        onChange={(e) => setExpiresDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                      >
                        <option value={7}>7 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={90}>90 Days</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCreateShareToken}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-blue-sm transition-all"
                    >
                      Generate Share Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-2 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cryptographic share token created successfully!</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-600 uppercase font-bold tracking-wider">Share Link:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedShareUrl}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-mono text-xs select-all"
                        />
                        <button
                          onClick={handleCopyUrl}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-xs"
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
                        className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-semibold"
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
