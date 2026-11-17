import React, { useState } from 'react';
import {
  Layers,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Database,
  Cpu,
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'state' | 'queue' | 'lock' | 'storage' | 'boundary';
  status: 'healthy' | 'warning' | 'violation' | 'locked' | 'active' | 'blocked';
  x: number;
  y: number;
  values?: Record<string, any>;
  description?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  status?: 'normal' | 'active' | 'blocked' | 'error';
  animated?: boolean;
}

interface StateStep {
  step: number;
  title: string;
  description: string;
  invariant_status: 'PASS' | 'VIOLATION';
  invariant_rule: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface StateGraphExplorerProps {
  category?: string;
  challengeSlug?: string;
  challengeTitle?: string;
}

export const StateGraphExplorer: React.FC<StateGraphExplorerProps> = ({
  category = 'logic_state',
  challengeSlug = '',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(1);

  // Generate domain-specific state graphs based on the challenge
  const isConcurrency = category.includes('concurrency') || challengeSlug.includes('race') || challengeSlug.includes('webhook');
  const isRateLimiter = challengeSlug.includes('rate-limiter') || challengeSlug.includes('bucket');

  const steps: StateStep[] = isRateLimiter
    ? [
        {
          step: 1,
          title: 'Initial State: Bucket Full',
          description: 'Bucket initialized with capacity = 5.0, tokens = 5.0, last_refill = T0.',
          invariant_status: 'PASS',
          invariant_rule: '0 <= available_tokens <= max_capacity',
          nodes: [
            { id: 'client', label: 'Client Ingress', type: 'state', status: 'healthy', x: 60, y: 130, values: { burst: '10 reqs' } },
            { id: 'limiter', label: 'Token Bucket', type: 'storage', status: 'healthy', x: 260, y: 130, values: { capacity: 5, tokens: 5.0, rate: '1/sec' }, description: 'Healthy token reserve' },
            { id: 'backend', label: 'Upstream API', type: 'queue', status: 'healthy', x: 460, y: 130, values: { processed: 0 } },
          ],
          edges: [
            { from: 'client', to: 'limiter', label: 'Burst hits', status: 'active', animated: true },
            { from: 'limiter', to: 'backend', label: 'Allowed (tokens > 1)', status: 'normal' },
          ],
        },
        {
          step: 2,
          title: 'Defect Trigger: Rejected Requests Drain Counter Below Zero',
          description: 'When remaining 5 requests are rejected, faulty logic decrements tokens even on refusal, driving tokens to -5.0!',
          invariant_status: 'VIOLATION',
          invariant_rule: 'FAIL: available_tokens (-5.0) < 0 (Capacity Underflow Leak)',
          nodes: [
            { id: 'client', label: 'Client Ingress', type: 'state', status: 'warning', x: 60, y: 130, values: { burst: '5 rejected' } },
            { id: 'limiter', label: 'Token Bucket (LEAKED)', type: 'storage', status: 'violation', x: 260, y: 130, values: { capacity: 5, tokens: -5.0, state: 'NEGATIVE DRAIN' }, description: 'Defect: tokens reduced below zero floor' },
            { id: 'backend', label: 'Upstream API', type: 'queue', status: 'blocked', x: 460, y: 130, values: { locked_out_secs: '10s' } },
          ],
          edges: [
            { from: 'client', to: 'limiter', label: '5 Rejections', status: 'error', animated: true },
            { from: 'limiter', to: 'backend', label: 'Excess Lockout Window', status: 'blocked' },
          ],
        },
        {
          step: 3,
          title: 'Patched State: Idempotent Floor Guard',
          description: 'Refusal returns false WITHOUT deducting tokens. available_tokens stays clamped at 0.0.',
          invariant_status: 'PASS',
          invariant_rule: 'available_tokens = Math.max(0, tokens - cost) (Invariant Restored)',
          nodes: [
            { id: 'client', label: 'Client Ingress', type: 'state', status: 'healthy', x: 60, y: 130, values: { burst: 'Handled' } },
            { id: 'limiter', label: 'Guarded Bucket', type: 'storage', status: 'healthy', x: 260, y: 130, values: { capacity: 5, tokens: 0.0, floor: 'CLAMPED' }, description: 'Tokens clamped at 0.0 floor' },
            { id: 'backend', label: 'Upstream API', type: 'queue', status: 'healthy', x: 460, y: 130, values: { normal_recovery: '5s' } },
          ],
          edges: [
            { from: 'client', to: 'limiter', label: 'Rejected without deduction', status: 'normal' },
            { from: 'limiter', to: 'backend', label: 'Clean rate recovery', status: 'normal' },
          ],
        },
      ]
    : isConcurrency
    ? [
        {
          step: 1,
          title: 'Initial State: Mutex Lock Idle',
          description: 'Thread lock is unacquired. Critical section ledger balance is clean.',
          invariant_status: 'PASS',
          invariant_rule: 'Mutex state == UNLOCKED',
          nodes: [
            { id: 'req_a', label: 'Worker Process A', type: 'state', status: 'healthy', x: 60, y: 80, values: { op: 'credit $50' } },
            { id: 'req_b', label: 'Worker Process B', type: 'state', status: 'healthy', x: 60, y: 180, values: { op: 'credit $50 (duplicate retry)' } },
            { id: 'lock', label: 'Distributed Lock', type: 'lock', status: 'healthy', x: 260, y: 130, values: { state: 'UNLOCKED', owner: 'none' } },
            { id: 'ledger', label: 'Account Ledger', type: 'storage', status: 'healthy', x: 460, y: 130, values: { balance: '$100.00' } },
          ],
          edges: [
            { from: 'req_a', to: 'lock', label: 'acquire()', status: 'active', animated: true },
            { from: 'req_b', to: 'lock', label: 'acquire()', status: 'active', animated: true },
            { from: 'lock', to: 'ledger', label: 'Read state', status: 'normal' },
          ],
        },
        {
          step: 2,
          title: 'Defect: Concurrency Race Condition (Double Credit)',
          description: 'Both workers read balance simultaneously without atomic lock, crediting ledger twice ($200 instead of $150).',
          invariant_status: 'VIOLATION',
          invariant_rule: 'FAIL: Non-Idempotent Concurrent Read-Modify-Write Race',
          nodes: [
            { id: 'req_a', label: 'Worker A (Active)', type: 'state', status: 'warning', x: 60, y: 80, values: { read: '$100', write: '$150' } },
            { id: 'req_b', label: 'Worker B (Active)', type: 'state', status: 'warning', x: 60, y: 180, values: { read: '$100', write: '$150' } },
            { id: 'lock', label: 'Bypassed Lock', type: 'lock', status: 'violation', x: 260, y: 130, values: { state: 'NO_SYNC', defect: 'Race condition' } },
            { id: 'ledger', label: 'Corrupted Ledger', type: 'storage', status: 'violation', x: 460, y: 130, values: { balance: '$200.00', expected: '$150.00' } },
          ],
          edges: [
            { from: 'req_a', to: 'ledger', label: 'Double write', status: 'error', animated: true },
            { from: 'req_b', to: 'ledger', label: 'Double write', status: 'error', animated: true },
          ],
        },
        {
          step: 3,
          title: 'Patched State: Atomic Mutex & Idempotency Key',
          description: 'Atomic lock serializes execution. Worker B detects idempotency key and skips duplicate mutation.',
          invariant_status: 'PASS',
          invariant_rule: 'Linearizability & Idempotency Key Invariant Preserved',
          nodes: [
            { id: 'req_a', label: 'Worker A (Executed)', type: 'state', status: 'healthy', x: 60, y: 80, values: { status: 'APPLIED', delta: '+$50' } },
            { id: 'req_b', label: 'Worker B (Deduplicated)', type: 'state', status: 'healthy', x: 60, y: 180, values: { status: 'DEDUP_SKIPPED' } },
            { id: 'lock', label: 'Atomic Mutex Guard', type: 'lock', status: 'locked', x: 260, y: 130, values: { state: 'LOCKED_SERIALIZED' } },
            { id: 'ledger', label: 'Consistent Ledger', type: 'storage', status: 'healthy', x: 460, y: 130, values: { balance: '$150.00 (EXACT)' } },
          ],
          edges: [
            { from: 'req_a', to: 'lock', label: 'Lock acquired', status: 'normal' },
            { from: 'req_b', to: 'lock', label: 'Key exists -> Early return', status: 'normal' },
            { from: 'lock', to: 'ledger', label: 'Single atomic write', status: 'normal' },
          ],
        },
      ]
    : [
        // Default: State Invariant / E-Commerce Cart Logic
        {
          step: 1,
          title: 'Initial Cart Creation: Single Discount Applied',
          description: 'Cart initialized with $100 keyboard. 20% coupon applied -> Subtotal: $100, Total: $80.',
          invariant_status: 'PASS',
          invariant_rule: 'total = subtotal - (subtotal * rate / 100)',
          nodes: [
            { id: 'item', label: 'Cart Items Array', type: 'storage', status: 'healthy', x: 60, y: 130, values: { count: 1, raw_sum: '$100.00' } },
            { id: 'calc', label: 'Pricing Engine', type: 'state', status: 'healthy', x: 260, y: 130, values: { discount: '$20.00', rate: '20%' } },
            { id: 'total', label: 'Session Output', type: 'state', status: 'healthy', x: 460, y: 130, values: { subtotal: '$100.00', total: '$80.00' } },
          ],
          edges: [
            { from: 'item', to: 'calc', label: 'Read items', status: 'normal' },
            { from: 'calc', to: 'total', label: 'Compute total ($80)', status: 'normal' },
          ],
        },
        {
          step: 2,
          title: 'Defect: Session Reload Mutates Subtotal Twice',
          description: 'Upon page refresh, recalculateTotal() runs again, mutating already-discounted subtotal ($80 - $20 = $60!).',
          invariant_status: 'VIOLATION',
          invariant_rule: 'FAIL: Subtotal Mutation Invariant Broken (recalculation non-idempotent)',
          nodes: [
            { id: 'item', label: 'Cart Items (Raw)', type: 'storage', status: 'healthy', x: 60, y: 130, values: { raw_sum: '$100.00' } },
            { id: 'calc', label: 'Faulty Recalculate', type: 'state', status: 'violation', x: 260, y: 130, values: { mutated_subtotal: '$80.00', second_deduction: '-$20.00' }, description: 'Mutated subtotal instead of raw total' },
            { id: 'total', label: 'Erroneous Output', type: 'state', status: 'violation', x: 460, y: 130, values: { actual_total: '$60.00', expected: '$80.00' } },
          ],
          edges: [
            { from: 'item', to: 'calc', label: 'Ignores raw item sum', status: 'error', animated: true },
            { from: 'calc', to: 'total', label: 'Second $20 deduction applied', status: 'error', animated: true },
          ],
        },
        {
          step: 3,
          title: 'Patched State: Subtotal Preserved as Pure Item Sum',
          description: 'Subtotal invariant strictly sums items. Total = subtotal - discount is idempotent on infinite reloads.',
          invariant_status: 'PASS',
          invariant_rule: 'Pure Invariant: subtotal === sum(item.price * item.quantity)',
          nodes: [
            { id: 'item', label: 'Cart Items (Pure)', type: 'storage', status: 'healthy', x: 60, y: 130, values: { raw_sum: '$100.00' } },
            { id: 'calc', label: 'Idempotent Evaluator', type: 'state', status: 'healthy', x: 260, y: 130, values: { subtotal: '$100.00', discount: '$20.00' } },
            { id: 'total', label: 'Stable Session State', type: 'state', status: 'healthy', x: 460, y: 130, values: { total: '$80.00 (STABLE)' } },
          ],
          edges: [
            { from: 'item', to: 'calc', label: 'Pure functional reduction', status: 'normal' },
            { from: 'calc', to: 'total', label: 'Consistent $80 on every reload', status: 'normal' },
          ],
        },
      ];

  const currentStep = steps[activeStepIndex] || steps[0];

  return (
    <div className="space-y-4 font-sans">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/60 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                Visual State Topology Engine
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  currentStep.invariant_status === 'PASS'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                }`}
              >
                Invariant: {currentStep.invariant_status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Memory &amp; Invariant Transition Graph
            </h3>
          </div>
        </div>

        {/* Step Stepper Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          {steps.map((st, idx) => (
            <button
              key={st.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeStepIndex === idx
                  ? st.invariant_status === 'VIOLATION'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Step {st.step}</span>
              {st.invariant_status === 'VIOLATION' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-300 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Invariant Rule Notification Card */}
      <div
        className={`p-3 rounded-xl border flex flex-col gap-2 text-xs font-mono shadow-xs ${
          currentStep.invariant_status === 'PASS'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-red-50/80 border-red-200 text-red-950'
        }`}
      >
        <div className="flex items-start gap-2">
          {currentStep.invariant_status === 'PASS' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 animate-bounce mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <span className="font-bold text-xs block">{currentStep.title}</span>
            <span className="text-[11px] opacity-90 block mt-0.5 leading-snug">{currentStep.description}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Invariant Rule Assertion:
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border break-words max-w-full ${
            currentStep.invariant_status === 'PASS'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}>
            {currentStep.invariant_rule}
          </span>
        </div>
      </div>

      {/* Interactive Graph Canvas */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 relative shadow-inner">
        {/* Graph Nodes Container */}
        <div className="w-full relative flex items-center justify-between gap-2">
          {/* Interactive HTML Nodes */}
          {currentStep.nodes.map((node) => {
            const isViolation = node.status === 'violation';
            const isWarning = node.status === 'warning';
            const isLocked = node.status === 'locked';

            return (
              <div
                key={node.id}
                className={`flex-1 min-w-0 p-2.5 rounded-xl border backdrop-blur-md shadow-md transition-all ${
                  isViolation
                    ? 'bg-red-950/80 border-red-600 text-red-100 shadow-red-900/30'
                    : isWarning
                    ? 'bg-amber-950/80 border-amber-500 text-amber-100'
                    : isLocked
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-100'
                    : 'bg-slate-900/90 border-slate-700 text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-700/60 mb-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    {node.type === 'lock' ? (
                      <Lock className="w-3 h-3 text-indigo-400 shrink-0" />
                    ) : node.type === 'storage' ? (
                      <Database className="w-3 h-3 text-blue-400 shrink-0" />
                    ) : (
                      <Cpu className="w-3 h-3 text-emerald-400 shrink-0" />
                    )}
                    <span className="font-bold text-[11px] font-mono truncate">{node.label}</span>
                  </div>

                  <span
                    className={`px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                      isViolation
                        ? 'bg-red-600 text-white'
                        : isWarning
                        ? 'bg-amber-600 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                {/* Values table */}
                {node.values && (
                  <div className="space-y-1 text-[11px] font-mono">
                    {Object.entries(node.values).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 text-[10px]">{k}:</span>
                        <strong
                          className={
                            isViolation && (String(v).includes('-') || String(v).includes('60'))
                              ? 'text-red-400 font-bold'
                              : 'text-white'
                          }
                        >
                          {String(v)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                {node.description && (
                  <p className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-sans italic">
                    {node.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Canvas Footer Legend */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Invariant Intact
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Invariant Breached
            </span>
          </div>

          <span className="text-indigo-400 font-sans">
            Use Step tabs above to scrub through the defect transition sequence
          </span>
        </div>
      </div>
    </div>
  );
};
