import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Challenge } from '../api/client';
import { 
  Search, 
  Terminal, 
  CheckCircle2, 
  Filter, 
  ArrowRight, 
  Cpu, 
  X
} from 'lucide-react';

export const ChallengeLibraryPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await api.challenges.list({
        search: search || undefined,
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        topic: selectedTopic !== 'all' ? selectedTopic : undefined,
      });
      setChallenges(res.challenges);
      setTopics(res.topics);
    } catch (err: any) {
      setError(err.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [difficulty, selectedTopic]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChallenges();
  };

  const difficultyColors = {
    beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Terminal className="w-7 h-7 text-indigo-400" />
          Coding Challenge Library
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Practice standard algorithmic problem-solving with isolated test execution and progressive AI hints.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="quest-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or concept..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchChallenges();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Difficulty Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  difficulty === lvl
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Topics:
          </span>
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedTopic === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Topics
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize transition-all ${
                selectedTopic === t
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="quest-card p-12 text-center space-y-3">
          <Terminal className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No challenges match your criteria</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting difficulty and topic filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setDifficulty('all');
              setSelectedTopic('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((c) => {
            return (
              <div
                key={c.id}
                className="quest-card p-6 flex flex-col justify-between quest-card-hover group border-slate-800"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        difficultyColors[c.difficulty]
                      }`}
                    >
                      {c.difficulty}
                    </span>

                    {c.is_solved && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Solved
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                    {c.title}
                  </h3>

                  <div className="flex flex-wrap gap-1">
                    {c.topics?.map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 capitalize"
                      >
                        {topic.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    {c.time_limit_ms}ms limit
                  </span>

                  <Link
                    to={`/challenge/${c.slug}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  >
                    <span>{c.is_solved ? 'Practice Again' : 'Solve Challenge'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
