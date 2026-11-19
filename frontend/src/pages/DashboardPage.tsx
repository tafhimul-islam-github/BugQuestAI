import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, SkillProfile, RecommendationItem } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PageReveal, StaggerList, StaggerItem, InteractiveCard } from '../components/MotionPrimitives';
import {
  Award,
  Terminal,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
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
          api.learning.getRecommendations(),
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
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 shadow-xs" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200 shadow-xs animate-pulse" />
      </div>
    );
  }

  const primaryRec = recommendations[0];

  return (
    <PageReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Developer Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1.5">
            Signed in as <span className="text-slate-900 font-semibold">{user?.name}</span> · Target track:{' '}
            <span className="text-blue-600 font-semibold">{user?.target_role || 'Full Stack Engineer'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/challenges"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-blue-sm transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>Practice Challenges</span>
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-all"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Workforce Dossier</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="w-full p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.05}>
        {/* KPI 1 */}
        <StaggerItem>
          <InteractiveCard className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-colors h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold text-slate-600">Total Solved</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                {profile?.challenges_solved || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">challenges</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified in sandbox</span>
            </div>
          </InteractiveCard>
        </StaggerItem>

        {/* KPI 2 */}
        <StaggerItem>
          <InteractiveCard className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-colors h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold text-slate-600">Total Benchmarks</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Terminal className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                {profile?.challenges_total || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">available</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>Isolated environments</span>
            </div>
          </InteractiveCard>
        </StaggerItem>

        {/* KPI 3 */}
        <StaggerItem>
          <InteractiveCard className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-colors h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold text-slate-600">Overall Score</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                {profile?.overall_score || 0}%
              </span>
              <span className="text-xs text-slate-500 font-medium">score</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(profile?.overall_score || 0, 100)}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full"
              />
            </div>
          </InteractiveCard>
        </StaggerItem>

        {/* KPI 4 */}
        <StaggerItem>
          <InteractiveCard className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-colors h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
              <span className="font-semibold text-slate-600">Current Proficiency</span>
              <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-slate-900 tracking-tight capitalize">
                {profile?.overall_proficiency || 'Junior Ready'}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Audit-ready evidence</span>
            </div>
          </InteractiveCard>
        </StaggerItem>
      </StaggerList>

      {/* Recommended Next Challenge Dark Feature Banner */}
      {primaryRec && (
        <div className="rounded-3xl bg-[#0b1221] border border-slate-800 p-6 sm:p-8 shadow-obsidian relative overflow-hidden">
          <div className="absolute inset-0 bg-dark-grid opacity-55 pointer-events-none" />
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-blue-600/25 blur-3xl pointer-events-none"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Recommended Next Quest
                </span>
                <span className="text-xs font-mono text-slate-300 capitalize bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {primaryRec.challenge?.difficulty || primaryRec.topic}
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                {primaryRec.challenge?.title || primaryRec.topic}
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {primaryRec.reason}
              </p>
            </div>

            <Link
              to={`/challenges/${primaryRec.challenge?.slug || primaryRec.challenge?.id || ''}`}
              className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-blue-md transition-all whitespace-nowrap self-start sm:self-auto"
            >
              <span>Launch IDE</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Algorithmic Competency Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Topics Mastery */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Algorithmic Competency Evidence
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated solely from passing executions in the isolated sandbox
              </p>
            </div>
            <Link
              to="/skills"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <span>Detailed Breakdown</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {profile?.skills &&
              profile.skills.map((skill, idx) => (
                <div key={skill.id} className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 capitalize text-sm">
                        {skill.topic.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        ({skill.challenges_passed}/{skill.challenges_attempted || skill.total_submissions} passed)
                      </span>
                    </div>
                    <span className="font-mono text-blue-600 font-bold text-sm tabular-nums">
                      {skill.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            {(!profile?.skills || profile.skills.length === 0) && (
              <div className="text-center py-10 text-slate-500 text-sm">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                No skills evaluated yet. Start by solving a quest in the challenge library.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions & Dossier */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-display font-bold text-base mb-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Workforce Dossier</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Generate cryptographic proof of your programming competency and share tamper-proof reports with engineering hiring managers.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600 font-medium">Cryptographic Token</span>
                <span className="font-mono text-emerald-700 font-semibold text-xs">64-char unguessable</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600 font-medium">Revocation</span>
                <span className="font-medium text-blue-700 text-xs">Instant 1-Click</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600 font-medium">Code Samples Scope</span>
                <span className="font-medium text-slate-700 text-xs">Consent Governed</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/reports"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 transition-all"
            >
              <span>Manage Share Tokens</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            </Link>
          </div>
        </div>
      </div>
    </PageReveal>
  );
};
