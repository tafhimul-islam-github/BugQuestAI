import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, SkillProfile, RecommendationItem } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  BarChart2, 
  TrendingUp, 
  Layers 
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const primaryRec = recommendations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Targeting: <span className="text-slate-200 font-medium">{user?.target_role || 'Software Engineer'}</span>
          </p>
        </div>

        {error && (
          <div className="w-full p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            to="/challenges"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>Practice Challenges</span>
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Readiness Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{profile?.overall_score || 0}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-indigo-400 mt-2 font-medium">
            {profile?.overall_proficiency}
          </p>
        </div>

        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Challenges Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{profile?.challenges_solved || 0}</span>
            <span className="text-xs text-slate-400">/ {profile?.challenges_total || 0} available</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, ((profile?.challenges_solved || 0) / Math.max(1, profile?.challenges_total || 1)) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Assessed Domains</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{profile?.skills.length || 0}</span>
            <span className="text-xs text-slate-400">Skill Categories</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Empirical evidence collected across tests
          </p>
        </div>

        <div className="quest-card p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Assessment Engine</span>
            <Terminal className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-white">Isolated Sandbox</span>
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Authentic Execution
          </p>
        </div>

      </div>

      {/* Recommended Next Challenge Banner */}
      {primaryRec && (
        <div className="quest-card p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Targeted Learning Recommendation
                </span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Domain: {primaryRec.topic}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {primaryRec.challenge.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {primaryRec.reason}
              </p>
            </div>

            <Link
              to={`/challenge/${primaryRec.challenge.slug}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0 hover:scale-105"
            >
              Start Challenge
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Layout: Skills & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Assessed Skills Grid (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              Empirical Skill Profile
            </h2>
            <Link to="/skills" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              View Evidence Details &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile?.skills.map((skill) => {
              const proficiencyColors = {
                consistent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                demonstrating_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                developing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              };

              return (
                <div key={skill.id} className="quest-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white capitalize text-sm">
                      {skill.topic.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${proficiencyColors[skill.proficiency_level]}`}>
                      {skill.proficiency_level.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs text-slate-400">
                    <span>Proficiency Score</span>
                    <span className="font-bold text-white text-base">{skill.score} / 100</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${skill.score}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Passed: {skill.challenges_passed} / {skill.challenges_attempted} challenges</span>
                    <span>{skill.total_submissions} attempts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Recent Submissions
            </h2>
          </div>

          <div className="quest-card divide-y divide-slate-800 overflow-hidden">
            {profile?.recent_activity.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No submissions recorded yet. Pick a challenge to start!
              </div>
            ) : (
              profile?.recent_activity.map((act) => {
                const isAccepted = act.status === 'accepted';
                return (
                  <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-850 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white truncate max-w-[180px]">
                        {act.challenge_title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {act.created_at} {act.execution_time_ms ? `• ${act.execution_time_ms}ms` : ''}
                      </p>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isAccepted 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {act.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
