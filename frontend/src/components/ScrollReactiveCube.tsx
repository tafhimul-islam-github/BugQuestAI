import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  ShieldCheck,
  BrainCircuit,
  Fingerprint,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  Terminal,
  GitBranch,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ThreeSandboxSculpture = lazy(() =>
  import('./ThreeSandboxSculpture').then((m) => ({ default: m.ThreeSandboxSculpture }))
);

interface PipelineStage {
  id: 'ingest' | 'fault' | 'coach' | 'sandbox' | 'verify' | 'dossier';
  step: string;
  ticker: string;
  badgeText: string;
  uri: string;
  title: string;
  description: string;
  accentHex: string;
  pillClass: string;
  barClass: string;
  dotClass: string;
  auraGradient: string;
  icon: React.ElementType;
  floatingTags: [string, string, string];
  rotY: number;
  rotX: number;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'ingest',
    step: '01',
    ticker: 'INGESTING MULTI-FILE REPO',
    badgeText: 'INGESTING',
    uri: 'repo://src/services/checkout.py',
    title: 'Real-codebase defect tickets, never toy puzzles.',
    description:
      'Learners open a multi-file repository with realistic symptoms, failing logs, and reproducible edge-case bugs — or educators import live GitHub issues via BYOB.',
    accentHex: '#0284c7',
    pillClass: 'bg-sky-50 text-sky-700 border-sky-200',
    barClass: 'bg-sky-500',
    dotClass: 'bg-sky-500',
    auraGradient: 'radial-gradient(circle at 70% 35%, rgba(2, 132, 199, 0.12), transparent 62%)',
    icon: FileCode2,
    floatingTags: ['src/checkout.py', '4 files indexed', 'AST parsed'],
    rotY: 0.4,
    rotX: 0.3,
  },
  {
    id: 'fault',
    step: '02',
    ticker: 'LOCALIZING ROOT CAUSE',
    badgeText: '1 CRITICAL',
    uri: 'trace://apm-span-409',
    title: 'Time-travel replay, APM traces & state graphs.',
    description:
      'Inspect execution timelines step-by-step, trace latency spikes across spans, and pinpoint the exact line mutating state before boundary checks run.',
    accentHex: '#e11d48',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200',
    barClass: 'bg-rose-500',
    dotClass: 'bg-rose-500',
    auraGradient: 'radial-gradient(circle at 70% 35%, rgba(225, 29, 72, 0.11), transparent 62%)',
    icon: AlertTriangle,
    floatingTags: ['TypeError :15', 'heap 41 MB', 'span 18.4ms'],
    rotY: 1.35,
    rotX: 0.24,
  },
  {
    id: 'coach',
    step: '03',
    ticker: 'SOCRATIC AI COACHING',
    badgeText: 'TIER 02 · NO SPOILERS',
    uri: 'coach://socratic-engine',
    title: '4-tier pedagogical AI coach that refuses to spoil.',
    description:
      'Instead of dumping copy-paste answers, our FastAPI + RAG coaching engine unlocks calibrated hints (Nudge → Direction → Diagnosis → Walkthrough) plus interactive Voice Coaching.',
    accentHex: '#7c3aed',
    pillClass: 'bg-violet-50 text-violet-700 border-violet-200',
    barClass: 'bg-violet-600',
    dotClass: 'bg-violet-600',
    auraGradient: 'radial-gradient(circle at 70% 35%, rgba(124, 58, 237, 0.11), transparent 62%)',
    icon: BrainCircuit,
    floatingTags: ['0% answer leak', 'Voice Coach', 'AST anchored'],
    rotY: 2.35,
    rotX: 0.36,
  },
  {
    id: 'sandbox',
    step: '04',
    ticker: 'EXECUTING IN ISOLATED SANDBOX',
    badgeText: 'RUNNING',
    uri: 'sandbox://sbx-7f3a',
    title: 'Zero-trust subprocess judge with syscall guards.',
    description:
      'Learner patches execute inside an isolated subprocess with strict memory ceilings, CPU timeouts, and disabled network sockets — supporting Python 3 and Node V8.',
    accentHex: '#2563eb',
    pillClass: 'bg-blue-50 text-blue-700 border-blue-200',
    barClass: 'bg-blue-600',
    dotClass: 'bg-blue-600',
    auraGradient: 'radial-gradient(circle at 70% 35%, rgba(37, 99, 235, 0.12), transparent 62%)',
    icon: Cpu,
    floatingTags: ['boot 14ms', 'net=none', 'mem 72 MB'],
    rotY: 3.35,
    rotX: 0.28,
  },
  {
    id: 'verify',
    step: '05',
    ticker: 'FIX VERIFIED · 24/24 PASSED',
    badgeText: '24/24 PASSED',
    uri: 'test-runner://hidden-suite',
    title: 'Private hidden suites & chaos boundary fuzzing.',
    description:
      'Public checks validate basic behavior while server-side hidden test suites and chaos injectors verify adversarial edge cases without ever leaking test inputs.',
    accentHex: '#059669',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barClass: 'bg-emerald-600',
    dotClass: 'bg-emerald-600',
    auraGradient: 'radial-gradient(circle at 70% 35%, rgba(5, 150, 105, 0.12), transparent 62%)',
    icon: ShieldCheck,
    floatingTags: ['24/24 passed', '0 regressions', 'chaos clean'],
    rotY: 4.35,
    rotX: 0.22,
  },
  {
    id: 'dossier',
    step: '06',
    ticker: 'CRYPTOGRAPHIC DOSSIER READY',
    badgeText: 'VERIFIED PROOF',
    uri: 'dossier://bq_live_9f81a7b2',
    title: 'Tamper-proof workforce readiness dossiers.',
    description:
      'Every verified fix updates the learner’s empirical skill matrix and generates a 64-character revocable share token for engineering hiring managers and educators.',
    accentHex: '#d97706',
    pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
    barClass: 'bg-amber-500',
    dotClass: 'bg-amber-500',
    auraGradient: 'radial-gradient(circle at 70% 35%, rgba(217, 119, 6, 0.11), transparent 62%)',
    icon: Fingerprint,
    floatingTags: ['64-char token', 'SHA-256 signed', '1-click revoke'],
    rotY: 5.35,
    rotX: 0.3,
  },
];

