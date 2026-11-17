import React, { useState } from 'react';
import {
  SkipBack,
  SkipForward,
  RotateCcw,
  Bug,
  Code2,
  Cpu,
  CheckCircle2,
  AlertOctagon,
  CornerDownRight,
} from 'lucide-react';

interface ExecutionFrame {
  step: number;
  line: number;
  file: string;
  statement: string;
  scope: Record<string, any>;
  call_stack: string[];
  is_bug_trigger?: boolean;
  annotation?: string;
}

interface TimeTravelDebuggerProps {
  challengeSlug?: string;
  onLineChange?: (line: number, file: string) => void;
}

export const TimeTravelDebugger: React.FC<TimeTravelDebuggerProps> = ({
  challengeSlug = '',
  onLineChange,
}) => {
  const isCart = challengeSlug.includes('cart') || challengeSlug.includes('discount');

  // Realistic Execution Frames for the debugger
  const frames: ExecutionFrame[] = isCart
    ? [
        {
          step: 1,
          line: 14,
          file: 'src/cart.js',
          statement: 'applyCoupon("SAVE20", 20)',
          scope: {
            'this.items': '[{ id: "item-1", price: 100, qty: 1 }]',
            'this.coupon': '{ code: "SAVE20", rate: 20 }',
            'this.subtotal': 100,
            'this.total': 100,
          },
          call_stack: ['ShoppingCart.applyCoupon (src/cart.js:14)', 'runTest (tests/runner.cjs:24)'],
          annotation: 'Coupon applied to cart session state.',
        },
        {
          step: 2,
          line: 25,
          file: 'src/cart.js',
          statement: 'let rawItemTotal = 100',
          scope: {
            'rawItemTotal': 100,
            'this.coupon.rate': 20,
            'this.subtotal': 100,
            'this.total': 100,
          },
          call_stack: ['ShoppingCart.recalculate (src/cart.js:25)', 'runTest (tests/runner.cjs:31)'],
          annotation: 'Summed raw items baseline: $100.00.',
        },
        {
          step: 3,
          line: 32,
          file: 'src/cart.js',
          statement: 'const discount = calculateDiscount(rawItemTotal, 20)',
          scope: {
            'rawItemTotal': 100,
            'discount': 20,
            'this.subtotal': 100,
            'this.total': 100,
          },
          call_stack: ['calculateDiscount (src/pricing.js:3)', 'ShoppingCart.recalculate (src/cart.js:32)'],
          annotation: 'Discount calculated: $20.00.',
        },
        {
          step: 4,
          line: 33,
          file: 'src/cart.js',
          statement: 'this.subtotal = rawItemTotal - discount; // BUG TRIGGER',
          scope: {
            'rawItemTotal': 100,
            'discount': 20,
            'this.subtotal': 80, // MUTATED
            'this.total': 100,
          },
          call_stack: ['ShoppingCart.recalculate (src/cart.js:33)', 'runTest (tests/runner.cjs:33)'],
          is_bug_trigger: true,
          annotation: '⚠️ DEFECT: Subtotal mutated to $80.00 instead of preserving raw $100.00!',
        },
        {
          step: 5,
          line: 34,
          file: 'src/cart.js',
          statement: 'this.total = this.subtotal - discount; // DOUBLE DEDUCTION',
          scope: {
            'discount': 20,
            'this.subtotal': 80,
            'this.total': 60, // DOUBLE DEDUCTED (80 - 20 = 60!)
          },
          call_stack: ['ShoppingCart.recalculate (src/cart.js:34)', 'runTest (tests/runner.cjs:35)'],
          is_bug_trigger: true,
          annotation: '🚨 ASSERTION FAILURE: Total became $60.00 instead of $80.00 ($20 deducted twice)!',
        },
      ]
    : [
        {
          step: 1,
          line: 4,
          file: 'src/index.js',
          statement: 'let left = 0, right = nums.length - 1',
          scope: { 'left': 0, 'right': 6, 'target': 0 },
          call_stack: ['binarySearch (src/index.js:4)', 'main (tests/runner.cjs:12)'],
          annotation: 'Initialized search range [0, 6].',
        },
        {
          step: 2,
          line: 8,
          file: 'src/index.js',
          statement: 'const mid = Math.floor((left + right) / 2)',
          scope: { 'left': 0, 'right': 6, 'mid': 3, 'nums[mid]': 7 },
          call_stack: ['binarySearch (src/index.js:8)', 'main (tests/runner.cjs:14)'],
          annotation: 'Pivot mid = 3, value = 7.',
        },
        {
          step: 3,
          line: 14,
          file: 'src/index.js',
          statement: 'if (nums[left] < target) // DEFECT: strictly < drops target == nums[left]',
          scope: { 'left': 0, 'nums[left]': 4, 'target': 0, 'comparison': false },
          call_stack: ['binarySearch (src/index.js:14)', 'main (tests/runner.cjs:16)'],
          is_bug_trigger: true,
          annotation: '⚠️ Boundary defect: strict inequality drops target sitting on boundary.',
        },
      ];

  const [currentStepIdx, setCurrentStepIdx] = useState(frames.length - 1);

  const currentFrame = frames[currentStepIdx] || frames[0];

  const handleNext = () => {
    if (currentStepIdx < frames.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      if (onLineChange) onLineChange(frames[nextIdx].line, frames[nextIdx].file);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      if (onLineChange) onLineChange(frames[prevIdx].line, frames[prevIdx].file);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    if (onLineChange) onLineChange(frames[0].line, frames[0].file);
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Control Scrubber Bar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Time-Travel Execution Replayer
            </span>
            <span className="text-xs font-bold text-white">
              Frame {currentFrame.step} of {frames.length}: {currentFrame.file}#L{currentFrame.line}
            </span>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={handleReset}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset to initial frame"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors flex items-center gap-1 font-bold text-[11px]"
          >
            <SkipBack className="w-3 h-3" /> Step Back
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIdx === frames.length - 1}
            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 transition-colors flex items-center gap-1 font-bold text-[11px]"
          >
            Step Next <SkipForward className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Frame Annotation / Bug Trigger Alert */}
      {currentFrame.annotation && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            currentFrame.is_bug_trigger
              ? 'bg-red-950/70 border-red-800 text-red-200'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          {currentFrame.is_bug_trigger ? (
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{currentFrame.annotation}</span>
        </div>
      )}

      {/* Split Inspector: Current Statement & Scope Variables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Active Statement */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Current Executing AST Statement
            </span>
            <span className="text-[10px] text-blue-400 font-bold">{currentFrame.file}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto">
            <code>Line {currentFrame.line}: {currentFrame.statement}</code>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Call Stack</span>
            <ul className="space-y-0.5 text-[11px] text-slate-400">
              {currentFrame.call_stack.map((cs, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3 text-slate-600" />
                  <span>{cs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scope Variables Table */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Local Scope Heap &amp; Variables
            </span>
            <span className="text-[10px] text-slate-500">{Object.keys(currentFrame.scope).length} variables</span>
          </div>

          <div className="divide-y divide-slate-800 max-h-36 overflow-y-auto">
            {Object.entries(currentFrame.scope).map(([key, val]) => (
              <div key={key} className="py-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">{key}</span>
                <span
                  className={`font-bold ${
                    currentFrame.is_bug_trigger && (String(val).includes('80') || String(val).includes('60'))
                      ? 'text-red-400 font-bold bg-red-950/60 px-1 rounded'
                      : 'text-emerald-400'
                  }`}
                >
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
