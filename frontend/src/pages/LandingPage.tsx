import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Code2, 
  Layers, 
  Cpu, 
  Lock,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeHintLevel, setActiveHintLevel] = useState<'nudge' | 'direction' | 'debugging_guidance' | 'detailed_explanation'>('nudge');

  const demoHints = {
    nudge: {
      title: "Step 1: Conceptual Nudge",
      text: "Notice that for each number X, there is only one specific Y that satisfies X + Y = Target. What lookup structure lets you find Y in constant time?",
      badge: "No Solution Given"
    },
    direction: {
      title: "Step 2: Directional Guidance",
      text: "A nested loop takes O(N^2) time. Instead, as you iterate through the list, can you use a Hash Map (or JavaScript Map) to remember numbers you have already visited?",
      badge: "Points to Pattern"
    },
    debugging_guidance: {
      title: "Step 3: Debugging Guidance",
      text: "Common bug: inserting the current element into the map BEFORE checking for the complement! If Target = 6 and current number is 3, checking yourself could return [i, i].",
      badge: "Targets Specific Bug"
    },
    detailed_explanation: {
      title: "Step 4: Comprehensive Walkthrough",
      text: "Optimal Algorithm: Initialize an empty Map. Loop index i from 0 to N-1: let complement = target - nums[i]. If map has complement, return [map.get(complement), i]. Else map.set(nums[i], i). Time complexity O(N), Space complexity O(N).",
      badge: "Full Walkthrough"
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-slate-800/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-8 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Empirical Assessment & Progressive AI Debugging Coach
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Debug Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-500">
              Build Skills. Prove Your Progress.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            BugQuest AI pairs isolated, authentic code execution assessment with an AI coaching engine that gives progressive hints instead of spoiling answers. Generate shareable, evidence-backed workforce-readiness reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/challenges"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Start Debugging Challenges
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold transition-all"
            >
              Create Learner Account
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-14 pt-10 border-t border-slate-800/60 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Isolated Execution Sandbox</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private Hidden Test Cases</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>4-Tier Progressive Hints</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              <span>Verified Readiness Reports</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive AI Coach Demo */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Never Get Blocked. Never Get Spoiled.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Experience our 4-level progressive debugging coach. It analyzes error diagnostics and guides you through independent problem-solving step by step.
          </p>
        </div>

        <div className="quest-card p-6 md:p-8 max-w-4xl mx-auto border-indigo-500/20 bg-slate-900/90 glow-indigo">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Two Sum Target Finder</h3>
                <span className="text-xs text-slate-400">Error: Time Limit Exceeded on 10,000 items</span>
              </div>
            </div>

            {/* Hint level buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['nudge', 'direction', 'debugging_guidance', 'detailed_explanation'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveHintLevel(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeHintLevel === level
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level === 'debugging_guidance' ? 'Guidance' : level === 'detailed_explanation' ? 'Walkthrough' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {demoHints[activeHintLevel].title}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {demoHints[activeHintLevel].badge}
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
              {demoHints[activeHintLevel].text}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Pedagogical Principle: Hints graduate based on learner struggle and explicit request.</span>
            <Link to="/challenges" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Try in Workspace <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
              The Four Pillars of BugQuest AI
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Built from first principles for verifiable skill development without shortcuts or inflated metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="quest-card p-6 quest-card-hover">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">Isolated Assessment</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Code execution runs inside isolated runner environments with strict memory and time boundaries. Authentic test verdicts you can rely on.
              </p>
            </div>

            <div className="quest-card p-6 quest-card-hover">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">Progressive Coaching</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rather than giving solutions away, our AI acts like a senior staff engineer—nudging your thinking, testing assumptions, and teaching edge case analysis.
              </p>
            </div>

            <div className="quest-card p-6 quest-card-hover">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">Evidence-Based Tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scores are calculated strictly from verified test outcomes across topics like Arrays, Two Pointers, Stacks, and Hash Maps. Never arbitrary badges.
              </p>
            </div>

            <div className="quest-card p-6 quest-card-hover">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-5">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">Consent-Driven Reports</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate clean, professional workforce-readiness reports. Share with educators or reviewers using revocable, tamper-resistant 64-character tokens.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Assessment Integrity Notice */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">Ethical Assessment & Fair Evaluation</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              BugQuest AI maintains transparent boundaries: the code judge is the sole authority on correctness, while the AI functions strictly as an educational mentor. We never infer unvalidated personal traits, personality, or commercial job guarantees from coding tests.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to upgrade your engineering skills?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-8">
            Solve curated challenges, inspect errors with an AI coach, and establish a verifiable track record of technical competence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/challenges"
              className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Explore Challenge Library
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
