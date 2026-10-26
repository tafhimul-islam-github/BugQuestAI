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
        <div className="h-64 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-amber-400" />
            Workforce Readiness Report
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirically verified assessment summaries ready for candidate portfolios and educator reviews.
          </p>
        </div>

        {error && (
          <div className="w-full p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
        >
          {generating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Generate New Report</span>
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="quest-card p-12 text-center space-y-4">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Reports Generated Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Click "Generate New Report" above to compile your stored coding assessment evidence into a verified report.
          </p>
        </div>
      ) : selectedReport ? (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Generated on: {new Date(selectedReport.generated_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={() => {
                  setGeneratedShareUrl(null);
                  setShareModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share with Consent</span>
              </button>
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="quest-card p-8 md:p-12 border-slate-800 bg-slate-950 space-y-8 print:border-none print:bg-white print:text-black">
            
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-indigo-400 mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  BugQuest AI Verified Assessment Report
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">{user?.name}</h2>
                <p className="text-sm text-slate-400">
                  Target Role: <span className="text-slate-200 font-medium">{user?.target_role || 'Software Engineer'}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Readiness Score
                </span>
                <div className="flex items-baseline sm:justify-end gap-1">
                  <span className="text-4xl font-extrabold text-white">{selectedReport.overall_readiness_score}</span>
                  <span className="text-slate-500 text-sm">/ 100</span>
                </div>
                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {selectedReport.readiness_level}
                </span>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Assessment Executive Summary</h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                {selectedReport.summary}
              </p>
            </div>

            {/* Skill Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Assessed Skill Evidence Breakdown</h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Domain Topic</th>
                      <th className="py-3 px-4">Proficiency Tier</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4 text-right">Challenges Passed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {selectedReport.skill_breakdown?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-semibold text-white capitalize">
                          {item.topic.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">{item.proficiency_level.replace('_', ' ')}</span>
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

            {/* Methodology & Limitations Disclaimers */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400">
              <div className="space-y-1.5">
                <h4 className="font-semibold text-white">Scoring Methodology</h4>
                <p className="leading-relaxed">{selectedReport.methodology_notes}</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-semibold text-white">Assessment Limitations & Ethics</h4>
                <p className="leading-relaxed">{selectedReport.limitations_disclaimer}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-600">
              Report UUID: {selectedReport.report_uuid} • Verified by BugQuest AI Automated Test Harness
            </div>

          </div>
        </div>
      ) : null}

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="quest-card max-w-lg w-full p-6 sm:p-8 space-y-6 border-indigo-500/30 bg-slate-900 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Consent-Based Report Sharing</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Generate an unpredictable 64-character share link. You control what recipients can see, and you can revoke the link at any time.
            </p>

            {/* Consent Options */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDiagnostics}
                  onChange={(e) => setAllowDiagnostics(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                />
                <span className="text-slate-300 font-medium">Include detailed topic evidence and pass metrics</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCodeSamples}
                  onChange={(e) => setAllowCodeSamples(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                />
                <span className="text-slate-300 font-medium">Allow viewing anonymized code implementation samples</span>
              </label>
            </div>

            {/* Expiration Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Link Expiration
              </label>
              <select
                value={expiresDays}
                onChange={(e) => setExpiresDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days (Recommended)</option>
                <option value={60}>60 Days</option>
              </select>
            </div>

            {/* Generated URL Box */}
            {generatedShareUrl ? (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Share Link Active
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedShareUrl}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-slate-300 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      const token = generatedShareUrl.split('/').pop() || '';
                      handleRevokeShareToken(token);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Revoke this link immediately
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCreateShareToken}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                Generate Share Link
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
