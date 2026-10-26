import React, { useEffect, useState } from 'react';
import { api, SkillProfile } from '../api/client';
import { 
  BarChart3, 
  Layers, 
  HelpCircle,
  ShieldCheck
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
          <div className="h-12 w-64 bg-obsidian-850 rounded-xl" />
          <div className="h-64 bg-obsidian-850 rounded-xl" />
        </div>
      </div>
    );
  }

  const proficiencyBadges: Record<string, string> = {
    consistent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    demonstrating_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    developing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Verifiable Skill Evidence Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical proficiency breakdown calculated exclusively from passing executions in isolated sandbox runtimes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-850 border border-white/[0.08] text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Passive Inflation</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Summary Score Banner */}
      <div className="quest-card p-6 md:p-8 border-indigo-500/30 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-indigo-950/20 shadow-glow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Composite Algorithmic Mastery
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-black text-white">{profile?.overall_score || 0}</span>
              <span className="text-slate-500 font-mono text-base">/ 100</span>
            </div>
            <p className="text-xs text-slate-300">
              Assessment Tier: <span className="font-bold text-white capitalize">{profile?.overall_proficiency || 'Junior Ready'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center w-full md:w-auto">
            <div className="p-4 rounded-xl border border-white/[0.06] bg-obsidian-950">
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">{profile?.challenges_solved || 0}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Verified Solved</div>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.06] bg-obsidian-950">
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">{profile?.skills?.length || 0}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Assessed Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Assessed Domain Evidence</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile?.skills && profile.skills.map((skill) => {
            const level = skill.proficiency_level || 'developing';
            const badgeClass = proficiencyBadges[level] || proficiencyBadges.developing;

            return (
              <div key={skill.id} className="quest-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white capitalize">
                    {skill.topic.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                    {level.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Proficiency Score</span>
                    <span className="font-mono font-bold text-white text-xs">{skill.score || 0} / 100</span>
                  </div>
                  <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-white/[0.04]">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${skill.score || 0}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/[0.04]">
                    <span className="text-slate-500 block text-[10px]">Passed</span>
                    <span className="font-bold text-white font-mono">{skill.challenges_passed || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/[0.04]">
                    <span className="text-slate-500 block text-[10px]">Attempts</span>
                    <span className="font-bold text-white font-mono">{skill.total_submissions || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/[0.04]">
                    <span className="text-slate-500 block text-[10px]">Last Tested</span>
                    <span className="font-medium text-slate-300 text-[11px] truncate">{skill.last_assessed || 'Recent'}</span>
                  </div>
                </div>

                {/* Diagnostic History Snippets */}
                {skill.diagnostic_history && skill.diagnostic_history.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Recent Verified Attempts:
                    </span>
                    <div className="space-y-1">
                      {skill.diagnostic_history.slice(-3).map((hist, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-obsidian-950 px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
                          <span className="truncate max-w-[140px] text-slate-300">{hist.challenge_slug}</span>
                          <div className="flex items-center gap-2">
                            <span>{hist.pass_ratio}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
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
            );
          })}
        </div>
      </div>

      {/* Methodology & Integrity Notice */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-obsidian-900/60 space-y-2 text-xs text-slate-400 leading-relaxed">
        <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Empirical Assessment Protocol</span>
        </h3>
        <p>
          Proficiency levels are calculated objectively upon verified test execution across public and private boundary test suites. Passive engagement (watching videos, reviewing documentation) does not generate skill points; evidence requires authenticated algorithmic execution in the isolated sandbox.
        </p>
      </div>

    </div>
  );
};
