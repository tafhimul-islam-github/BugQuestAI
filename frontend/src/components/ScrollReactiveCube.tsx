import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  ShieldCheck,
  BrainCircuit,
  Fingerprint,
  Terminal,
  Activity,
  Lock,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface StageData {
  id: string;
  step: string;
  title: string;
  tagline: string;
  description: string;
  accent: {
    primary: string;       // e.g. 'text-cyan-400'
    bg: string;            // e.g. 'bg-cyan-500/10'
    border: string;        // e.g. 'border-cyan-500/30'
    glow: string;          // e.g. 'rgba(6, 182, 212, 0.4)'
    badge: string;         // e.g. 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300'
    ring: string;          // e.g. 'from-cyan-500 to-blue-500'
    dot: string;           // e.g. 'bg-cyan-400'
    gradient: string;      // e.g. 'from-cyan-500/20 via-blue-500/10 to-transparent'
    cubeGlow: string;      // radial glow behind cube
  };
  icon: React.ElementType;
  metrics: { label: string; value: string; sub: string }[];
  telemetry: {
    title: string;
    items: { label: string; val: string; status?: 'good' | 'warn' | 'info' }[];
    codeSnippet: string;
    codeLang: string;
  };
  cubeAngle: { x: number; y: number };
}

export const CUBE_STAGES: StageData[] = [
  {
    id: 'sandbox',
    step: '01',
    title: 'Isolated Subprocess Sandbox',
    tagline: 'Zero-Trust Code Execution with Syscall Containment',
    description:
      'Every learner submission is isolated in a sterile containerized sub-process. We enforce microsecond memory ceilings, aggressive CPU timeouts, and impenetrable filesystem boundaries so untrusted code never escapes.',
    accent: {
      primary: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      glow: 'rgba(6, 182, 212, 0.35)',
      badge: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300',
      ring: 'from-cyan-400 to-blue-600',
      dot: 'bg-cyan-400',
      gradient: 'from-blue-600/20 via-cyan-500/10 to-transparent',
      cubeGlow: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)',
    },
    icon: Cpu,
    metrics: [
      { label: 'Cold Boot', value: '14ms', sub: 'Instant spawn' },
      { label: 'Hard Ceiling', value: '256 MB', sub: 'OOM prevention' },
      { label: 'Isolation', value: 'Level 4', sub: 'Subprocess jail' },
    ],
    telemetry: {
      title: 'RUNTIME TELEMETRY :: ADAPTER_V8_PYTHON',
      items: [
        { label: 'SANDBOX_STATE', val: 'ISOLATED_SECURE', status: 'good' },
        { label: 'CPU_QUOTA', val: '2.00s max allowed', status: 'info' },
        { label: 'FORK_BARRIER', val: 'BLOCKED (EPERM)', status: 'good' },
        { label: 'NET_SOCKETS', val: 'DISABLED (0 TX/RX)', status: 'good' },
      ],
      codeSnippet: `# Isolated Subprocess Executor
import resource, os

def enforce_limits():
    # Strict 256MB memory wall
    resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, -1))
    # Timeout syscall alarm
    resource.setrlimit(resource.RLIMIT_CPU, (2, 3))
    # Drop root privileges
    os.setgid(1001); os.setuid(1001)`,
      codeLang: 'python',
    },
    cubeAngle: { x: -12, y: 0 },
  },
  {
    id: 'test-matrix',
    step: '02',
    title: 'Hidden Adversarial Test Matrix',
    tagline: 'Private Boundary Verification & Anti-Tamper Scoring',
    description:
      'Public test cases validate algorithm intent while server-side hidden suites verify adversarial edge cases, null boundaries, and scale inputs without client exposure.',
    accent: {
      primary: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'rgba(16, 185, 129, 0.35)',
      badge: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
      ring: 'from-emerald-400 to-teal-600',
      dot: 'bg-emerald-400',
      gradient: 'from-emerald-600/20 via-teal-500/10 to-transparent',
      cubeGlow: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(20, 184, 166, 0.1) 50%, transparent 70%)',
    },
    icon: ShieldCheck,
    metrics: [
      { label: 'Public Suites', value: '3 Cases', sub: 'Syntax verification' },
      { label: 'Hidden Matrix', value: '18 Cases', sub: 'Zero client leakage' },
      { label: 'Edge Bounds', value: '100%', sub: 'Scale & fuzz checks' },
    ],
    telemetry: {
      title: 'TEST_MATRIX_EVALUATOR :: PRIVATE_VERIFY',
      items: [
        { label: 'PUBLIC_TESTS', val: 'PASS [3/3]', status: 'good' },
        { label: 'ADVERSARIAL_1', val: 'TARGET=0 & EMPTY [PASS]', status: 'good' },
        { label: 'ADVERSARIAL_2', val: 'DUPLICATE_KEY_TEST [PASS]', status: 'good' },
        { label: 'COMPLEXITY_SCAN', val: 'O(N) VERIFIED TIME', status: 'good' },
      ],
      codeSnippet: `// Server-Side Edge Case Harness
const hiddenMatrix = [
  { input: [3, 3], target: 6, expect: [0, 1] },
  { input: Array.from({length: 1e5}, (_, i) => i), target: 199997, expect: [99998, 99999] },
  { input: [-10, -5, 0, 5], target: -15, expect: [0, 1] }
];
evaluateBoundaryStress(hiddenMatrix);`,
      codeLang: 'typescript',
    },
    cubeAngle: { x: -8, y: -90 },
  },
  {
    id: 'socratic-coach',
    step: '03',
    title: 'Socratic AI Pedagogical Coach',
    tagline: '4 Progressive Zero-Spoiler Tiers Anchored to AST Trace',
    description:
      'Generic AI assistants paste full solutions on the first prompt, destroying learning. BugQuest unlocks 4 calibrated hint tiers anchored directly to the failing execution trace without ever handing out answers.',
    accent: {
      primary: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      glow: 'rgba(168, 85, 247, 0.35)',
      badge: 'bg-violet-500/15 border-violet-400/30 text-violet-300',
      ring: 'from-violet-400 to-indigo-600',
      dot: 'bg-violet-400',
      gradient: 'from-violet-600/20 via-purple-500/10 to-transparent',
      cubeGlow: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
    },
    icon: BrainCircuit,
    metrics: [
      { label: 'Hint Tiers', value: '4 Levels', sub: 'Calibrated guidance' },
      { label: 'Answer Leaks', value: '0.00%', sub: 'Strict Socratic guard' },
      { label: 'Trace Anchor', value: 'Line-Level', sub: 'AST error mapping' },
    ],
    telemetry: {
      title: 'SOCRATIC_GUARDRAIL :: PEDAGOGICAL_INFERENCE',
      items: [
        { label: 'TIER_SELECTED', val: 'TIER 02: DIRECTIONAL', status: 'info' },
        { label: 'FAILURE_NODE', val: 'services/two_sum.py:Line 5', status: 'warn' },
        { label: 'SPOILER_CHECK', val: 'NO CODE PROVIDED [CLEAN]', status: 'good' },
        { label: 'INQUIRY_MODE', val: 'SOCRATIC COMPLEMENT Q', status: 'good' },
      ],
      codeSnippet: `// Socratic Guard Prompt Schema
{
  "system": "Refuse to output code solutions. Guide candidate",
  "failing_trace": "AssertionError: expected [1, 2], got [0, 0]",
  "tier": 2, // Directional Strategy
  "socratic_prompt": "What lookup structure provides O(1) query",
  "answer_sanitization": "ENABLED (filter code blocks)"
}`,
      codeLang: 'json',
    },
    cubeAngle: { x: 12, y: -180 },
  },
  {
    id: 'dossier',
    step: '04',
    title: 'Cryptographic Readiness Dossier',
    tagline: 'Revocable 64-Character Proof Tokens for Hiring Teams',
    description:
      'Turn authentic problem-solving sessions into cryptographic skill credentials. Share unforgeable verification tokens with engineering recruiters, with granular consent controls and 1-click token revocation.',
    accent: {
      primary: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'rgba(245, 158, 11, 0.35)',
      badge: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
      ring: 'from-amber-400 to-rose-600',
      dot: 'bg-amber-400',
      gradient: 'from-amber-600/20 via-orange-500/10 to-transparent',
      cubeGlow: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(234, 88, 12, 0.1) 50%, transparent 70%)',
    },
    icon: Fingerprint,
    metrics: [
      { label: 'Token Length', value: '64-Char', sub: 'Unguessable entropy' },
      { label: 'Tamper Proof', value: 'SHA-256', sub: 'Signed telemetry' },
      { label: 'Revocation', value: 'Instant', sub: '1-click user control' },
    ],
    telemetry: {
      title: 'CRYPTOGRAPHIC_DOSSIER :: TOKEN_VERIFIER',
      items: [
        { label: 'DOSSIER_HASH', val: 'e3b0c44298fc1c149afbf4c8', status: 'good' },
        { label: 'CANDIDATE_ID', val: 'CANDIDATE_#84920 [ANONYMIZED]', status: 'info' },
        { label: 'RECRUITER_KEY', val: 'bq_live_9f81a7b2... [ACTIVE]', status: 'good' },
        { label: 'CONSENT_STATUS', val: 'EXPLICIT_GRANTED', status: 'good' },
      ],
      codeSnippet: `// Verification Dossier Token Payload
{
  "token": "bq_dossier_a9f8e4b7c2d1e0f3a8b7c6d5e4f3a2b1...",
  "verified_at": "2026-11-20T03:00:00Z",
  "metrics": { "bug_velocity_sec": 420, "hint_reliance": 0.25 },
  "signature": "3045022100a9f8e4... [ECDSA-SECP256K1]",
  "revoked": false
}`,
      codeLang: 'json',
    },
    cubeAngle: { x: -10, y: -270 },
  },
];

