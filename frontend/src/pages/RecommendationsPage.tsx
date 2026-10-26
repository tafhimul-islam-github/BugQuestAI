import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, RecommendationItem } from '../api/client';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Terminal 
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
          <div className="h-10 w-48 bg-slate-900 rounded-xl" />
          <div className="h-32 bg-slate-900 rounded-xl" />
          <div className="h-32 bg-slate-900 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-indigo-400" />
          Personalized Learning Path
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Targeted challenge recommendations generated systematically from your observed assessment errors and skill gaps.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="quest-card p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            You have no pending recommendations. Practice new challenges in the library to generate personalized feedback.
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            <Terminal className="w-4 h-4" />
            Browse Challenges
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="quest-card p-6 border-indigo-500/20 hover:border-indigo-500/40 bg-slate-900/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Topic: {rec.topic}
                  </span>
                  <span className="text-xs text-slate-500">{rec.created_at}</span>
                </div>

                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {rec.challenge.title}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                    {rec.challenge.difficulty}
                  </span>
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleDismiss(rec.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Dismiss recommendation"
                >
                  Dismiss
                </button>
                <Link
                  to={`/challenge/${rec.challenge.slug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <span>Solve Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
