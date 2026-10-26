import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Cpu, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-obsidian-950 text-slate-400 py-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">BugQuest <span className="text-indigo-400">AI</span></span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              AI-powered coding assessment, isolated subprocess runtime evaluation, progressive debugging coaching, and verifiable workforce-readiness dossiers.
            </p>
            <p className="text-[11px] font-mono text-indigo-300 font-medium">
              Debug Smarter. Build Skills. Prove Your Progress.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-mono font-semibold text-slate-300 mb-3 tracking-wider uppercase">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/challenges" className="hover:text-white transition-colors">Coding Challenges</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Skill Dashboard</Link></li>
              <li><Link to="/skills" className="hover:text-white transition-colors">Evidence Tracking</Link></li>
              <li><Link to="/reports" className="hover:text-white transition-colors">Readiness Reports</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-mono font-semibold text-slate-300 mb-3 tracking-wider uppercase">Assessment Integrity</h4>
            <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Isolated code evaluation guarantees authentic test execution without answer leaking.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Consent-controlled report sharing with 64-char unguessable cryptographic tokens.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
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
