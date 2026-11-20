import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/90 bg-white text-slate-600 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <BrandLogo size="sm" />
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
                BugQuest <span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Real-codebase debugging assessments powered by isolated subprocess runtimes, Socratic multi-tier coaching, and verifiable developer readiness dossiers.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Debug Smarter. Build Skills. Prove Your Progress.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-4 tracking-wide">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/challenges" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Coding Challenges
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Skill Dashboard
                </Link>
              </li>
              <li>
                <Link to="/skills" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Competency Tracking
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Readiness Reports
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-4 tracking-wide">Assessment Integrity</h4>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span>Isolated code evaluation guarantees authentic test execution without solution leakage.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>Consent-controlled report sharing with 64-char unguessable cryptographic tokens.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Strict anti-hallucination progressive AI guidance tier system.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} BugQuest AI. Built for real engineering skill progression.</p>
          <p className="text-center md:text-right max-w-xl text-slate-500">
            Assessment scores reflect observed empirical code execution on standardized challenges.
          </p>
        </div>
      </div>
    </footer>
  );
};
