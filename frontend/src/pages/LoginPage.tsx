import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="font-bold text-2xl text-white">BugQuest <span className="text-indigo-400">AI</span></span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="text-sm text-slate-400 mt-1">
            Or{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              create a new learner account
            </Link>
          </p>
        </div>

        {/* Demo Fast-Login Box */}
        <div className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Instant Demo Logins
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('learner@bugquest.ai')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white transition-all text-center"
            >
              Learner
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('educator@bugquest.ai')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white transition-all text-center"
            >
              Educator
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@bugquest.ai')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white transition-all text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="quest-card p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="learner@bugquest.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
