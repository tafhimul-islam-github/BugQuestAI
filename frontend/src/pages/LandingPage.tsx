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
  Fingerprint,
  Code2,
  TrendingUp,
  Award,
  Zap
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
      badgeColor: 'border-blue-200 bg-blue-50 text-blue-700'
    },
    direction: {
      step: '02',
      title: 'Directional Guidance',
      text: 'A nested loop costs O(N²) time. As you iterate linearly through the array, can you record the numbers you have already visited inside a Hash Map (or JS Map) alongside their indices?',
      tag: 'Pattern Identification',
      tone: 'Algorithmic Strategy',
      badgeColor: 'border-cyan-200 bg-cyan-50 text-cyan-800'
    },
    debugging_guidance: {
      step: '03',
      title: 'Edge-Case Diagnosis',
      text: 'Common bug detected: inserting the current element into the map BEFORE checking for the complement! If Target = 6 and current number is 3, checking the map first would match the element with itself, returning [i, i].',
      tag: 'Pinpointed Fault',
      tone: 'Failure Diagnostics',
      badgeColor: 'border-amber-200 bg-amber-50 text-amber-800'
    },
    detailed_explanation: {
      step: '04',
      title: 'Optimal Walkthrough',
      text: 'Optimal Algorithm: Initialize an empty Map. Loop index i from 0 to N-1: let complement = target - nums[i]. If map has complement, return [map.get(complement), i]. Else map.set(nums[i], i). Time: O(N), Space: O(N).',
      tag: 'Post-Attempt Review',
      tone: 'Canonical Solution',
      badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-800'
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-blue-50/20 to-[#f8fafc]">
        {/* Soft Ambient Radial Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Architecture Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Enterprise-Grade Coding Assessment & AI Debugging Sandbox</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Debug Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              Build Skills. Prove Your Progress.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            BugQuest AI pairs <span className="text-slate-900 font-semibold">isolated subprocess runtime evaluation</span> with a 4-tier pedagogical AI coach that refuses to spoil solutions. Track verified algorithmic evidence and generate tamper-proof readiness dossiers.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              to="/challenges"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-blue-sm hover:shadow-blue-md transition-all duration-150"
            >
              <Terminal className="w-4 h-4" />
              <span>Explore Challenge Library</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          {/* System Guarantees Bar */}
          <div className="mt-16 pt-8 border-t border-slate-200/80 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/70 border border-slate-200/60 shadow-xs">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Subprocess Sandbox</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/70 border border-slate-200/60 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Private Test Isolation</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/70 border border-slate-200/60 shadow-xs">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <span>4-Tier Pedagogical Hints</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/70 border border-slate-200/60 shadow-xs">
              <Fingerprint className="w-4 h-4 text-amber-600" />
              <span>Cryptographic Dossiers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Progressive Coach Showcase */}
      <section className="py-20 bg-white border-b border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200/60">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Pedagogical Coaching Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Debugging that Teaches, Not Spoils
            </h2>
            <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
              Unlike generic LLM wrappers that dump copy-paste solutions, BugQuest unlocks progressive tiers calibrated to your specific execution failure.
            </p>
          </div>

          {/* Interactive Tier Switcher */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 sm:p-8 shadow-card relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-medium text-slate-600 ml-2">coaching_session_two_sum.py</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>AI Coach: Active</span>
              </div>
            </div>

            {/* Level Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {(['nudge', 'direction', 'debugging_guidance', 'detailed_explanation'] as const).map((level) => {
                const info = demoHints[level];
                const active = activeHintLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => setActiveHintLevel(level)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border text-xs transition-all duration-150 ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white shadow-blue-sm font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <span className={`font-mono text-[10px] font-bold mb-0.5 ${active ? 'text-blue-100' : 'text-blue-600'}`}>
                      TIER {info.step}
                    </span>
                    <span className="truncate">{info.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tier Output Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${demoHints[activeHintLevel].badgeColor}`}>
                    {demoHints[activeHintLevel].tag}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Mode: {demoHints[activeHintLevel].tone}
                  </span>
                </div>
                <span className="text-xs font-mono font-medium text-slate-500">Tier {demoHints[activeHintLevel].step} of 04</span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {demoHints[activeHintLevel].text}
              </p>

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Preserves discovery and engineering struggle
                </span>
                <span className="font-mono text-[11px] text-slate-400 font-medium">Zero Answer Leakage</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Bento Grid Feature Matrix */}
      <section className="py-24 bg-[#f8fafc] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200/60">
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Engineered for Production</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything Needed for Genuine Code Verification
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Built from the ground up for strict sandboxed evaluation, reproducible test execution, and verifiable competency tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5 shadow-xs">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Adapter Code Judge</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Executes learner submissions in an isolated subprocess. Strict memory constraints, execution timeouts, and syscall safety barriers prevent environment compromise.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700">
                <Terminal className="w-3.5 h-3.5" />
                <span>Supports Python 3 & JS (V8)</span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-card hover:shadow-card-hover hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Private Hidden Boundary Tests</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Public examples verify basic functionality. Private hidden test cases evaluate extreme bounds, negative indices, and adversarial edge cases without client leakage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tamper-Resistant Verification</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-card hover:shadow-card-hover hover:border-amber-200 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 shadow-xs">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Cryptographic Share Dossiers</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Learners generate shareable workforce dossiers with 64-character unguessable cryptographic tokens, privacy toggles, and instant revocation for technical recruiters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-700">
                <Award className="w-3.5 h-3.5" />
                <span>Instant Revocable Access</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 border-t border-slate-200 bg-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Start Building Verified Competency</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Ready to Prove Your Algorithmic Competency?
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto mb-8">
            Access authentic coding challenges, progressive debugging assistance, and real-time skill evidence today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/challenges"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-blue-sm transition-all duration-150"
            >
              Start Practice Session
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
