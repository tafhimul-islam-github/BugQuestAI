import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 font-sans">
      <div className="quest-card p-8 sm:p-12 max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-glow-sm">
          <Terminal className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">404</h1>
        <h2 className="text-base font-bold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The page or challenge you are looking for does not exist or has been relocated.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-sm transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            to="/challenges"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.1] bg-obsidian-900 text-slate-200 hover:text-white font-semibold text-xs transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
