import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Terminal,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Fingerprint,
  Award,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { HeroSandbox3D } from '../components/HeroSandbox3D';
import {
  SandboxIsolationVector,
  HiddenTestMatrixVector,
  CryptoDossierVector,
} from '../components/VectorIllustrations';

type HintTierKey = 'nudge' | 'direction' | 'debugging_guidance' | 'detailed_explanation';

interface DemoHint {
  step: string;
  title: string;
  text: string;
  tag: string;
  tone: string;
  highlightLine: number;
  badgeClass: string;
}

const DEMO_HINTS: Record<HintTierKey, DemoHint> = {
  nudge: {
    step: '01',
    title: 'Conceptual Nudge',
    text: 'For every number X you inspect, there is only one complement Y that satisfies X + Y = target. What lookup structure lets you query Y in O(1) constant time instead of re-scanning the array?',
    tag: 'No Spoilers',
    tone: 'Socratic Inquiry',
    highlightLine: 3,
    badgeClass: 'border-blue-400/30 bg-blue-500/15 text-blue-300',
  },
  direction: {
    step: '02',
    title: 'Directional Guidance',
    text: 'As you iterate linearly through nums, record each visited value and its index in a dictionary. Check for target - num before moving to the next index.',
    tag: 'Pattern Strategy',
    tone: 'Algorithmic Direction',
    highlightLine: 4,
    badgeClass: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-300',
  },
  debugging_guidance: {
    step: '03',
    title: 'Edge-Case Diagnosis',
    text: 'Line 5 inserts nums[i] into seen BEFORE checking for complement. When target = 6 and nums[i] = 3, the lookup matches the current element with itself and returns [i, i].',
    tag: 'Pinpointed Fault',
    tone: 'Failure Diagnostics',
    highlightLine: 5,
    badgeClass: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
  },
  detailed_explanation: {
    step: '04',
    title: 'Optimal Walkthrough',
    text: 'Swap the order inside the loop: compute comp = target - num, check if comp in seen and return [seen[comp], i], and only afterward store seen[num] = i. Runs in O(n) time and O(n) space.',
    tag: 'Post-Attempt Review',
    tone: 'Canonical Fix',
    highlightLine: 6,
    badgeClass: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
  },
};

const CODE_LINES = [
  'def two_sum(nums: list[int], target: int) -> list[int]:',
  '    seen: dict[int, int] = {}',
  '    for i, num in enumerate(nums):',
  '        comp = target - num',
  '        seen[num] = i  # Bug: stored before lookup',
  '        if comp in seen:',
  '            return [seen[comp], i]',
  '    return []',
];

