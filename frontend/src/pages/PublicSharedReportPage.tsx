import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, PublicSharedReport } from '../api/client';
import { 
  ShieldCheck, 
  Terminal, 
  AlertTriangle,
  Eye
} from 'lucide-react';

export const PublicSharedReportPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<PublicSharedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShared = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await api.reports.getPublicShared(token);
        setReport(res.shared_report);
      } catch (err: any) {
        setError(err.message || 'Report not found or has been revoked.');
      } finally {
        setLoading(false);
      }
    };

    fetchShared();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-medium text-slate-500">Verifying cryptographic report token...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 max-w-md w-full text-center space-y-4 shadow-card">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Access Denied or Link Revoked</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'This report link is invalid, expired, or has been revoked by the candidate.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-blue-sm"
            >
              <Terminal className="w-4 h-4" />
              <span>Visit BugQuest AI</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Verification Status Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-800 font-bold font-mono text-[11px]">Cryptographically Verified Dossier</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 font-medium">
              <Eye className="w-3.5 h-3.5 text-slate-400" /> {report.sharing_settings.views_count} views
            </span>
          </div>
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1">
            BugQuest AI Platform
          </Link>
        </div>

        {/* Public Report Document */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 md:p-12 shadow-card space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold tracking-wider text-blue-700 mb-1.5 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Candidate Readiness Evidence
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{report.candidate_name}</h1>
              <p className="text-xs text-slate-600 mt-1">
                Target Track: <span className="text-slate-900 font-semibold">{report.target_role || 'Software Engineer'}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Readiness Score
              </span>
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">{report.overall_readiness_score}</span>
                <span className="text-slate-500 font-mono text-sm font-semibold">/ 100</span>
              </div>
              <span className="inline-block mt-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {report.readiness_level}
              </span>
            </div>
          </div>

          {/* Candidate Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-600">Executive Summary</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {report.summary}
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
                  {report.skill_breakdown?.map((item, idx) => (
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

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authentic Subprocess Execution Verified</span>
            </div>
            <span>Token: {token ? token.slice(0, 16) : ''}...</span>
          </div>

        </div>

      </div>
    </div>
  );
};
