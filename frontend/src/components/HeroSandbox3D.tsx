import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { Cpu, ShieldCheck, BrainCircuit, Fingerprint, Terminal } from 'lucide-react';

interface LayerInfo {
  id: 'sandbox' | 'tests' | 'coach' | 'dossier';
  label: string;
  metric: string;
  detail: string;
  accent: string;
  dotColor: string;
}

const LAYERS: LayerInfo[] = [
  {
    id: 'sandbox',
    label: 'Subprocess Sandbox',
    metric: '14ms cold boot',
    detail: 'Isolated execution with strict memory & syscall guards',
    accent: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
    dotColor: 'bg-cyan-400',
  },
  {
    id: 'tests',
    label: 'Hidden Test Matrix',
    metric: '12 / 12 assertions',
    detail: 'Private adversarial edge cases never sent to the browser',
    accent: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 'coach',
    label: '4-Tier AI Coach',
    metric: 'Zero spoilers',
    detail: 'Socratic hints calibrated to live stack traces',
    accent: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
    dotColor: 'bg-blue-400',
  },
  {
    id: 'dossier',
    label: 'Crypto Dossier',
    metric: '64-char token',
    detail: 'Consent-governed, revocable readiness verification',
    accent: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    dotColor: 'bg-amber-400',
  },
];