export const ScrollReactiveCube: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [hoverFace, setHoverFace] = useState<string | null>(null);

  // Mouse hover tilt physics
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Scroll tracking across the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calculate smooth rotation based on scroll progress
  // 0.00 -> Stage 0 (y: 0deg)
  // 0.33 -> Stage 1 (y: -90deg)
  // 0.66 -> Stage 2 (y: -180deg)
  // 1.00 -> Stage 3 (y: -270deg)
  const rawRotY = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, -90, -180, -270]);
  const rawRotX = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [-12, -8, 12, -10]);

  // Spring physics for buttery responsiveness
  const springConfig = { stiffness: 120, damping: 24, mass: 0.8 };
  const smoothRotY = useSpring(rawRotY, springConfig);
  const smoothRotX = useSpring(rawRotX, springConfig);

  // Update active stage when scroll progress moves through tiers
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest < 0.22) {
        setActiveStageIndex(0);
      } else if (latest < 0.52) {
        setActiveStageIndex(1);
      } else if (latest < 0.82) {
        setActiveStageIndex(2);
      } else {
        setActiveStageIndex(3);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const currentStage = CUBE_STAGES[activeStageIndex];

  // Mouse move on cube area for interactive tactile 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 20, y: -y * 20 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setHoverFace(null);
  };

  // Manual stage selection (click tab)
  const handleSelectStage = (idx: number) => {
    setActiveStageIndex(idx);
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerRef.current.offsetTop + (idx / (CUBE_STAGES.length - 1)) * totalHeight;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380vh] bg-[#070c18] text-slate-100"
    >
      {/* Dynamic Background Atmospheric Lighting */}
      <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
        {/* Animated Radial Color Bloom that follows current stage */}
        <motion.div
          animate={{
            background: currentStage.accent.cubeGlow,
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full opacity-90 blur-3xl"
        />

        {/* High-tech grid overlay */}
        <div className="absolute inset-0 bg-dark-grid opacity-35" />

        {/* Ambient Top & Bottom Vignettes */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#070c18] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#070c18] to-transparent" />
      </div>

      {/* Main Sticky Interactive Stage (Locks during scroll) */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center z-10 px-4 sm:px-6 lg:px-12 pointer-events-auto">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ────────── LEFT COLUMN: DYNAMIC TEXT & METRICS ────────── */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Stage Indicator Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {CUBE_STAGES.map((st, idx) => {
                const isActive = activeStageIndex === idx;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStage(idx)}
                    type="button"
                    className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono transition-all duration-300 cursor-pointer ${
                      isActive
                        ? `${st.accent.badge} shadow-lg shadow-cyan-950/40 ring-1 ring-current`
                        : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? st.accent.dot : 'bg-slate-600'}`} />
                    <span>{st.step}</span>
                    <span className="hidden sm:inline font-sans font-medium text-[11px] truncate max-w-[120px]">
                      {st.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Stage Content with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {/* Stage Tagline / Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium backdrop-blur-md shadow-xs"
                     style={{
                       borderColor: currentStage.accent.glow,
                       backgroundColor: 'rgba(15, 23, 42, 0.75)',
                     }}>
                  <currentStage.icon className={`w-3.5 h-3.5 ${currentStage.accent.primary}`} />
                  <span className="text-slate-300">{currentStage.tagline}</span>
                </div>

                {/* Big Dynamic Heading */}
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.12]">
                  {currentStage.title}
                </h2>

                {/* Explanatory Narrative */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  {currentStage.description}
                </p>

                {/* Proof Metrics Grid */}
                <div className="pt-2 grid grid-cols-3 gap-3">
                  {currentStage.metrics.map((m, mi) => (
                    <div
                      key={mi}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm"
                    >
                      <div className="font-mono text-xs text-slate-400">{m.label}</div>
                      <div className={`font-display text-xl sm:text-2xl font-bold mt-0.5 ${currentStage.accent.primary}`}>
                        {m.value}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-3 pt-3">
                  <Link
                    to="/challenges"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-blue-md transition-all"
                  >
                    <span>Launch in Sandbox</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSelectStage((activeStageIndex + 1) % CUBE_STAGES.length)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-850/80 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-all cursor-pointer"
                  >
                    <span>Next Feature</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ────────── RIGHT COLUMN: THE 3D INTERACTIVE SCROLL CUBE ────────── */}
          <div
            className="lg:col-span-6 flex flex-col items-center justify-center relative select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Ambient Multi-Ring Cosmic Orbits */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Ring 1 */}
              <div
                className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-slate-800/80 border-dashed animate-[spin_60s_linear_infinite] opacity-40"
              />
              {/* Ring 2 with Accent Gradient */}
              <div
                className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-cyan-500/20 animate-[spin_40s_linear_infinite_reverse] opacity-50"
                style={{ borderColor: currentStage.accent.glow }}
              />
              {/* Center Radiant Halo */}
              <div
                className="w-40 h-40 rounded-full blur-2xl transition-all duration-700"
                style={{ backgroundColor: currentStage.accent.glow }}
              />
            </div>

            {/* 3D Scene Viewport */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center perspective-1200 cursor-grab active:cursor-grabbing">
              {/* Animated 3D Root Container */}
              <motion.div
                style={{
                  rotateX: smoothRotX,
                  rotateY: smoothRotY,
                  x: mouseOffset.x,
                  y: -mouseOffset.y,
                }}
                className="relative w-44 h-44 sm:w-52 sm:h-52 preserve-3d transition-transform duration-100 ease-out"
              >
                {/* ─── FACE 1: FRONT (Stage 01: Subprocess Sandbox) ─── */}
                <div
                  onMouseEnter={() => setHoverFace('front')}
                  className="absolute inset-0 rounded-2xl border-2 border-cyan-500/40 bg-[#0d1627]/95 p-4 flex flex-col justify-between shadow-2xl backdrop-blur-md backface-hidden"
                  style={{
                    transform: 'translateZ(104px)',
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.15)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono text-[10px] text-cyan-300 font-semibold tracking-wider">SANDBOX_CORE</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="text-slate-400">ISOLATION: <span className="text-cyan-300 font-bold">STRICT_SUBPROCESS</span></div>
                    <div className="text-slate-400">BOOT_TIME: <span className="text-emerald-400 font-bold">14.2 ms</span></div>
                    <div className="text-slate-400">MEMORY_WALL: <span className="text-slate-200">256 MB MAX</span></div>
                    <div className="text-slate-400">SYSCALL: <span className="text-cyan-400">SECCOMP_BPF</span></div>
                  </div>
                  <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[9px] font-mono text-cyan-400/80">
                    <span>STAGE 01</span>
                    <span>RUNTIME_V8</span>
                  </div>
                </div>

                {/* ─── FACE 2: RIGHT (Stage 02: Hidden Test Matrix) ─── */}
                <div
                  onMouseEnter={() => setHoverFace('right')}
                  className="absolute inset-0 rounded-2xl border-2 border-emerald-500/40 bg-[#0a1a1f]/95 p-4 flex flex-col justify-between shadow-2xl backdrop-blur-md backface-hidden"
                  style={{
                    transform: 'rotateY(90deg) translateZ(104px)',
                    boxShadow: '0 0 40px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.15)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono text-[10px] text-emerald-300 font-semibold tracking-wider">TEST_MATRIX</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="text-slate-400">PUBLIC: <span className="text-emerald-300 font-bold">3/3 PASSED</span></div>
                    <div className="text-slate-400">HIDDEN: <span className="text-emerald-400 font-bold">18/18 SECURE</span></div>
                    <div className="text-slate-400">EDGE_CHECK: <span className="text-teal-300">STRESS BOUNDS</span></div>
                    <div className="text-slate-400">LEAKAGE: <span className="text-emerald-300 font-bold">0.00%</span></div>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[9px] font-mono text-emerald-400/80">
                    <span>STAGE 02</span>
                    <span>TAMPER_PROOF</span>
                  </div>
                </div>

                {/* ─── FACE 3: BACK (Stage 03: Socratic AI Coach) ─── */}
                <div
                  onMouseEnter={() => setHoverFace('back')}
                  className="absolute inset-0 rounded-2xl border-2 border-violet-500/40 bg-[#160d27]/95 p-4 flex flex-col justify-between shadow-2xl backdrop-blur-md backface-hidden"
                  style={{
                    transform: 'rotateY(180deg) translateZ(104px)',
                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.15)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-violet-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-violet-400" />
                      <span className="font-mono text-[10px] text-violet-300 font-semibold tracking-wider">SOCRATIC_AI</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="text-slate-400">COACH_TIER: <span className="text-violet-300 font-bold">4-STAGE ZERO_SPOILER</span></div>
                    <div className="text-slate-400">TRACE_ANCHOR: <span className="text-purple-300">services/two_sum</span></div>
                    <div className="text-slate-400">HINT_MODE: <span className="text-violet-400">CONCEPTUAL</span></div>
                    <div className="text-slate-400">CODE_LEAK: <span className="text-emerald-400 font-bold">BLOCKED</span></div>
                  </div>
                  <div className="pt-2 border-t border-violet-500/20 flex items-center justify-between text-[9px] font-mono text-violet-400/80">
                    <span>STAGE 03</span>
                    <span>AI_PEDAGOGY</span>
                  </div>
                </div>

                {/* ─── FACE 4: LEFT (Stage 04: Cryptographic Dossier) ─── */}
                <div
                  onMouseEnter={() => setHoverFace('left')}
                  className="absolute inset-0 rounded-2xl border-2 border-amber-500/40 bg-[#241708]/95 p-4 flex flex-col justify-between shadow-2xl backdrop-blur-md backface-hidden"
                  style={{
                    transform: 'rotateY(-90deg) translateZ(104px)',
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.3), inset 0 0 20px rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-[10px] text-amber-300 font-semibold tracking-wider">PROOF_DOSSIER</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="text-slate-400">TOKEN: <span className="text-amber-300 font-bold">64-CHAR UNGUESSABLE</span></div>
                    <div className="text-slate-400">ALGO: <span className="text-amber-400 font-bold">ECDSA-SHA256</span></div>
                    <div className="text-slate-400">CONSENT: <span className="text-emerald-300">ACTIVE_GRANTED</span></div>
                    <div className="text-slate-400">REVOKE: <span className="text-rose-400 font-bold">1-CLICK</span></div>
                  </div>
                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[9px] font-mono text-amber-400/80">
                    <span>STAGE 04</span>
                    <span>WORKFORCE_PROOF</span>
                  </div>
                </div>

                {/* ─── FACE 5: TOP (Obsidian Cap) ─── */}
                <div
                  className="absolute inset-0 rounded-2xl border border-slate-700/50 bg-[#090f1d] p-3 flex flex-col items-center justify-center shadow-xl backface-hidden"
                  style={{
                    transform: 'rotateX(90deg) translateZ(104px)',
                  }}
                >
                  <Terminal className="w-6 h-6 text-slate-500" />
                  <span className="font-mono text-[9px] text-slate-500 mt-1">KERNEL_V8</span>
                </div>

                {/* ─── FACE 6: BOTTOM (Grid Base) ─── */}
                <div
                  className="absolute inset-0 rounded-2xl border border-slate-800 bg-[#060a14] p-3 flex flex-col items-center justify-center shadow-xl backface-hidden"
                  style={{
                    transform: 'rotateX(-90deg) translateZ(104px)',
                  }}
                >
                  <Lock className="w-6 h-6 text-slate-600" />
                  <span className="font-mono text-[9px] text-slate-600 mt-1">SEC_ISOLATED</span>
                </div>
              </motion.div>
            </div>

            {/* Dynamic Telemetry Inspector Box below Cube */}
            <div className="w-full max-w-md mt-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-obsidian p-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <Activity className={`w-3.5 h-3.5 ${currentStage.accent.primary}`} />
                  <span className="text-slate-300 font-semibold">{currentStage.telemetry.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {hoverFace ? `INSPECTING_${hoverFace.toUpperCase()}` : 'LIVE FEED'}
                </span>
              </div>

              {/* Status items */}
              <div className="grid grid-cols-2 gap-2 my-2.5">
                {currentStage.telemetry.items.map((item, ii) => (
                  <div key={ii} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 text-[10px] font-mono">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={item.status === 'good' ? 'text-emerald-400' : item.status === 'warn' ? 'text-amber-400' : 'text-cyan-300'}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini Code Window */}
              <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2.5 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-24">
                <pre className="text-slate-400 leading-relaxed whitespace-pre font-mono">
                  <code>{currentStage.telemetry.codeSnippet}</code>
                </pre>
              </div>

              {/* Scroll guide hint */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Scroll down to morph cube &amp; inspect stages
                </span>
                <span className="text-slate-400">0{activeStageIndex + 1} / 04</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
