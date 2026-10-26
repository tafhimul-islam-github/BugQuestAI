import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Terminal,
  CheckCircle2,
  BrainCircuit,
  Fingerprint
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeHintLevel, setActiveHintLevel] = useState<'nudge' | 'direction' | 'debugging_guidance' | 'detailed_explanation'>('nudge');

  const demoHints = {
    nudge: {
      step: '01',
      title: 'Conceptual Nudge',
      text: 'Notice that for each number X, there is only one specific Y that satisfies X + Y = Target. What lookup structure lets you query Y in O(1) constant time instead of re-scanning?',
      tag: 'No Solution Spoilers',
      tone: 'Socratic Inquiry',
      color: 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10'
    },
    direction: {
      step: '02',
      title: 'Directional Guidance',
      text: 'A nested loop costs O(N²) time. As you iterate linearly through the array, can you record the numbers you have already visited inside a Hash Map (or JS Map) alongside their indices?',
      tag: 'Pattern Identification',
      tone: 'Algorithmic Strategy',
      color: 'border-sky-500/30 text-sky-300 bg-sky-500/10'
    },
    debugging_guidance: {
      step: '03',
      title: 'Edge-Case Diagnosis',
      text: 'Common bug detected: inserting the current element into the map BEFORE checking for the complement! If Target = 6 and current number is 3, checking the map first would match the element with itself, returning [i, i].',
      tag: 'Pinpointed Fault',
      tone: 'Failure Diagnostics',
      color: 'border-amber-500/30 text-amber-300 bg-amber-500/10'
    },
    detailed_explanation: {
      step: '04',
      title: 'Optimal Walkthrough',
      text: 'Optimal Algorithm: Initialize an empty Map. Loop index i from 0 to N-1: let complement = target - nums[i]. If map has complement, return [map.get(complement), i]. Else map.set(nums[i], i). Time: O(N), Space: O(N).',
      tag: 'Post-Attempt Review',
      tone: 'Canonical Solution',
      color: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32 border-b border-white/[0.06]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Architecture Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md shadow-glow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Engineering Assessment & AI Debugging Sandbox</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
            Debug Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-100 to-indigo-400">
              Build Skills. Prove Your Progress.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            BugQuest AI pairs <span className="text-slate-200 font-medium">isolated code execution assessment</span> with a 4-tier pedagogical AI coach that refuses to spoil solutions. Track verified algorithmic evidence and export consent-controlled readiness reports.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              to="/challenges"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-glow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <Terminal className="w-4 h-4" />
              <span>Explore Challenge Library</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] bg-obsidian-850/80 hover:bg-obsidian-800 hover:border-white/[0.2] text-slate-200 font-semibold text-sm transition-all"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          {/* System Guarantees Bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center justify-center gap-2 py-1">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Subprocess Sandbox</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private Test Isolation</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <BrainCircuit className="w-4 h-4 text-sky-400" />
              <span>4-Tier Pedagogical Hints</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span>Cryptographic Dossiers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Progressive Coach Showcase */}
      <section className="py-20 bg-obsidian-900/60 border-b border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              Pedagogical Coaching Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI Debugging that Teaches, Not Spoils
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Unlike generic LLM wrappers that dump complete code solutions, BugQuest unlocks progressive tiers tailored to the exact failure point in your test cases.
            </p>
          </div>

          {/* Interactive Tier Switcher */}
          <div className="max-w-4xl mx-auto quest-card p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">coaching_session_two_sum.py</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>AI Coach: Active</span>
              </div>
            </div>

            {/* Level Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {(['nudge', 'direction', 'debugging_guidance', 'detailed_explanation'] as const).map((level) => {
                const info = demoHints[level];
                const active = activeHintLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => setActiveHintLevel(level)}
                    className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all ${
                      active
                        ? 'border-indigo-500/50 bg-indigo-500/15 text-white shadow-glow-sm'
                        : 'border-white/[0.06] bg-obsidian-950/60 text-slate-400 hover:border-white/[0.12] hover:text-slate-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-indigo-400 font-semibold mb-0.5">
                      TIER {info.step}
                    </span>
                    <span className="font-semibold truncate">{info.title.split(':')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tier Output Card */}
            <div className="rounded-xl border border-white/[0.08] bg-obsidian-950/90 p-5 sm:p-6 transition-all">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${demoHints[activeHintLevel].color}`}>
                    {demoHints[activeHintLevel].tag}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Mode: {demoHints[activeHintLevel].tone}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">Tier {demoHints[activeHintLevel].step} of 04</span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {demoHints[activeHintLevel].text}
              </p>

              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Preserves learner discovery & cognitive struggle
                </span>
                <span className="font-mono text-[11px] text-slate-500">Zero Answer Leakage</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Bento Grid Feature Matrix */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              Engineered for Production
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Everything Needed for Genuine Code Verification
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 */}
            <div className="quest-card p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Multi-Adapter Code Judge</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Executes learner submissions in an isolated sandbox subprocess. Memory constraints, execution timeouts, and strict security guards isolate untrusted code.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-indigo-300">
                <span>Supports Python 3 & JS (V8)</span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="quest-card p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Private Hidden Boundary Tests</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Public examples verify basic functionality. Private hidden test cases evaluate extreme bounds, negative indices, and adversarial edge cases without client leakage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-emerald-300">
                <span>Tamper-Resistant Verification</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="quest-card p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Cryptographic Share Dossiers</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Learners generate shareable workforce dossiers with 64-character unguessable cryptographic tokens, privacy toggles, and instant revocation for technical recruiters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-amber-300">
                <span>Instant Revocable Access</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 border-t border-white/[0.06] bg-gradient-to-b from-obsidian-900 to-obsidian-950 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to Prove Your Algorithmic Competency?
          </h3>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Access authentic coding challenges, progressive debugging assistance, and real-time skill evidence today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/challenges"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-glow-md transition-all duration-200 hover:scale-[1.02]"
            >
              Start Practice Session
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-white/[0.1] bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
