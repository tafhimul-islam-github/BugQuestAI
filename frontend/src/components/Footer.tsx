import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-[#080c15] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">BugQuest <span className="text-indigo-400">AI</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              AI-powered coding assessment, progressive debugging coaching, and verifiable workforce-readiness verification.
            </p>
            <p className="text-xs text-indigo-400 font-semibold tracking-wide">
              Debug Smarter. Build Skills. Prove Your Progress.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 tracking-wider uppercase text-xs">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/challenges" className="hover:text-white transition-colors">Coding Challenges</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Skill Dashboard</Link></li>
              <li><Link to="/skills" className="hover:text-white transition-colors">Evidence Tracking</Link></li>
              <li><Link to="/reports" className="hover:text-white transition-colors">Readiness Reports</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 tracking-wider uppercase text-xs">Assessment Integrity</h4>
            <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Isolated code evaluation guarantees authentic test execution.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Consent-controlled report sharing with instant token revocation.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} BugQuest AI. Built for real engineering skill progression.
          </p>
          <p className="text-center md:text-right max-w-xl text-slate-400">
            Assessment scores reflect observed empirical code execution on standardized challenges. BugQuest AI metrics do not guarantee employment outcomes or represent unvalidated measures of human competence.
          </p>
        </div>
      </div>
    </footer>
  );
};
