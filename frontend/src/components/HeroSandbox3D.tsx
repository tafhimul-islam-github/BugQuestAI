import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from 'framer-motion';
import {
  Cpu,
  ShieldCheck,
  BrainCircuit,
  Fingerprint,
  Play,
  FileCode2,
  Loader2,
} from 'lucide-react';

interface LayerInfo {
  id: 'sandbox' | 'tests' | 'coach' | 'dossier';
  label: string;
  metric: string;
  detail: string;
  pillClass: string;
  dotClass: string;
}

const LAYERS: LayerInfo[] = [
  {
    id: 'sandbox',
    label: 'Subprocess Sandbox',
    metric: '14ms boot',
    detail: 'Isolated Python 3 & Node V8 execution with strict memory limits',
    pillClass: 'text-blue-700 border-blue-200 bg-blue-50',
    dotClass: 'bg-blue-600',
  },
  {
    id: 'tests',
    label: 'Hidden Test Suite',
    metric: '12 / 12 passed',
    detail: 'Private edge-case assertions verified exclusively server-side',
    pillClass: 'text-emerald-700 border-emerald-200 bg-emerald-50',
    dotClass: 'bg-emerald-600',
  },
  {
    id: 'coach',
    label: '4-Tier AI Coach',
    metric: 'Zero spoilers',
    detail: 'Socratic hints calibrated directly to your live failure trace',
    pillClass: 'text-indigo-700 border-indigo-200 bg-indigo-50',
    dotClass: 'bg-indigo-600',
  },
  {
    id: 'dossier',
    label: 'Readiness Dossier',
    metric: 'SHA-256 token',
    detail: 'Consent-governed, one-click revocable proof for hiring teams',
    pillClass: 'text-amber-700 border-amber-200 bg-amber-50',
    dotClass: 'bg-amber-500',
  },
];

export const HeroSandbox3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = useState<LayerInfo>(LAYERS[0]);
  const [runState, setRunState] = useState<'idle' | 'running' | 'passed'>('idle');
  const [runDuration, setRunDuration] = useState<string>('14.2ms');

  const handleSimulatedRun = () => {
    if (runState === 'running') return;
    setRunState('running');
    window.setTimeout(() => {
      const ms = (12.4 + Math.random() * 3.1).toFixed(1);
      setRunDuration(`${ms}ms`);
      setRunState('passed');
      setActiveLayer(LAYERS[1]);
    }, 620);
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 24, mass: 0.7 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();
  const scrollTiltX = useTransform(scrollY, [0, 520], [4, -10]);
  const scrollLiftY = useTransform(scrollY, [0, 520], [0, -24]);

  const pointerRotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const pointerRotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
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
      className="relative w-full max-w-[560px] mx-auto perspective-1200 select-none py-3"
    >
      {/* Soft Porcelain & Sky Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 bg-gradient-to-tr from-blue-100/80 via-indigo-50/50 to-sky-100/70 rounded-[2.5rem] blur-2xl opacity-80 pointer-events-none"
      />

      {/* 3D Layered Glassmorphic Workspace Assembly */}
      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : {
                rotateX: scrollTiltX,
                y: scrollLiftY,
              }
        }
        className="relative preserve-3d"
      >
        <motion.div
          style={
            shouldReduceMotion
              ? undefined
              : {
                  rotateX: pointerRotateX,
                  rotateY: pointerRotateY,
                }
          }
          className="relative preserve-3d rounded-[1.75rem] bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_30px_70px_-20px_rgba(37,99,235,0.16),0_12px_30px_-12px_rgba(15,23,42,0.08)] p-5 sm:p-6"
        >
          {/* Realistic Light-Mode IDE Chrome */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
              <div className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600">
                <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                <span>checkout_pricing.py</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sandbox ready</span>
            </div>
          </div>

          {/* Realistic Light-Mode Code Diff Surface */}
          <div className="rounded-2xl bg-[#f8fafc] border border-slate-200/80 p-4 font-mono text-[11.5px] leading-6 text-slate-700 overflow-hidden">
            <div className="flex items-center gap-3 px-2 py-0.5 text-slate-500">
              <span className="w-4 text-right text-slate-400 select-none">14</span>
              <span>
                <span className="text-indigo-600 font-semibold">def</span>{' '}
                <span className="text-blue-700 font-semibold">apply_coupon</span>(total, rate):
              </span>
            </div>
            <div className="flex items-center gap-3 px-2 py-0.5 rounded-lg bg-rose-50/90 border border-rose-200/70 text-rose-900 my-1">
              <span className="w-4 text-right text-rose-400 select-none">15</span>
              <span className="truncate">
                <span className="text-rose-600 font-semibold">-</span>{' '}
                discount = total * rate{' '}
                <span className="text-rose-500 italic"># uncapped overflow</span>
              </span>
            </div>
            <div className="flex items-center gap-3 px-2 py-0.5 rounded-lg bg-emerald-50/90 border border-emerald-200/70 text-emerald-900 my-1">
              <span className="w-4 text-right text-emerald-500 select-none">16</span>
              <span className="truncate">
                <span className="text-emerald-600 font-semibold">+</span>{' '}
                discount = min(total, round(total * rate, 2))
              </span>
            </div>
            <div className="flex items-center gap-3 px-2 py-0.5 text-slate-700">
              <span className="w-4 text-right text-slate-400 select-none">17</span>
              <span>
                <span className="text-indigo-600 font-semibold">return</span> max(0.0, total - discount)
              </span>
            </div>
          </div>

          {/* Interactive Layer Selector Pills */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LAYERS.map((layer) => {
              const active = activeLayer.id === layer.id;
              const Icon =
                layer.id === 'sandbox'
                  ? Cpu
                  : layer.id === 'tests'
                    ? ShieldCheck
                    : layer.id === 'coach'
                      ? BrainCircuit
                      : Fingerprint;
              return (
                <button
                  type="button"
                  key={layer.id}
                  onClick={() => setActiveLayer(layer)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-50/90 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        active ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-[11px] font-semibold text-slate-800 truncate">
                      {layer.label.split(' ')[0]}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 truncate w-full">
                    {layer.metric}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Layer Inspector Footer */}
          <div className="mt-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0" aria-live="polite">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeLayer.dotClass}`} />
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {runState === 'running'
                    ? 'Executing hidden suite…'
                    : runState === 'passed' && activeLayer.id === 'tests'
                      ? `All 12 tests passed (${runDuration})`
                      : activeLayer.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${activeLayer.pillClass}`}
                >
                  {runState === 'passed' && activeLayer.id === 'tests' ? 'VERIFIED' : activeLayer.metric}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 truncate">{activeLayer.detail}</p>
            </div>
            <button
              type="button"
              onClick={handleSimulatedRun}
              disabled={runState === 'running'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shrink-0 shadow-xs transition-all cursor-pointer disabled:opacity-70"
            >
              {runState === 'running' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Running</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>{runState === 'passed' ? 'Re-run' : 'Run'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
