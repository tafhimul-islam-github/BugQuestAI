import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, PublicSharedReport } from '../api/client';
import { 
  ShieldCheck, 
  Terminal, 
  AlertTriangle 
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
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Verifying secure report token...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="quest-card p-8 max-w-md w-full text-center space-y-4 border-rose-500/30">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied or Link Revoked</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error || 'This report link is invalid, expired, or has been revoked by the learner.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs transition-all"
            >
              <Terminal className="w-4 h-4" />
              Visit BugQuest AI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Verification Pill */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">Verified Share Link</span>
            <span>• Views: {report.sharing_settings.views_count}</span>
          </div>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            BugQuest AI Platform
          </Link>
        </div>

        {/* Public Report Document */}
        <div className="quest-card p-8 md:p-12 border-slate-800 bg-slate-950 space-y-8 shadow-2xl">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-indigo-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Verified Candidate Readiness Evidence
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{report.candidate_name}</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Target Role: <span className="text-slate-200 font-medium">{report.target_role || 'Software Engineer'}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Readiness Score
              </span>
              <div className="flex items-baseline sm:justify-end gap-1">
                <span className="text-4xl font-extrabold text-white">{report.overall_readiness_score}</span>
                <span className="text-slate-500 text-sm">/ 100</span>
              </div>
              <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {report.readiness_level}
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Candidate Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              {report.summary}
            </p>
          </div>

          {/* Assessed Skill Breakdown */}
          {report.sharing_settings.allow_diagnostics && report.skill_breakdown && report.skill_breakdown.length > 0 && (
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
                    {report.skill_breakdown.map((item, idx) => (
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
          )}

          {/* Methodology & Limitations Disclaimers */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-white">Scoring Methodology</h4>
              <p className="leading-relaxed">{report.methodology_notes}</p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-white">Assessment Ethics & Transparency</h4>
              <p className="leading-relaxed">{report.limitations_disclaimer}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-600">
            Verified by BugQuest AI • Generated on {report.generated_at}
          </div>

        </div>

      </div>
    </div>
  );
};
