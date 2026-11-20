import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { AuthShowcaseVector } from '../components/VectorIllustrations';
import { PageReveal } from '../components/MotionPrimitives';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Info, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectState = (location.state as { from?: string; message?: string } | null) || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolveDestination = (role: string) => {
    if (redirectState?.from) return redirectState.from;
    if (role === 'admin') return '/admin';
    if (role === 'educator') return '/educator';
    return '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const signedInUser = await login(email, password);
      navigate(resolveDestination(signedInUser.role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);

    try {
      const signedInUser = await login(demoEmail, 'password123');
      navigate(resolveDestination(signedInUser.role), { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Demo sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageReveal className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-card-hover">
        {/* Left: Light Architectural Engineering Showcase */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-9 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border-r border-slate-200/80 text-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-55 pointer-events-none" />
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-200/45 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <BrandLogo size="md" />
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                BugQuest <span className="text-blue-600">AI</span>
              </span>
            </Link>

            <div className="space-y-2.5">
              <h2 className="font-display text-2xl font-bold leading-snug text-slate-900">
                Step back into the isolated debugging sandbox.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick up active multi-file bug investigations, review sandbox test verdicts, and manage your cryptographic readiness dossier.
              </p>
            </div>

            <div className="pt-2">
              <AuthShowcaseVector className="w-full h-44" />
            </div>
          </div>

          <ul className="relative z-10 space-y-2.5 text-xs text-slate-700 pt-6 border-t border-slate-200/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Isolated Python 3 &amp; JavaScript V8 execution</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>4-tier Socratic AI coach with zero answer leakage</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Revocable 64-character proof-of-skill dossiers</span>
            </li>
          </ul>
        </div>

        {/* Right: Sign-In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-7">
              <div className="lg:hidden mb-4">
                <Link to="/" className="inline-flex items-center gap-2.5">
                  <BrandLogo size="sm" />
                  <span className="font-display font-bold text-lg text-slate-900">
                    BugQuest <span className="text-blue-600">AI</span>
                  </span>
                </Link>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                New to BugQuest AI?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Create a free learner account
                </Link>
              </p>
            </div>

            {/* Instant One-Click Demo Access */}
            <div className="mb-6 p-4 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-cyan-50/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant one-click demo access</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('learner@bugquest.ai')}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 shadow-xs transition-all text-center disabled:opacity-50 cursor-pointer"
                >
                  Learner
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('educator@bugquest.ai')}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 shadow-xs transition-all text-center disabled:opacity-50 cursor-pointer"
                >
                  Educator
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('admin@bugquest.ai')}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 shadow-xs transition-all text-center disabled:opacity-50 cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </div>

            {redirectState?.message && (
              <div className="mb-5 p-3.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-medium flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <span>{redirectState.message}</span>
              </div>
            )}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-blue-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageReveal>
  );
};
