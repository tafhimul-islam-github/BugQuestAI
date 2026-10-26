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
          <div className="h-10 w-48 bg-white rounded-2xl border border-slate-200" />
          <div className="h-32 bg-white rounded-2xl border border-slate-200" />
          <div className="h-32 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200/90 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Learning Roadmap
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Targeted challenge recommendations generated systematically from your observed assessment errors and skill gaps.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-card">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have no pending recommendations. Practice new challenges in the library to generate personalized feedback.
          </p>
          <div className="pt-2">
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-blue-sm transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>Browse Challenges</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Topic: {rec.topic.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">{rec.created_at}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {rec.challenge?.title || rec.topic}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {rec.reason}
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                <button
                  onClick={() => handleDismiss(rec.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Dismiss
                </button>
                <Link
                  to={`/challenges/${rec.challenge?.slug || rec.challenge?.id || ''}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-blue-sm transition-all"
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