const TEST_CHECKLIST = [
  'returns total for standard cart',
  'caps 150% coupon at zero balance',
  'rounds floating-point cents safely',
  'hidden: empty cart & null coupon',
  'chaos: 100k concurrent discount fuzz',
  'regression: negative subtotal guard',
];

/**
 * Renders the contextual live product UI card for each of the 6 pipeline stages
 * (directly modeled on the scrollytelling live-card craft of the reference artifact,
 * executed in a crisp light architectural palette).
 */
const StageLiveCard: React.FC<{ stage: PipelineStage }> = ({ stage }) => {
  const [passedCount, setPassedCount] = useState(14);

  useEffect(() => {
    if (stage.id !== 'verify') return;
    setPassedCount(14);
    const interval = window.setInterval(() => {
      setPassedCount((c) => {
        if (c >= 24) {
          window.clearInterval(interval);
          return 24;
        }
        return c + 2;
      });
    }, 110);
    return () => window.clearInterval(interval);
  }, [stage.id]);

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.12)] overflow-hidden">
      {/* Card Header Bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-rose-400/90" />
          <span className="w-2 h-2 rounded-full bg-amber-400/90" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/90" />
          <span className="ml-1.5 font-mono text-[11px] text-slate-600 font-medium truncate">
            {stage.uri}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border shrink-0 ${stage.pillClass}`}
        >
          {stage.badgeText}
        </span>
      </div>

      {/* Stage-Specific Realistic UI Body */}
      <div className="p-4">
        {stage.id === 'ingest' && (
          <div className="space-y-2.5 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 pb-1.5 border-b border-slate-100">
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                checkout.py
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500">coupons.py</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500">test_cart.py</span>
            </div>
            <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-3 leading-5 text-slate-700">
              <div>
                <span className="text-slate-400 mr-3">12</span>
                <span className="text-indigo-600 font-semibold">def</span>{' '}
                <span className="text-blue-700 font-semibold">apply_coupon</span>(total, rate):
              </div>
              <div>
                <span className="text-slate-400 mr-3">13</span>
                {'    '}if not rate or rate &lt;= 0: return total
              </div>
              <div className="bg-sky-50/80 -mx-1 px-1 rounded">
                <span className="text-sky-500 mr-3">14</span>
                {'    '}discount = total * rate
              </div>
              <div>
                <span className="text-slate-400 mr-3">15</span>
                {'    '}return total - discount
              </div>
            </div>
          </div>
        )}

        {stage.id === 'fault' && (
          <div className="space-y-2.5 font-mono text-[11px]">
            <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-3 leading-5 text-slate-700">
              <div>
                <span className="text-slate-400 mr-3">13</span>
                {'    '}if not rate: return total
              </div>
              <div className="bg-rose-50 border border-rose-200/80 -mx-1 px-1.5 py-0.5 rounded text-rose-900 font-medium flex items-center justify-between">
                <span>
                  <span className="text-rose-500 mr-2">14</span>
                  {'    '}discount = total * rate
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">
                  FAULT
                </span>
              </div>
              <div>
                <span className="text-slate-400 mr-3">15</span>
                {'    '}return total - discount
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">
                CRITICAL: rate=1.5 produces negative charge (-$42.50)
              </span>
            </div>
          </div>
        )}

        {stage.id === 'coach' && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              {['Nudge', 'Direction', 'Diagnosis', 'Walkthrough'].map((t, i) => (
                <span
                  key={t}
                  className={`flex-1 text-center py-1 rounded-lg text-[10px] font-semibold border ${
                    i === 1
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : i < 1
                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-200/80 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-violet-900 mb-1">Socratic Hint (Line 14)</p>
              What invariant must hold between <code className="font-mono text-violet-700">discount</code> and{' '}
              <code className="font-mono text-violet-700">total</code> when a promotional rate exceeds 100%?
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="text-emerald-700 font-semibold">✓ Zero code spoilers</span>
              <span>Voice Coach ready</span>
            </div>
          </div>
        )}

        {stage.id === 'sandbox' && (
          <div className="space-y-2.5 font-mono text-[11px]">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[9px] text-slate-400">MEMORY</div>
                <div className="text-xs font-bold text-slate-900">72 MB</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[9px] text-slate-400">NETWORK</div>
                <div className="text-xs font-bold text-emerald-700">blocked</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[9px] text-slate-400">BOOT</div>
                <div className="text-xs font-bold text-blue-700">14 ms</div>
              </div>
            </div>
            <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-3 space-y-1 text-[10.5px] text-slate-700">
              <div className="text-slate-500">$ sandbox up --isolated --net=none</div>
              <div className="text-emerald-700">✓ container sbx-7f3a booted in 14ms</div>
              <div className="text-emerald-700">✓ seccomp profile applied · mem 256MB</div>
              <div className="text-blue-700">▸ replaying 18 hidden boundary cases…</div>
            </div>
          </div>
        )}

        {stage.id === 'verify' && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Animated Circular Progress Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="6"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 * (1 - passedCount / 24)}
                  className="transition-all duration-150"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-lg font-bold text-slate-900 tabular-nums">
                  {passedCount}/24
                </span>
                <span className="font-mono text-[9px] font-semibold text-emerald-700">PASSED</span>
              </div>
            </div>

            {/* Live Checklist */}
            <div className="flex-1 w-full space-y-1.5 font-mono text-[10.5px]">
              {TEST_CHECKLIST.map((item, i) => {
                const done = passedCount >= 14 + i * 2;
                return (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        done ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <span className={`truncate ${done ? 'text-slate-800' : 'text-slate-400'}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stage.id === 'dossier' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-slate-900">
                    Readiness Dossier Ready
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    fix(checkout): cap coupon discount &amp; guard overflow
                  </p>
                </div>
              </div>
              <span className="font-display text-lg font-bold text-emerald-700 tabular-nums">
                96%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block">EVIDENCE</span>
                <span className="text-slate-800 font-semibold">24/24 hidden tests</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block">SHARE TOKEN</span>
                <span className="text-amber-700 font-semibold">64-char revocable</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ScrollReactiveCubeProps {
  autoTourTrigger?: boolean;
}

export const ScrollReactiveCube: React.FC<ScrollReactiveCubeProps> = ({ autoTourTrigger = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [scrollRotationY, setScrollRotationY] = useState<number>(PIPELINE_STAGES[0].rotY);
  const isTourPlayingRef = useRef<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    isTourPlayingRef.current = isTourPlaying;
  }, [isTourPlaying]);

  useEffect(() => {
    if (autoTourTrigger) {
      setIsTourPlaying(true);
    }
  }, [autoTourTrigger]);

  useEffect(() => {
    if (!isTourPlaying) return;
    const timer = setInterval(() => {
      setActiveStageIndex((prev) => {
        const next = (prev + 1) % PIPELINE_STAGES.length;
        setScrollRotationY(PIPELINE_STAGES[next].rotY);
        return next;
      });
    }, 3400);
    return () => clearInterval(timer);
  }, [isTourPlaying]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      if (isTourPlayingRef.current && progress > 0.04 && progress < 0.96) {
        setIsTourPlaying(false);
      }
      const idx = Math.min(
        PIPELINE_STAGES.length - 1,
        Math.floor(progress * PIPELINE_STAGES.length)
      );
      setActiveStageIndex((prev) => (prev === idx ? prev : idx));
      setScrollRotationY(0.4 + progress * Math.PI * 1.9);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const currentStage = PIPELINE_STAGES[activeStageIndex];

  const handleSelectStage = (idx: number) => {
    setIsTourPlaying(false);
    setActiveStageIndex(idx);
    setScrollRotationY(PIPELINE_STAGES[idx].rotY);
  };

  const handleNextStage = () => {
    handleSelectStage((activeStageIndex + 1) % PIPELINE_STAGES.length);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320vh] bg-gradient-to-b from-[#f8fafc] via-white to-[#f4f7fb] text-slate-900 border-b border-slate-200/80"
    >
      {/* Sticky Scrollytelling Studio Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden z-10 px-4 sm:px-6 lg:px-10 pt-20 pb-5">
        {/* Soft Daylight Stage-Adaptive Glow & Architectural Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{ background: currentStage.auraGradient }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-grid-pattern opacity-45" />
        </div>

        {/* Main 2-Column Stage */}
        <div className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10 min-h-0">
          {/* LEFT COLUMN: Clean Editorial Stage Narrative */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs text-[11px] font-mono text-slate-700">
                <span className={`w-2 h-2 rounded-full ${currentStage.dotClass} animate-pulse`} />
                <span>AUTONOMOUS DEBUGGING PIPELINE</span>
              </div>

              <button
                type="button"
                onClick={() => setIsTourPlaying((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                  isTourPlaying
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {isTourPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-blue-600" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-slate-500" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold ${currentStage.pillClass}`}
                >
                  <currentStage.icon className="w-3.5 h-3.5" />
                  <span>
                    {currentStage.step} / 06 · {currentStage.ticker}
                  </span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-[1.12]">
                  {currentStage.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {currentStage.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/challenges"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-blue-sm hover:shadow-blue-md transition-all"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Try Live Sandbox</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleNextStage}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Top 3D Wireframe Polyhedron + Bottom Live Contextual Product Card */}
          <div className="lg:col-span-7 flex flex-col items-center gap-3">
            {/* Top Half: Precision 3D Wireframe Polyhedron with Floating Telemetry Chips */}
            <div className="relative w-full max-w-[540px] h-[240px] sm:h-[265px] flex items-center justify-center">
              {/* Floating Telemetry Chips inspired by reference */}
              <div className="hidden sm:flex items-center gap-1.5 absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs font-mono text-[10px] text-slate-600 pointer-events-none">
                <Activity className="w-3 h-3" style={{ color: currentStage.accentHex }} />
                <span>{currentStage.floatingTags[0]}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs font-mono text-[10px] text-slate-600 pointer-events-none">
                <span className={`w-1.5 h-1.5 rounded-full ${currentStage.dotClass}`} />
                <span>{currentStage.floatingTags[1]}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 absolute bottom-2 right-4 z-20 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs font-mono text-[10px] text-slate-500 pointer-events-none">
                <span>{currentStage.floatingTags[2]}</span>
              </div>

              <Suspense
                fallback={
                  <div className="w-36 h-36 rounded-2xl bg-white/80 border border-slate-200 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                  </div>
                }
              >
                <ThreeSandboxSculpture
                  stageIndex={activeStageIndex}
                  accentHex={currentStage.accentHex}
                  targetRotationY={scrollRotationY}
                  targetRotationX={currentStage.rotX}
                  onCycleStage={handleNextStage}
                />
              </Suspense>
            </div>

            {/* Bottom Half: Contextual Live UI Card (Morphs per Stage!) */}
            <div className="w-full max-w-[540px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                >
                  <StageLiveCard stage={currentStage} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* PINNED CLICKABLE 6-SEGMENT TIMELINE BAR (Directly Inspired by Reference) */}
        <div className="max-w-5xl w-full mx-auto relative z-20 pt-2">
          <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.12)] px-4 py-2.5 flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] font-semibold text-slate-800 shrink-0 min-w-[210px]">
              <span style={{ color: currentStage.accentHex }}>&gt;</span>
              <span className="truncate">{currentStage.ticker}_</span>
            </div>

            {/* 6 Clickable Progress Segments */}
            <div className="flex-1 grid grid-cols-6 gap-2" role="tablist" aria-label="Pipeline stages">
              {PIPELINE_STAGES.map((st, idx) => {
                const isDoneOrActive = idx <= activeStageIndex;
                const isCurrent = idx === activeStageIndex;
                return (
                  <button
                    key={st.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`Jump to stage ${st.step}: ${st.ticker}`}
                    onClick={() => handleSelectStage(idx)}
                    className="group py-2 flex items-center cursor-pointer focus-visible:outline-none"
                  >
                    <span
                      className={`block w-full h-1.5 rounded-full transition-all duration-300 ${
                        isDoneOrActive
                          ? st.barClass
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      } ${isCurrent ? 'scale-y-125 shadow-xs' : ''}`}
                    />
                  </button>
                );
              })}
            </div>

            <span className="font-mono text-xs font-bold text-slate-600 tabular-nums shrink-0">
              {currentStage.step} / 06
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
