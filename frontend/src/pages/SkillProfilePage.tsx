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
          <div className="h-12 w-64 bg-white rounded-2xl border border-slate-200" />
          <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  const proficiencyBadges: Record<string, string> = {
    consistent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    demonstrating_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    developing: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verifiable Skill Evidence Matrix
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Empirical proficiency breakdown calculated exclusively from passing executions in isolated sandbox runtimes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero Passive Inflation</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Summary Score Banner */}
      <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white p-6 md:p-8 shadow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Composite Algorithmic Mastery
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">{profile?.overall_score || 0}</span>
              <span className="text-slate-500 font-mono text-base font-semibold">/ 100</span>
            </div>
            <p className="text-sm text-slate-700">
              Assessment Tier: <span className="font-bold text-slate-900 capitalize">{profile?.overall_proficiency || 'Junior Ready'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center w-full md:w-auto">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-2xl font-bold text-slate-900 font-mono">{profile?.challenges_solved || 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Verified Solved</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-2xl font-bold text-slate-900 font-mono">{profile?.skills?.length || 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Assessed Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Assessed Domain Evidence</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile?.skills && profile.skills.map((skill) => {
            const level = skill.proficiency_level || 'developing';
            const badgeClass = proficiencyBadges[level] || proficiencyBadges.developing;

            return (
              <div key={skill.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-slate-900 capitalize">
                    {skill.topic.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                    {level.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Proficiency Score</span>
                    <span className="font-mono font-bold text-blue-600 text-sm">{skill.score || 0} / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${skill.score || 0}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-500 block text-[11px] font-semibold">Passed</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{skill.challenges_passed || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-500 block text-[11px] font-semibold">Attempts</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{skill.total_submissions || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-500 block text-[11px] font-semibold">Last Tested</span>
                    <span className="font-semibold text-slate-700 text-xs truncate">{skill.last_assessed || 'Recent'}</span>
                  </div>
                </div>

                {/* Diagnostic History Snippets */}
                {skill.diagnostic_history && skill.diagnostic_history.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Recent Verified Attempts:
                    </span>
                    <div className="space-y-1">
                      {skill.diagnostic_history.slice(-3).map((hist, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70">
                          <span className="truncate max-w-[140px] text-slate-800 font-medium">{hist.challenge_slug}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">{hist.pass_ratio}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              hist.result === 'accepted' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'
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
      <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2 text-xs text-slate-700 leading-relaxed">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Empirical Assessment Protocol</span>
        </h3>
        <p>
          Proficiency levels are calculated objectively upon verified test execution across public and private boundary test suites. Passive engagement (watching videos, reviewing documentation) does not generate skill points; evidence requires authenticated algorithmic execution in the isolated sandbox.
        </p>
      </div>

    </div>
  );
};
