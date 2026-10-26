import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, SkillProfile, RecommendationItem } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, recRes] = await Promise.all([
          api.learning.getProfile(),
          api.learning.getRecommendations()
        ]);
        setProfile(profileRes.profile);
        setRecommendations(recRes.recommendations);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-obsidian-850/80 rounded-xl border border-white/[0.06]" />
          ))}
        </div>
        <div className="h-64 bg-obsidian-850/80 rounded-xl border border-white/[0.06] animate-pulse" />
      </div>
    );
  }

  const primaryRec = recommendations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Developer Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
              {user?.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <span className="text-slate-200 font-medium">{user?.name}</span> • Target: <span className="text-indigo-400 font-medium">{user?.target_role || 'Full Stack Engineer'}</span>
          </p>
        </div>

        {error && (
          <div className="w-full p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <Link
            to="/challenges"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs shadow-glow-sm transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Practice Challenges</span>
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.1] bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 font-medium text-xs transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Workforce Dossier</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Total Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile?.challenges_solved || 0}
            </span>
            <span className="text-xs text-slate-500 font-mono">challenges</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>Verified in sandbox</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Total Challenges</span>
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile?.challenges_total || 0}
            </span>
            <span className="text-xs text-slate-500 font-mono">available</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-indigo-400">
            <Cpu className="w-3 h-3" />
            <span>Standardized benchmarks</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Overall Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile?.overall_score || 0}%
            </span>
            <span className="text-xs text-slate-500 font-mono">score</span>
          </div>
          <div className="mt-3 w-full bg-obsidian-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(profile?.overall_score || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Current Proficiency</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight capitalize">
              {profile?.overall_proficiency || 'Junior Ready'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-sky-400 font-mono">
            <span>Audit-ready evidence</span>
          </div>
        </div>

      </div>

      {/* Recommended Next Challenge Banner */}
      {primaryRec && (
        <div className="quest-card p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-obsidian-850 to-obsidian-850 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  Next Recommended Challenge
                </span>
                <span className="text-xs text-slate-400 font-mono capitalize">
                  {primaryRec.challenge?.difficulty || primaryRec.topic}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {primaryRec.challenge?.title || primaryRec.topic}
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                {primaryRec.reason}
              </p>
            </div>

            <Link
              to={`/challenges/${primaryRec.challenge?.slug || primaryRec.challenge?.id || ''}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-sm transition-all whitespace-nowrap self-start sm:self-auto"
            >
              <span>Launch IDE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Algorithmic Competency Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Topics Mastery */}
        <div className="lg:col-span-2 quest-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Algorithmic Competency Evidence</h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated solely from passing executions in isolated sandbox</p>
            </div>
            <Link to="/skills" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
              <span>Detailed Breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {profile?.skills && profile.skills.map((skill) => (
              <div key={skill.id} className="p-3.5 rounded-xl bg-obsidian-950/60 border border-white/[0.04]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white capitalize">{skill.topic.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({skill.challenges_passed}/{skill.challenges_attempted || skill.total_submissions} passed)
                    </span>
                  </div>
                  <span className="font-mono text-indigo-400 font-bold">{skill.score}%</span>
                </div>
                <div className="w-full bg-obsidian-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Actions & Dossier */}
        <div className="quest-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Workforce Dossier</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Generate cryptographic proof of your programming competency. Share tamper-proof reports with engineering hiring managers.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-950/60 border border-white/[0.04]">
                <span className="text-slate-400">Cryptographic Token</span>
                <span className="font-mono text-emerald-400 text-[11px]">64-char unguessable</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-950/60 border border-white/[0.04]">
                <span className="text-slate-400">Revocation</span>
                <span className="font-mono text-indigo-300 text-[11px]">Instant 1-Click</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-950/60 border border-white/[0.04]">
                <span className="text-slate-400">Code Samples Scope</span>
                <span className="font-mono text-slate-300 text-[11px]">Consent Governed</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <Link
              to="/reports"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all"
            >
              <span>Manage Share Tokens</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
