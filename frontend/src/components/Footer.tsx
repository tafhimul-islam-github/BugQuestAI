import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <footer
      className={`w-full py-14 transition-colors ${
        isLanding
          ? 'border-t border-slate-800/80 bg-[#070c18] text-slate-400'
          : 'border-t border-slate-200/90 bg-white text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <BrandLogo size="sm" />
              <span
                className={`font-display font-bold text-lg tracking-tight ${
                  isLanding ? 'text-white' : 'text-slate-900'
                }`}
              >
                BugQuest <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <p className={`text-sm max-w-md leading-relaxed ${isLanding ? 'text-slate-400' : 'text-slate-600'}`}>
              Real-codebase debugging assessments powered by isolated subprocess runtimes, Socratic multi-tier coaching, and verifiable developer readiness dossiers.
            </p>
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium ${
                isLanding
                  ? 'bg-slate-900/80 border border-slate-800 text-slate-300'
                  : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Debug Smarter. Build Skills. Prove Your Progress.</span>
            </div>
          </div>

          <div>
            <h4
              className={`text-xs font-semibold mb-4 tracking-wide ${
                isLanding ? 'text-slate-200' : 'text-slate-900'
              }`}
            >
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/challenges"
                  className={`transition-colors ${
                    isLanding ? 'text-slate-400 hover:text-cyan-300' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Coding Challenges
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`transition-colors ${
                    isLanding ? 'text-slate-400 hover:text-cyan-300' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Skill Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/skills"
                  className={`transition-colors ${
                    isLanding ? 'text-slate-400 hover:text-cyan-300' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Competency Tracking
                </Link>
              </li>
              <li>
                <Link
                  to="/reports"
                  className={`transition-colors ${
                    isLanding ? 'text-slate-400 hover:text-cyan-300' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Readiness Reports
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={`text-xs font-semibold mb-4 tracking-wide ${
                isLanding ? 'text-slate-200' : 'text-slate-900'
              }`}
            >
              Assessment Integrity
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isLanding
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className={isLanding ? 'text-slate-400' : 'text-slate-600'}>
                  Isolated code evaluation guarantees authentic test execution without solution leakage.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isLanding
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className={isLanding ? 'text-slate-400' : 'text-slate-600'}>
                  Consent-controlled report sharing with 64-char unguessable cryptographic tokens.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isLanding
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className={isLanding ? 'text-slate-400' : 'text-slate-600'}>
                  Strict anti-hallucination progressive AI guidance tier system.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`pt-6 border-t flex flex-col md:flex-row items-center justify-between text-xs gap-4 ${
            isLanding ? 'border-slate-800/80 text-slate-500' : 'border-slate-200/80 text-slate-500'
          }`}
        >
          <p>&copy; {new Date().getFullYear()} BugQuest AI. Built for real engineering skill progression.</p>
          <p className="text-center md:text-right max-w-xl text-slate-500">
            Assessment scores reflect observed empirical code execution on standardized challenges.
          </p>
        </div>
      </div>
    </footer>
  );
};
