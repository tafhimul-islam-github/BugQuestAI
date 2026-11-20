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
  ChevronDown,
  Sparkles,
  FileCode2,
  Mic,
  History,
  Flame,
  Github,
  Video,
  GraduationCap,
} from 'lucide-react';
import { HeroSandbox3D } from '../components/HeroSandbox3D';
import { ScrollReactiveCube } from '../components/ScrollReactiveCube';
import { Scroll3DSection } from '../components/Scroll3DSection';
import { SpotlightCard } from '../components/SpotlightCard';
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
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  direction: {
    step: '02',
    title: 'Directional Guidance',
    text: 'As you iterate linearly through nums, record each visited value and its index in a dictionary. Check for target - num before moving to the next index.',
    tag: 'Pattern Strategy',
    tone: 'Algorithmic Direction',
    highlightLine: 4,
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  debugging_guidance: {
    step: '03',
    title: 'Edge-Case Diagnosis',
    text: 'Line 5 inserts nums[i] into seen BEFORE checking for complement. When target = 6 and nums[i] = 3, the lookup matches the current element with itself and returns [i, i].',
    tag: 'Pinpointed Fault',
    tone: 'Failure Diagnostics',
    highlightLine: 5,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  detailed_explanation: {
    step: '04',
    title: 'Optimal Walkthrough',
    text: 'Swap the order inside the loop: compute comp = target - num, check if comp in seen and return [seen[comp], i], and only afterward store seen[num] = i. Runs in O(n) time and O(n) space.',
    tag: 'Post-Attempt Review',
    tone: 'Canonical Fix',
    highlightLine: 6,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
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

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CapabilityItem {
  title: string;
  category: 'ide' | 'ai' | 'teams';
  tag: string;
  description: string;
  route: string;
  cta: string;
  icon: React.ElementType;
  accentClass: string;
}

const PLATFORM_CAPABILITIES: CapabilityItem[] = [
  {
    title: 'Multi-File Monaco Debugging IDE',
    category: 'ide',
    tag: 'Workspace',
    description:
      'Investigate real multi-file repositories with bug tickets, file explorer, diff view, and one-click sandbox test execution.',
    route: '/challenges',
    cta: 'Open Library',
    icon: FileCode2,
    accentClass: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    title: '4-Tier Socratic AI & Voice Coach',
    category: 'ai',
    tag: 'FastAPI + RAG',
    description:
      'Progressive hints (Nudge → Direction → Diagnosis → Walkthrough) plus hands-free Voice Coaching anchored to live errors with 0% spoiler leakage.',
    route: '/challenges',
    cta: 'Try Coach',
    icon: Mic,
    accentClass: 'bg-violet-50 text-violet-600 border-violet-200',
  },
  {
    title: 'Time-Travel, APM Traces & State Graph',
    category: 'ide',
    tag: 'Observability',
    description:
      'Replay execution state step-by-step, inspect distributed APM span latencies, and explore interactive variable state graphs.',
    route: '/challenges',
    cta: 'Explore Tools',
    icon: History,
    accentClass: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  {
    title: 'Chaos Testing & Post-Mortem Review',
    category: 'ai',
    tag: 'Resilience',
    description:
      'Stress-test fixes against automated chaos/fuzz boundary injectors and document root causes in structured incident post-mortems.',
    route: '/challenges',
    cta: 'Run Chaos Suite',
    icon: Flame,
    accentClass: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    title: 'Bring-Your-Own-Bug (GitHub Import)',
    category: 'teams',
    tag: 'BYOB Pipeline',
    description:
      'Turn real GitHub issues and repositories directly into interactive, sandboxed debugging quests for classes or hiring loops.',
    route: '/challenges',
    cta: 'Import Bug',
    icon: Github,
    accentClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    title: 'Live Technical Interview Rooms',
    category: 'teams',
    tag: 'Real-Time',
    description:
      'Conduct structured live debugging interviews with synchronized editor state, sandbox verification, and candidate competency notes.',
    route: '/login',
    cta: 'Launch Session',
    icon: Video,
    accentClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    title: 'Empirical Skill Matrix & Learning Path',
    category: 'ai',
    tag: 'Analytics',
    description:
      'Track verified algorithmic & debugging mastery strictly from passing sandbox runs, paired with personalized next-quest recommendations.',
    route: '/dashboard',
    cta: 'View Dashboard',
    icon: TrendingUp,
    accentClass: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    title: 'Educator Portal, Admin & Crypto Dossiers',
    category: 'teams',
    tag: 'Governance',
    description:
      'Manage classrooms, assignments, audit logs, and share 64-character revocable cryptographic workforce readiness reports.',
    route: '/reports',
    cta: 'Inspect Dossier',
    icon: GraduationCap,
    accentClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

export const LandingPage: React.FC = () => {
  const [activeHintLevel, setActiveHintLevel] = useState<HintTierKey>('nudge');
  const [isTourTriggered, setIsTourTriggered] = useState<boolean>(false);
  const [capabilityFilter, setCapabilityFilter] = useState<'all' | 'ide' | 'ai' | 'teams'>('all');
  const activeHint = DEMO_HINTS[activeHintLevel];

  const filteredCapabilities =
    capabilityFilter === 'all'
      ? PLATFORM_CAPABILITIES
      : PLATFORM_CAPABILITIES.filter((c) => c.category === capabilityFilter);

  const handleScrollTo3D = () => {
    setIsTourTriggered(true);
    const el = document.getElementById('cube-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Asymmetric Split Hero — Pure Light Architectural Studio */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#f8fafc] to-[#f4f7fb]">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div
          aria-hidden="true"
          className="absolute -top-28 right-0 w-[680px] h-[440px] bg-gradient-to-bl from-blue-100/75 via-indigo-50/45 to-transparent blur-3xl rounded-full pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: REVEAL_EASE }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white text-slate-700 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Isolated Subprocess Judge &amp; Socratic AI Coach</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 tracking-[-0.03em] leading-[1.08]">
                Debug real codebases. Prove your engineering skill.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                BugQuest AI pairs isolated subprocess test execution with a 4-tier pedagogical coach that guides your investigation without handing over answers. Build verifiable, consent-governed readiness dossiers from real fixes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/challenges"
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-blue-sm hover:shadow-blue-md transition-all duration-200"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Explore Challenges</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>

                <button
                  type="button"
                  onClick={handleScrollTo3D}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-800 font-semibold text-sm shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-600 transition-transform group-hover:rotate-12" />
                  <span>Interactive 3D Tour</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Proof Metrics Strip */}
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

            {/* Right Column: Interactive Light Glassmorphic 3D IDE & Sandbox Stack */}
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

      {/* 4-Step Engineering Workflow Strip */}
      <section className="bg-white border-b border-slate-200/80 py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Inspect Defect Ticket', desc: 'Read symptoms & failing logs' },
              { step: '02', title: 'Edit Multi-File Repo', desc: 'Trace root cause in Monaco IDE' },
              { step: '03', title: 'Verify Hidden Suite', desc: 'Run isolated subprocess judge' },
              { step: '04', title: 'Export Crypto Dossier', desc: 'Share revocable skill proof' },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-3.5 px-4 py-3 rounded-2xl bg-[#f8fafc] border border-slate-200/80"
              >
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/80 px-2 py-1 rounded-lg shrink-0">
                  {item.step}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll-Reactive 4-Stage Light 3D Cube Showcase */}
      <div id="cube-showcase" className="relative">
        <ScrollReactiveCube autoTourTrigger={isTourTriggered} />
      </div>

      {/* Interactive Progressive AI Coach Simulator with 3D Scroll Reveal (Pure Light Mode) */}
      <section className="py-20 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              AI debugging that teaches instead of spoiling
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Generic assistants paste full solutions on the first prompt. BugQuest unlocks progressive coaching tiers anchored directly to your failing execution trace.
            </p>
          </div>

          <Scroll3DSection tilt={7} lift={32}>
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.12),0_8px_24px_-12px_rgba(15,23,42,0.06)] overflow-hidden">
              {/* Light Realistic Editor Header */}
              <div className="px-5 sm:px-7 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-xs text-slate-700">
                    <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>services/two_sum.py</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-mono text-rose-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>AssertionError: expected [1, 2], got [0, 0]</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Pane: Light Code Inspector */}
                <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-[#f8fafc]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-3">
                    <span className="font-semibold text-slate-700">Source Inspector</span>
                    <span className="text-blue-600 font-medium">Line {activeHint.highlightLine} focused</span>
                  </div>
                  <pre className="font-mono text-xs leading-6 overflow-x-auto bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
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
                                ? 'bg-rose-50 border-l-2 border-rose-500 text-rose-900 font-medium'
                                : 'bg-blue-50 border-l-2 border-blue-600 text-slate-900 font-medium'
                              : 'text-slate-600 border-l-2 border-transparent'
                          }`}
                        >
                          <span className="w-4 text-right text-slate-400 select-none shrink-0">
                            {lineNum}
                          </span>
                          <code className="whitespace-pre">{line}</code>
                        </div>
                      );
                    })}
                  </pre>
                </div>

                {/* Right Pane: 4-Tier Coach Switcher */}
                <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between bg-white">
                  <div>
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
                                  ? 'border-blue-300 text-blue-950'
                                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="coach-tier-pill"
                                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                  className="absolute inset-0 rounded-xl bg-blue-50 border border-blue-300 shadow-xs"
                                />
                              )}
                              <span
                                className={`relative z-10 block font-mono text-[10px] font-semibold mb-0.5 ${
                                  active ? 'text-blue-600' : 'text-slate-400'
                                }`}
                              >
                                Tier {info.step}
                              </span>
                              <span className="relative z-10 block font-semibold truncate">{info.title}</span>
                            </button>
                          );
                        }
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeHintLevel}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="rounded-2xl border border-slate-200/90 bg-[#f8fafc] p-5 sm:p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${activeHint.badgeClass}`}
                            >
                              {activeHint.tag}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{activeHint.tone}</span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 font-medium">
                            Tier {activeHint.step} / 04
                          </span>
                        </div>
                        <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                          {activeHint.text}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Preserves genuine discovery and debugging judgment
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">Zero answer leakage</span>
                  </div>
                </div>
              </div>
            </div>
          </Scroll3DSection>
        </div>
      </section>

      {/* Architectural Capabilities Grid with Light Animated Vectors & 3D Scroll Reveal */}
      <section className="py-20 sm:py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Built for authentic code verification
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Every submission runs through isolated sandboxes, private edge-case suites, and empirical competency scoring.
            </p>
          </div>

          <Scroll3DSection tilt={6} lift={26}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SpotlightCard
                spotlightColor="rgba(37, 99, 235, 0.08)"
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-blue-300/80 transition-colors"
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
              </SpotlightCard>

              <SpotlightCard
                spotlightColor="rgba(16, 185, 129, 0.08)"
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-emerald-300/80 transition-colors"
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
              </SpotlightCard>

              <SpotlightCard
                spotlightColor="rgba(217, 119, 6, 0.08)"
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:border-amber-300/80 transition-colors"
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
              </SpotlightCard>
            </div>
          </Scroll3DSection>
        </div>
      </section>

      {/* Complete Platform Capabilities Matrix (Full Hackathon Feature Showcase) */}
      <section className="py-20 sm:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-semibold mb-3">
                FULL-STACK ENGINEERING SUITE
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Every capability needed from first bug to verified hire
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
                Explore the complete BugQuest AI platform — combining Monaco multi-file debugging, time-travel observability, Voice &amp; Socratic AI coaching, chaos testing, live interviews, and cryptographic dossiers.
              </p>
            </div>

            {/* Interactive Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/90 self-start md:self-auto">
              {[
                { id: 'all', label: 'All (8)' },
                { id: 'ide', label: 'IDE & Debug' },
                { id: 'ai', label: 'AI & Testing' },
                { id: 'teams', label: 'Teams & Hiring' },
              ].map((tab) => {
                const active = capabilityFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCapabilityFilter(tab.id as 'all' | 'ide' | 'ai' | 'teams')}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="capability-filter-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-lg bg-blue-600 shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <SpotlightCard
                  key={cap.title}
                  className="bg-[#f8fafc] rounded-2xl border border-slate-200/90 p-5 shadow-subtle hover:shadow-card-hover hover:border-blue-300/80 hover:bg-white transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cap.accentClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] font-semibold text-slate-600">
                        {cap.tag}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 mb-2 leading-snug">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-200/70">
                    <Link
                      to={cap.route}
                      className="group inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>{cap.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Luminous Porcelain & Cobalt Bottom CTA with 3D Scroll Reveal */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Scroll3DSection tilt={5} lift={22}>
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/80 border border-blue-200/80 p-8 sm:p-12 lg:p-14 overflow-hidden shadow-[0_24px_60px_-24px_rgba(37,99,235,0.16)]">
              <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-blue-200/45 blur-3xl pointer-events-none"
              />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl text-left">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    Ready to step into the debugging sandbox?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
                    Pick a real-codebase defect ticket, run isolated tests, and build empirical proof of your problem-solving skills.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link
                    to="/challenges"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-blue-sm hover:shadow-blue-md transition-all"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Start Practice Session</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </Scroll3DSection>
        </div>
      </section>
    </div>
  );
};
