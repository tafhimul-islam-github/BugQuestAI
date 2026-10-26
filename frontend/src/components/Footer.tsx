import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Cpu, Lock, ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/90 bg-white text-slate-600 py-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-blue-sm">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                BugQuest <span className="text-blue-600">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Enterprise-grade AI coding assessment platform. Isolated subprocess runtimes, progressive multi-tier coaching, and verifiable developer readiness dossiers.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-xs font-medium text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Debug Smarter. Build Skills. Prove Your Progress.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-3.5 tracking-wider uppercase">Platform Navigation</h4>
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
            <h4 className="text-xs font-semibold text-slate-900 mb-3.5 tracking-wider uppercase">Assessment Integrity</h4>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100 shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span>Isolated code evaluation guarantees authentic test execution without solution leakage.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>Consent-controlled report sharing with 64-char unguessable cryptographic tokens.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Strict anti-hallucination progressive AI guidance tier system.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} BugQuest AI. Built for real engineering skill progression.
          </p>
          <p className="text-center md:text-right max-w-xl text-slate-500">
            Assessment scores reflect observed empirical code execution on standardized challenges.
          </p>
        </div>
      </div>
    </footer>
  );
};
