import React, { useEffect, useState } from 'react';
import { api, SkillProfile } from '../api/client';
import { 
  BarChart3, 
  Layers, 
  HelpCircle 
} from 'lucide-react';

export const SkillProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.learning.getProfile();
        setProfile(res.profile);
      } catch (err: any) {
        setError(err.message || 'Failed to load skill profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-12 w-64 bg-slate-900 rounded-xl" />
          <div className="h-64 bg-slate-900 rounded-xl" />
        </div>
      </div>
    );
  }

  const proficiencyBadges = {
    consistent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    demonstrating_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    developing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-indigo-400" />
          Verifiable Skill Evidence Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Objective proficiency breakdown derived directly from real isolated test harness executions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Summary Score Card */}
      <div className="quest-card p-6 md:p-8 border-indigo-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Aggregated Competence Rating
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-white">{profile?.overall_score}</span>
              <span className="text-slate-400 font-medium text-lg">/ 100</span>
            </div>
            <p className="text-sm text-slate-300">
              Proficiency Tier: <span className="font-bold text-white">{profile?.overall_proficiency}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
              <div className="text-2xl font-bold text-white">{profile?.challenges_solved}</div>
              <div className="text-xs text-slate-400">Verified Solved</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
              <div className="text-2xl font-bold text-white">{profile?.skills.length}</div>
              <div className="text-xs text-slate-400">Assessed Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Assessed Topic Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile?.skills.map((skill) => (
            <div key={skill.id} className="quest-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-white capitalize">
                  {skill.topic.replace('_', ' ')}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${proficiencyBadges[skill.proficiency_level]}`}>
                  {skill.proficiency_level.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Topic Score</span>
                  <span className="font-mono font-bold text-white text-sm">{skill.score} / 100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${skill.score}%` }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                <div className="p-2 rounded bg-slate-950/60">
                  <span className="text-slate-400 block text-[10px]">Passed</span>
                  <span className="font-bold text-white">{skill.challenges_passed}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60">
                  <span className="text-slate-400 block text-[10px]">Attempts</span>
                  <span className="font-bold text-white">{skill.total_submissions}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60">
                  <span className="text-slate-400 block text-[10px]">Last Tested</span>
                  <span className="font-medium text-slate-300 text-[11px] truncate">{skill.last_assessed}</span>
                </div>
              </div>

              {/* Diagnostic History Snippets */}
              {skill.diagnostic_history && skill.diagnostic_history.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Recent Verified Attempts:
                  </span>
                  <div className="space-y-1">
                    {skill.diagnostic_history.slice(-3).map((hist, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/40 px-2 py-1 rounded">
                        <span className="truncate max-w-[140px] text-slate-300">{hist.challenge_slug}</span>
                        <div className="flex items-center gap-2">
                          <span>{hist.pass_ratio}</span>
                          <span className={`px-1 rounded text-[9px] font-bold uppercase ${
                            hist.result === 'accepted' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                          }`}>
                            {hist.result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Methodology & Ethics Disclosure */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-2 text-xs text-slate-400 leading-relaxed">
        <h3 className="font-semibold text-white flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          Scoring Methodology & Limitations
        </h3>
        <p>
          Proficiency levels (Developing, Demonstrating Progress, Consistent) are updated systematically upon successful code assessment across both public and private boundary test cases. We do not inflate scores through passive video watching or multiple-choice questions; evidence requires functional code implementation.
        </p>
        <p className="text-slate-500">
          Disclaimer: High assessment scores demonstrate algorithmic problem-solving ability on standardized benchmarks, but do not imply a guarantee of employment or measure unassessed interpersonal skills.
        </p>
      </div>

    </div>
  );
};
