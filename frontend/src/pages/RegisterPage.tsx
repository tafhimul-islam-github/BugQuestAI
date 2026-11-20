import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { AuthShowcaseVector } from '../components/VectorIllustrations';
import { PageReveal } from '../components/MotionPrimitives';
import { Lock, Mail, User as UserIcon, Briefcase, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack Software Engineer');
  const [role, setRole] = useState('learner');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        target_role: targetRole,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageReveal className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-card-hover">
        {/* Left: Light Architectural Showcase */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-9 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border-r border-slate-200/80 text-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-55 pointer-events-none" />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-200/45 blur-3xl pointer-events-none"
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
                Build verifiable debugging evidence from day one.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every fix you submit is evaluated in an isolated sandbox and recorded into your personal competency graph.
              </p>
            </div>

            <div className="pt-2">
              <AuthShowcaseVector className="w-full h-44" />
            </div>
          </div>

          <ul className="relative z-10 space-y-2.5 text-xs text-slate-700 pt-6 border-t border-slate-200/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-file real-codebase debugging challenges</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Guided progressive hints without solution spoilers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Shareable, consent-controlled workforce dossiers</span>
            </li>
          </ul>
        </div>

        {/* Right: Registration Form */}
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
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Taylor Chen"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-target-role" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target engineering role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-target-role"
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Backend Engineer"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-account-type" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account type
                  </label>
                  <select
                    id="reg-account-type"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 text-xs font-medium transition-all"
                  >
                    <option value="learner">Learner (Practice)</option>
                    <option value="educator">Educator (Classroom)</option>
                  </select>
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
                    <span>Create Account</span>
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
