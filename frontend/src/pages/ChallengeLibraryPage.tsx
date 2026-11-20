import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, Challenge } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ByobImportModal } from '../components/ByobImportModal';
import { PageReveal, StaggerList, StaggerItem, InteractiveCard } from '../components/MotionPrimitives';
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
  Github,
  Lock,
} from 'lucide-react';

export const ChallengeLibraryPage: React.FC = () => {
  const { user } = useAuth();
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

  const hasActiveFilters =
    search.trim() !== '' || difficulty !== 'all' || selectedCategory !== 'all' || selectedTopic !== 'all';

  const difficultyColors: Record<string, string> = {
    beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
    advanced: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <PageReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/90 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Real-Codebase Debugging Quests
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Investigate multi-file repositories with reproducible defects, form hypotheses, edit source files, and prove your fixes with isolated automated tests.
          </p>
        </div>

        {/* Quick Stats Pill & BYOB Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <span className="text-blue-600 font-bold tabular-nums">{challenges.length}</span> quests ready
          </div>

          {(user?.role === 'educator' || user?.role === 'admin') && (
            <button
              type="button"
              onClick={() => setByobOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 text-xs font-semibold flex items-center gap-1.5 shadow-blue-sm transition-all cursor-pointer"
            >
              <Github className="w-3.5 h-3.5 text-white" />
              <span>Import GitHub Bug</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Preview Notice */}
      {!user && (
        <div className="p-4 sm:p-5 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-blue-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Browsing in guest preview mode</h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                Preview problem tickets freely. Sign in to edit repository files, run sandbox tests, submit fixes, and unlock the 4-tier AI Debugging Coach.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search bug tickets, symptoms, or files"
              placeholder="Search bug tickets, symptoms, or files..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs transition-all"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Animated Difficulty Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/90 w-full sm:w-auto overflow-x-auto">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => {
              const active = difficulty === lvl;
              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                    active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="difficulty-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-blue-600 shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{lvl}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bug Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Topic Pills */}
        {topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Tags:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTopic('all')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                selectedTopic === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {topics.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border capitalize transition-all cursor-pointer ${
                  selectedTopic === t
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setDifficulty('all');
                  setSelectedCategory('all');
                  setSelectedTopic('all');
                }}
                className="ml-auto text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-white rounded-2xl border border-slate-200 shadow-xs" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            No debugging quests match your filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting the difficulty and category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setDifficulty('all');
              setSelectedCategory('all');
              setSelectedTopic('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.04}>
          {challenges.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <InteractiveCard className="h-full bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-blue-300/90 transition-colors flex flex-col justify-between group">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-semibold capitalize px-2.5 py-0.5 rounded-full border ${
                          difficultyColors[c.difficulty] || difficultyColors.beginner
                        }`}
                      >
                        {c.difficulty}
                      </span>
                      {c.category && (
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 capitalize">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    {c.is_solved && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Fixed
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                    {c.title}
                  </h3>

                  {c.bug_report?.symptoms && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/90 p-3 rounded-xl border border-slate-200/70">
                      {c.bug_report.symptoms}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-500 font-mono">
                    {c.framework && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold">
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

                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Subprocess Sandbox</span>

                  <Link
                    to={`/challenges/${c.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors"
                  >
                    <span>{c.is_solved ? 'Inspect / Re-test' : 'Open Codebase'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </InteractiveCard>
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <ByobImportModal
        isOpen={byobOpen}
        onClose={() => setByobOpen(false)}
        onImported={(c) => {
          setChallenges((prev) => [c, ...prev]);
        }}
      />
    </PageReveal>
  );
};