/* Shared scroll-reveal ease */
const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const LandingPage: React.FC = () => {
  const [activeHintLevel, setActiveHintLevel] = useState<HintTierKey>('nudge');
  const activeHint = DEMO_HINTS[activeHintLevel];

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900 flex flex-col">
      {/* Asymmetric Split Hero with Interactive 3D Sandbox Core */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#f6f8fc] to-[#f6f8fc]">
        {/* Subtle Architectural Grid Backdrop */}
        <div className="absolute inset-0 bg-grid-pattern opacity-65 pointer-events-none" />
        <div
          aria-hidden="true"
          className="absolute -top-32 right-0 w-[640px] h-[420px] bg-gradient-to-bl from-blue-100/70 via-cyan-50/40 to-transparent blur-3xl rounded-full pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left: Crisp Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: REVEAL_EASE }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white/90 text-slate-700 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Isolated Subprocess Judge &amp; Socratic AI Coach</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#0b1221] tracking-[-0.03em] leading-[1.08]">
                Debug real codebases. Prove your engineering skill.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                BugQuest AI pairs isolated subprocess test execution with a 4-tier pedagogical coach that guides your investigation without handing over answers. Build verifiable, consent-governed readiness dossiers from real fixes.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/challenges"
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-blue-sm hover:shadow-blue-md transition-all duration-200"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Explore Challenges</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 font-semibold text-sm shadow-xs transition-all"
                >
                  <span>Create Free Account</span>
                </Link>
              </div>

              {/* Compact Proof Metrics */}
              <div className="pt-6 mt-2 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <p className="font-display text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">4 Tiers</p>
                  <p className="text-xs text-slate-500 mt-0.5">Zero-spoiler coaching</p>
                </div>
                <div>
                  <p className="font-display text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">100%</p>
                  <p className="text-xs text-slate-500 mt-0.5">Hidden test isolation</p>
                </div>
                <div>
                  <p className="font-display text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">64-char</p>
                  <p className="text-xs text-slate-500 mt-0.5">Revocable proof tokens</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Interactive 3D Sandbox Core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: REVEAL_EASE }}
              className="lg:col-span-6"
            >
              <HeroSandbox3D />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Progressive AI Coach Simulator ─── */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.6, ease: REVEAL_EASE }}
        className="py-20 sm:py-24 bg-white border-b border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: REVEAL_EASE }}
            className="max-w-2xl mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              AI debugging that teaches instead of spoiling
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Generic assistants paste full solutions on the first prompt. BugQuest unlocks progressive coaching tiers anchored directly to your failing execution trace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.65, delay: 0.1, ease: REVEAL_EASE }}
            className="rounded-3xl bg-[#0b1221] border border-slate-800 shadow-obsidian overflow-hidden"
          >
            {/* Console Header */}
            <div className="px-5 sm:px-7 py-4 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="font-mono text-xs text-slate-300 ml-2">services/two_sum.py</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AssertionError: expected [1, 2], got [0, 0]</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Pane: Code Inspector */}
              <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800/90 bg-[#0d1526]">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
                  <span>Source Inspector</span>
                  <span className="text-cyan-400">Line {activeHint.highlightLine} focused</span>
                </div>
                <pre className="font-mono text-xs leading-6 overflow-x-auto">
                  {CODE_LINES.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isFocused = lineNum === activeHint.highlightLine;
                    const isBugLine = lineNum === 5;
                    return (
                      <div
                        key={lineNum}
                        className={`flex items-center gap-3 px-2.5 py-0.5 rounded-md transition-colors duration-200 ${
                          isFocused
                            ? isBugLine
                              ? 'bg-rose-500/15 border-l-2 border-rose-400 text-rose-100'
                              : 'bg-blue-500/15 border-l-2 border-cyan-400 text-white'
                            : 'text-slate-400 border-l-2 border-transparent'
                        }`}
                      >
                        <span className="w-4 text-right text-slate-600 select-none shrink-0">
                          {lineNum}
                        </span>
                        <code className="whitespace-pre">{line}</code>
                      </div>
                    );
                  })}
                </pre>
              </div>

              {/* Right Pane: 4-Tier Coach Switcher */}
              <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between">
                <div>
                  {/* Animated Tier Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {(['nudge', 'direction', 'debugging_guidance', 'detailed_explanation'] as const).map(
                      (level) => {
                        const info = DEMO_HINTS[level];
                        const active = activeHintLevel === level;
                        return (
                          <button
                            type="button"
                            key={level}
                            onClick={() => setActiveHintLevel(level)}
                            className={`relative text-left p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                              active
                                ? 'border-blue-400/50 text-white'
                                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="coach-tier-pill"
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/35 to-cyan-500/20 border border-blue-400/40 -z-0"
                              />
                            )}
                            <span className="relative z-10 block font-mono text-[10px] font-semibold text-cyan-300 mb-0.5">
                              Tier {info.step}
                            </span>
                            <span className="relative z-10 block font-semibold truncate">{info.title}</span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Animated Hint Body */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeHintLevel}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${activeHint.badgeClass}`}
                          >
                            {activeHint.tag}
                          </span>
                          <span className="text-xs text-slate-400">{activeHint.tone}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          Tier {activeHint.step} / 04
                        </span>
                      </div>
                      <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed">
                        {activeHint.text}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Preserves genuine discovery and debugging judgment
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">Zero answer leakage</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── Architectural Capabilities with Bespoke Animated Vectors ─── */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: REVEAL_EASE }}
        className="py-20 sm:py-24 bg-[#f6f8fc]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: REVEAL_EASE }}
            className="max-w-2xl mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Built for authentic code verification
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Every submission runs through isolated sandboxes, private edge-case suites, and empirical competency scoring.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0, ease: REVEAL_EASE }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-blue-300/80 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="mb-5 rounded-xl overflow-hidden border border-slate-200/70">
                  <SandboxIsolationVector className="w-full h-32" />
                </div>
                <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold mb-2">
                  <Cpu className="w-4 h-4" />
                  <span>Runtime Isolation</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                  Multi-Adapter Code Judge
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Executes learner code in an isolated subprocess with strict memory limits, execution timeouts, and syscall barriers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Python 3 &amp; JavaScript (V8)</span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.12, ease: REVEAL_EASE }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-emerald-300/80 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="mb-5 rounded-xl overflow-hidden border border-slate-200/70">
                  <HiddenTestMatrixVector className="w-full h-32" />
                </div>
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Boundary Verification</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                  Private Hidden Test Matrix
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Public examples check basic flow while server-side hidden suites verify adversarial inputs and edge bounds without client exposure.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tamper-resistant scoring</span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: 0.24, ease: REVEAL_EASE }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-amber-300/80 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="mb-5 rounded-xl overflow-hidden border border-slate-200/70">
                  <CryptoDossierVector className="w-full h-32" />
                </div>
                <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold mb-2">
                  <Fingerprint className="w-4 h-4" />
                  <span>Workforce Proof</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                  Cryptographic Readiness Dossiers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Share verified debugging competency with hiring teams using 64-character unguessable tokens, granular consent toggles, and one-click revocation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant revocable access</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── High-Contrast Obsidian CTA Card ─── */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: REVEAL_EASE }}
        className="py-16 sm:py-20 bg-white border-t border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-[#0b1221] border border-slate-800 p-8 sm:p-12 lg:p-14 overflow-hidden shadow-obsidian">
            <div className="absolute inset-0 bg-dark-grid opacity-60 pointer-events-none" />
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-blue-600/25 blur-3xl pointer-events-none"
            />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Ready to step into the debugging sandbox?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
                  Pick a real-codebase defect ticket, run isolated tests, and build empirical proof of your problem-solving skills.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  to="/challenges"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-blue-md transition-all"
                >
                  <span>Start Practice Session</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold text-sm transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
