import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, RecommendationItem } from '../api/client';
import { 
  ArrowRight, 
  CheckCircle2, 
  Terminal,
  BrainCircuit
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.learning.getRecommendations();
      setRecommendations(res.recommendations);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleDismiss = async (id: number) => {
    try {
      await api.learning.dismissRecommendation(id);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to dismiss recommendation');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-48 bg-obsidian-850 rounded-xl" />
          <div className="h-32 bg-obsidian-850 rounded-xl" />
          <div className="h-32 bg-obsidian-850 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
          <span>Personalized Learning Roadmap</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Targeted challenge recommendations generated systematically from your observed assessment errors and skill gaps.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="quest-card p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have no pending recommendations. Practice new challenges in the library to generate personalized feedback.
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-sm transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>Browse Challenges</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="quest-card p-6 border-indigo-500/25 bg-gradient-to-r from-obsidian-900 to-obsidian-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Topic: {rec.topic}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{rec.created_at}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {rec.challenge?.title || rec.topic}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {rec.reason}
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                <button
                  onClick={() => handleDismiss(rec.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/[0.08] hover:bg-white/[0.05] transition-all"
                >
                  Dismiss
                </button>
                <Link
                  to={`/challenges/${rec.challenge?.slug || rec.challenge?.id || ''}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-sm transition-all"
                >
                  <span>Start Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
