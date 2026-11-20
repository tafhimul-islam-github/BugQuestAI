import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Vector 1: Isolated Subprocess Sandbox Diagram (Pure Light Architectural Style)
 */
export const SandboxIsolationVector: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="320" height="120" rx="14" fill="#F8FAFC" />
      <path d="M0 40H320M0 80H320M80 0V120M160 0V120M240 0V120" stroke="#E2E8F0" strokeWidth="0.75" />

      {/* Left Code Node */}
      <rect x="18" y="34" width="68" height="52" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.4" />
      <rect x="28" y="46" width="32" height="5" rx="2.5" fill="#2563EB" />
      <rect x="28" y="56" width="46" height="4" rx="2" fill="#94A3B8" />
      <rect x="28" y="65" width="38" height="4" rx="2" fill="#CBD5E1" />

      {/* Flow Line Left -> Sandbox */}
      <path d="M86 60H122" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
      {!reduced && (
        <motion.circle
          cx="88"
          cy="60"
          r="3.5"
          fill="#2563EB"
          animate={{ cx: [88, 120] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Center Isolated Sandbox Card (Light Frosted Cobalt) */}
      <rect x="122" y="18" width="84" height="84" rx="14" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.6" />
      <rect x="123" y="19" width="82" height="20" rx="13" fill="#EFF6FF" />
      <circle cx="135" cy="29" r="2.2" fill="#F87171" />
      <circle cx="143" cy="29" r="2.2" fill="#FBBF24" />
      <circle cx="151" cy="29" r="2.2" fill="#34D399" />
      <path d="M138 56L146 62L138 68" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="152" y="63" width="28" height="4" rx="2" fill="#475569" />
      <rect x="136" y="79" width="56" height="7" rx="3.5" fill="#E0F2FE" />
      <rect x="136" y="79" width="38" height="7" rx="3.5" fill="#2563EB" />

      {/* Flow Line Sandbox -> Verdict */}
      <path d="M206 60H240" stroke="#6EE7B7" strokeWidth="2" strokeDasharray="4 4" />
      {!reduced && (
        <motion.circle
          cx="208"
          cy="60"
          r="3.5"
          fill="#10B981"
          animate={{ cx: [208, 238] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        />
      )}

      {/* Right Verdict Node */}
      <rect x="240" y="34" width="62" height="52" rx="10" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.4" />
      <circle cx="271" cy="54" r="10" fill="#10B981" />
      <path d="M266.5 54L269.8 57.3L276 51" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="253" y="71" width="36" height="4" rx="2" fill="#059669" fillOpacity="0.45" />
    </svg>
  );
};

/**
 * Vector 2: Private Hidden Boundary Test Matrix (Pure Light Style)
 */
export const HiddenTestMatrixVector: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="320" height="120" rx="14" fill="#F8FAFC" />

      <circle cx="160" cy="60" r="46" stroke="#D1FAE5" strokeWidth="1.25" />
      <circle cx="160" cy="60" r="30" stroke="#A7F3D0" strokeWidth="1.25" strokeDasharray="3 3" />
      <circle cx="160" cy="60" r="14" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />

      <path
        d="M160 51L167 54.5V60.5C167 64.5 164 67.5 160 69C156 67.5 153 64.5 153 60.5V54.5L160 51Z"
        fill="#10B981"
      />

      <rect x="18" y="24" width="78" height="22" rx="7" fill="#FFFFFF" stroke="#E2E8F0" />
      <circle cx="30" cy="35" r="3.5" fill="#10B981" />
      <rect x="40" y="33" width="46" height="4" rx="2" fill="#64748B" />

      <rect x="18" y="74" width="78" height="22" rx="7" fill="#FFFFFF" stroke="#E2E8F0" />
      <circle cx="30" cy="85" r="3.5" fill="#10B981" />
      <rect x="40" y="83" width="42" height="4" rx="2" fill="#64748B" />

      <rect x="224" y="24" width="78" height="22" rx="7" fill="#EFF6FF" stroke="#BFDBFE" />
      <circle cx="236" cy="35" r="3.5" fill="#2563EB" />
      <rect x="246" y="33" width="44" height="4" rx="2" fill="#3B82F6" fillOpacity="0.65" />

      <rect x="224" y="74" width="78" height="22" rx="7" fill="#FFFBEB" stroke="#FDE68A" />
      <circle cx="236" cy="85" r="3.5" fill="#D97706" />
      <rect x="246" y="83" width="44" height="4" rx="2" fill="#D97706" fillOpacity="0.55" />

      {!reduced && (
        <motion.circle
          cx="160"
          cy="60"
          r="14"
          stroke="#10B981"
          strokeWidth="1.5"
          animate={{ r: [14, 46], opacity: [0.65, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </svg>
  );
};

/**
 * Vector 3: Cryptographic Shareable Dossier Seal (Pure Light Style)
 */
export const CryptoDossierVector: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="320" height="120" rx="14" fill="#F8FAFC" />

      <rect x="30" y="18" width="170" height="84" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.4" />
      <rect x="46" y="32" width="66" height="6" rx="3" fill="#0F172A" />
      <rect x="46" y="45" width="112" height="4" rx="2" fill="#94A3B8" />
      <rect x="46" y="55" width="92" height="4" rx="2" fill="#CBD5E1" />

      <rect x="46" y="70" width="136" height="6" rx="3" fill="#F1F5F9" />
      <rect x="46" y="70" width="106" height="6" rx="3" fill="#2563EB" />
      <rect x="46" y="82" width="136" height="6" rx="3" fill="#F1F5F9" />
      <rect x="46" y="82" width="84" height="6" rx="3" fill="#10B981" />

      <rect x="184" y="30" width="106" height="60" rx="12" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="206" cy="52" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.4" />
      <path d="M202.5 52L205 54.5L210 49.5" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="223" y="46" width="52" height="5" rx="2.5" fill="#0F172A" />
      <rect x="223" y="56" width="40" height="4" rx="2" fill="#64748B" />
      <rect x="196" y="73" width="82" height="6" rx="3" fill="#FEF3C7" />
      <rect x="196" y="73" width="54" height="6" rx="3" fill="#F59E0B" />
    </svg>
  );
};

/**
 * Vector 4: Auth Split Showcase Vector Graphic (Pure Light Architectural Style)
 */
export const AuthShowcaseVector: React.FC<{ className?: string }> = ({ className = 'w-full h-44' }) => {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 380 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="12" y="14" width="248" height="148" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="13" y="15" width="246" height="28" rx="13" fill="#F8FAFC" />
      <line x1="12" y1="43" x2="260" y2="43" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="30" cy="29" r="3.5" fill="#F87171" />
      <circle cx="42" cy="29" r="3.5" fill="#FBBF24" />
      <circle cx="54" cy="29" r="3.5" fill="#34D399" />

      <rect x="28" y="56" width="76" height="5" rx="2.5" fill="#2563EB" />
      <rect x="112" y="56" width="48" height="5" rx="2.5" fill="#94A3B8" />
      <rect x="38" y="72" width="124" height="5" rx="2.5" fill="#CBD5E1" />
      <rect x="26" y="86" width="218" height="16" rx="5" fill="#FFF1F2" stroke="#FECDD3" />
      <rect x="38" y="92" width="110" height="4" rx="2" fill="#E11D48" fillOpacity="0.65" />
      <rect x="26" y="108" width="218" height="16" rx="5" fill="#ECFDF5" stroke="#A7F3D0" />
      <rect x="38" y="114" width="142" height="4" rx="2" fill="#059669" fillOpacity="0.7" />
      <rect x="28" y="138" width="84" height="5" rx="2.5" fill="#6366F1" fillOpacity="0.7" />

      <motion.g
        animate={reduced ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="228" y="42" width="140" height="96" rx="14" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
        <circle cx="252" cy="66" r="11" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
        <path d="M247.5 66L250.5 69L256.5 63" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="272" y="60" width="76" height="5" rx="2.5" fill="#0F172A" />
        <rect x="272" y="70" width="52" height="4" rx="2" fill="#94A3B8" />
        <rect x="242" y="92" width="112" height="7" rx="3.5" fill="#F1F5F9" />
        <rect x="242" y="92" width="92" height="7" rx="3.5" fill="#2563EB" />
        <rect x="242" y="108" width="112" height="7" rx="3.5" fill="#F1F5F9" />
        <rect x="242" y="108" width="76" height="7" rx="3.5" fill="#10B981" />
      </motion.g>
    </svg>
  );
};