export const HeroSandbox3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = useState<LayerInfo>(LAYERS[0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 160, damping: 22, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D tilt mapped from pointer position
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[540px] mx-auto select-none"
    >
      {/* Dark Architectural Stage */}
      <div className="relative rounded-3xl bg-[#0b1221] border border-slate-800/90 shadow-obsidian overflow-hidden p-5 sm:p-6">
        {/* Subtle Architectural Grid & Glow */}
        <div className="absolute inset-0 bg-dark-grid opacity-70 pointer-events-none" />
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[360px] h-[220px] rounded-full bg-blue-600/25 blur-[70px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-0 w-[260px] h-[200px] rounded-full bg-cyan-500/20 blur-[70px] pointer-events-none"
        />

        {/* Top Telemetry Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/90 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 font-mono text-[11px] text-slate-400">
              sandbox-core://v2.4
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ISOLATED</span>
          </div>
        </div>

        {/* 3D Interactive Viewport */}
        <div className="relative z-10 h-[270px] sm:h-[300px] flex items-center justify-center perspective-1200">
          {/* Concentric Vector Orbit Rings */}
          <svg
            viewBox="0 0 420 280"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-65"
            aria-hidden="true"
          >
            <ellipse
              cx="210"
              cy="140"
              rx="178"
              ry="74"
              fill="none"
              stroke="url(#orbit-grad-1)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <ellipse
              cx="210"
              cy="140"
              rx="126"
              ry="52"
              fill="none"
              stroke="url(#orbit-grad-2)"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="orbit-grad-1" x1="32" y1="140" x2="388" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" stopOpacity="0.15" />
                <stop offset="0.5" stopColor="#38BDF8" stopOpacity="0.7" />
                <stop offset="1" stopColor="#10B981" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="orbit-grad-2" x1="84" y1="140" x2="336" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" stopOpacity="0.45" />
                <stop offset="1" stopColor="#22D3EE" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Mouse-Reactive 3D Assembly */}
          <motion.div
            style={shouldReduceMotion ? undefined : { rotateX, rotateY }}
            className="relative w-40 h-40 sm:w-44 sm:h-44 preserve-3d flex items-center justify-center"
          >
            {/* Continuously Rotating 3D Wireframe/Glass Cube */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? { rotateX: -20, rotateY: 32 }
                  : { rotateX: [-18, -24, -18], rotateY: [28, 388] }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotateY: { duration: 22, repeat: Infinity, ease: 'linear' },
                      rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                    }
              }
              className="relative w-28 h-28 sm:w-32 sm:h-32 preserve-3d"
            >
              {/* Front Face */}
              <div
                className="absolute inset-0 rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-blue-600/30 via-slate-900/75 to-cyan-500/20 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 shadow-[inset_0_0_24px_rgba(56,189,248,0.22)]"
                style={{ transform: 'translateZ(64px)' }}
              >
                <Terminal className="w-7 h-7 text-cyan-300" />
                <span className="font-mono text-[10px] tracking-wider text-cyan-200 font-semibold">
                  JUDGE.RUN()
                </span>
              </div>

              {/* Back Face */}
              <div
                className="absolute inset-0 rounded-2xl border border-blue-400/40 bg-gradient-to-br from-indigo-600/25 via-slate-900/75 to-blue-500/20 backdrop-blur-md flex flex-col items-center justify-center gap-1.5"
                style={{ transform: 'rotateY(180deg) translateZ(64px)' }}
              >
                <ShieldCheck className="w-7 h-7 text-emerald-300" />
                <span className="font-mono text-[10px] tracking-wider text-emerald-200 font-semibold">
                  HIDDEN TESTS
                </span>
              </div>

              {/* Right Face */}
              <div
                className="absolute inset-0 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-slate-900/75 to-cyan-500/20 backdrop-blur-md flex flex-col items-center justify-center gap-1.5"
                style={{ transform: 'rotateY(90deg) translateZ(64px)' }}
              >
                <BrainCircuit className="w-7 h-7 text-blue-300" />
                <span className="font-mono text-[10px] tracking-wider text-blue-200 font-semibold">
                  AI COACH
                </span>
              </div>

              {/* Left Face */}
              <div
                className="absolute inset-0 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-slate-900/75 to-blue-600/20 backdrop-blur-md flex flex-col items-center justify-center gap-1.5"
                style={{ transform: 'rotateY(-90deg) translateZ(64px)' }}
              >
                <Fingerprint className="w-7 h-7 text-amber-300" />
                <span className="font-mono text-[10px] tracking-wider text-amber-200 font-semibold">
                  SHA-256
                </span>
              </div>

              {/* Top Face */}
              <div
                className="absolute inset-0 rounded-2xl border border-sky-400/45 bg-gradient-to-br from-sky-400/25 via-blue-600/25 to-slate-900/70 backdrop-blur-md flex items-center justify-center"
                style={{ transform: 'rotateX(90deg) translateZ(64px)' }}
              >
                <Cpu className="w-7 h-7 text-sky-200" />
              </div>

              {/* Bottom Face */}
              <div
                className="absolute inset-0 rounded-2xl border border-blue-500/30 bg-slate-950/80"
                style={{ transform: 'rotateX(-90deg) translateZ(64px)' }}
              />
            </motion.div>
          </motion.div>

          {/* Floating Interactive Telemetry Nodes */}
          <motion.button
            type="button"
            onClick={() => setActiveLayer(LAYERS[0])}
            animate={shouldReduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute top-3 left-1 sm:left-2 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-md ${
              activeLayer.id === 'sandbox'
                ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                : 'bg-slate-900/85 border-slate-700/80 hover:border-cyan-400/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-semibold text-white">Sandbox</span>
            </div>
            <p className="font-mono text-[10px] text-cyan-300 mt-0.5">Python · JS V8</p>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveLayer(LAYERS[1])}
            animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 5.1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className={`absolute top-4 right-1 sm:right-2 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-md ${
              activeLayer.id === 'tests'
                ? 'bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900/85 border-slate-700/80 hover:border-emerald-400/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold text-white">Hidden Suite</span>
            </div>
            <p className="font-mono text-[10px] text-emerald-300 mt-0.5">12/12 passed</p>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveLayer(LAYERS[2])}
            animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className={`absolute bottom-3 left-1 sm:left-2 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-md ${
              activeLayer.id === 'coach'
                ? 'bg-blue-500/15 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                : 'bg-slate-900/85 border-slate-700/80 hover:border-blue-400/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[11px] font-semibold text-white">AI Coach</span>
            </div>
            <p className="font-mono text-[10px] text-blue-300 mt-0.5">Tier 1 → Tier 4</p>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveLayer(LAYERS[3])}
            animate={shouldReduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className={`absolute bottom-3 right-1 sm:right-2 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-md ${
              activeLayer.id === 'dossier'
                ? 'bg-amber-500/15 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/85 border-slate-700/80 hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[11px] font-semibold text-white">Dossier</span>
            </div>
            <p className="font-mono text-[10px] text-amber-300 mt-0.5">Verified Proof</p>
          </motion.button>
        </div>

        {/* Interactive Inspector Footer */}
        <div className="relative z-10 mt-3 rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeLayer.dotColor}`} />
              <span className="text-xs font-semibold text-white truncate">{activeLayer.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${activeLayer.accent}`}>
                {activeLayer.metric}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{activeLayer.detail}</p>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] text-slate-500 shrink-0">
            Move cursor to tilt
          </span>
        </div>
      </div>
    </div>
  );
};
