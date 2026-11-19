import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Challenge } from '../api/client';
import { ByobImportModal } from '../components/ByobImportModal';
import { 
  Search, 
  Terminal, 
  CheckCircle2, 
  Filter, 
  ArrowRight, 
  Clock,
  Files,
  X,
  Layers,
  Github
} from 'lucide-react';

export const ChallengeLibraryPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [byobOpen, setByobOpen] = useState(false);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await api.challenges.list({
        search: search || undefined,
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        topic: selectedTopic !== 'all' ? selectedTopic : undefined,
      });
      setChallenges(res.challenges);
      setTopics(res.topics);
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = search.trim() ? 300 : 0;
    const timer = window.setTimeout(() => {
      fetchChallenges();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [difficulty, selectedCategory, selectedTopic, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
    advanced: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-Codebase Debugging Quests
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Investigate multi-file repositories with reproducible defects, formulate hypotheses, edit source files, and prove your fixes with isolated automated test verification.
          </p>
        </div>

        {/* Quick Stats Pill & BYOB Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 shadow-xs">
            <span className="text-blue-600 font-bold">{challenges.length}</span> Quests Ready to Debug
          </div>

          <button
            onClick={() => setByobOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-850 hover:to-indigo-900 text-white border border-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Github className="w-3.5 h-3.5 text-indigo-400" />
            <span>BYOB: Import Bug</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500 text-white font-bold">
              AI
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bug tickets, symptoms, or files..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Difficulty Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  difficulty === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

        </div>

        {/* Bug Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Defect Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Topic Pills */}
        {topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-all ${
                selectedTopic === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium border capitalize transition-all ${
                  selectedTopic === t
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 shadow-xs" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-card">
          <Terminal className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No debugging quests match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting difficulty and defect categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setDifficulty('all');
              setSelectedCategory('all');
              setSelectedTopic('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
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
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          difficultyColors[c.difficulty] || difficultyColors.beginner
                        }`}
                      >
                        {c.difficulty}
                      </span>
                      {c.category && (
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 capitalize">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {c.is_solved && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Fixed
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                    {c.title}
                  </h3>

                  {c.bug_report?.symptoms && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      {c.bug_report.symptoms}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 font-mono">
                    {c.framework && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        {c.framework}
                      </span>
                    )}
                    {Number(c.file_count) > 0 && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Files className="w-3 h-3 text-slate-400" /> {c.file_count} files
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" /> ~{c.investigation_time_minutes || 25}m
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    Subprocess Sandbox
                  </span>

                  <Link
                    to={`/challenges/${c.slug}`}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors"
                  >
                    <span>{c.is_solved ? 'Inspect / Re-test' : 'Open Codebase'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ByobImportModal
        isOpen={byobOpen}
        onClose={() => setByobOpen(false)}
        onImported={(c) => {
          setChallenges((prev) => [c, ...prev]);
        }}
      />
    </div>
  );
};
