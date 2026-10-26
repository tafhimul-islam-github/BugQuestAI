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
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Verifying cryptographic report token...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4">
        <div className="quest-card p-8 max-w-md w-full text-center space-y-4 border-rose-500/30">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied or Link Revoked</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'This report link is invalid, expired, or has been revoked by the candidate.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs transition-all shadow-glow-sm"
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
    <div className="min-h-screen bg-obsidian-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Verification Status Pill */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold font-mono text-[11px]">Cryptographically Verified Dossier</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
              <Eye className="w-3 h-3" /> {report.sharing_settings.views_count} views
            </span>
          </div>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1">
            BugQuest AI Platform
          </Link>
        </div>

        {/* Public Report Document */}
        <div className="quest-card p-8 md:p-12 border-white/[0.08] bg-obsidian-950 space-y-8 shadow-2xl">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase font-bold tracking-wider text-indigo-400 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Candidate Readiness Evidence
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{report.candidate_name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Role: <span className="text-slate-200 font-medium">{report.target_role || 'Software Engineer'}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Readiness Score
              </span>
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-4xl font-extrabold text-white font-mono">{report.overall_readiness_score}</span>
                <span className="text-slate-500 font-mono text-sm">/ 100</span>
              </div>
              <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                {report.readiness_level}
              </span>
            </div>
          </div>

          {/* Candidate Summary */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">Executive Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-obsidian-900 p-4 rounded-xl border border-white/[0.06]">
              {report.summary}
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
                  {report.skill_breakdown?.map((item, idx) => (
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

          {/* Footer Note */}
          <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Authentic Subprocess Execution Verified</span>
            </div>
            <span>Token: {token ? token.slice(0, 16) : ''}...</span>
          </div>

        </div>

      </div>
    </div>
  );
};
