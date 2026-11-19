import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Vector 1: Isolated Subprocess Sandbox Diagram
 */
export const SandboxIsolationVector: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Subtle background grid */}
      <rect width="320" height="120" rx="14" fill="#F8FAFC" />
      <path d="M0 40H320M0 80H320M80 0V120M160 0V120M240 0V120" stroke="#E2E8F0" strokeWidth="0.75" />

      {/* Left Code Node */}
      <rect x="18" y="34" width="68" height="52" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="28" y="46" width="32" height="5" rx="2.5" fill="#2563EB" />
      <rect x="28" y="56" width="46" height="4" rx="2" fill="#94A3B8" />
      <rect x="28" y="65" width="38" height="4" rx="2" fill="#CBD5E1" />

      {/* Connecting Line Left -> Sandbox */}
      <path d="M86 60H122" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
      {!reduced && (
        <motion.circle
          cx="86"
          cy="60"
          r="3.5"
          fill="#2563EB"
          animate={{ cx: [88, 120] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Center Isolated Container */}
      <rect x="122" y="20" width="84" height="80" rx="14" fill="#0B1221" stroke="#38BDF8" strokeWidth="1.75" />
      <rect x="134" y="34" width="60" height="10" rx="4" fill="#1E293B" />
      <circle cx="141" cy="39" r="2" fill="#F43F5E" />
      <circle cx="148" cy="39" r="2" fill="#FBBF24" />
      <circle cx="155" cy="39" r="2" fill="#10B981" />
      <path d="M138 58L146 64L138 70" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="152" y="66" width="26" height="4" rx="2" fill="#E2E8F0" />
      <rect x="138" y="80" width="52" height="6" rx="3" fill="#0F766E" fillOpacity="0.45" />
      <rect x="138" y="80" width="34" height="6" rx="3" fill="#10B981" />

      {/* Connecting Line Sandbox -> Verdict */}
      <path d="M206 60H240" stroke="#6EE7B7" strokeWidth="2" strokeDasharray="4 4" />
      {!reduced && (
        <motion.circle
          cx="206"
          cy="60"
          r="3.5"
          fill="#10B981"
          animate={{ cx: [208, 238] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        />
      )}

      {/* Right Verdict Node */}
      <rect x="240" y="34" width="62" height="52" rx="10" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
      <circle cx="271" cy="54" r="10" fill="#10B981" />
      <path d="M266.5 54L269.8 57.3L276 51" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="253" y="71" width="36" height="4" rx="2" fill="#059669" fillOpacity="0.45" />
    </svg>
  );
};

/**
 * Vector 2: Private Hidden Boundary Test Matrix
 */
export const HiddenTestMatrixVector: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="320" height="120" rx="14" fill="#F8FAFC" />

      {/* Radar Concentric Arcs */}
      <circle cx="160" cy="60" r="46" stroke="#D1FAE5" strokeWidth="1.25" />
      <circle cx="160" cy="60" r="30" stroke="#A7F3D0" strokeWidth="1.25" strokeDasharray="3 3" />
      <circle cx="160" cy="60" r="14" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />

      {/* Shield Core */}
      <path
        d="M160 51L167 54.5V60.5C167 64.5 164 67.5 160 69C156 67.5 153 64.5 153 60.5V54.5L160 51Z"
        fill="#10B981"
      />

      {/* Hidden Edge Case Pills */}
      <rect x="20" y="24" width="76" height="22" rx="7" fill="#FFFFFF" stroke="#E2E8F0" />
      <circle cx="32" cy="35" r="3.5" fill="#10B981" />
      <rect x="42" y="33" width="44" height="4" rx="2" fill="#64748B" />

      <rect x="20" y="74" width="76" height="22" rx="7" fill="#FFFFFF" stroke="#E2E8F0" />
      <circle cx="32" cy="85" r="3.5" fill="#10B981" />
      <rect x="42" y="83" width="40" height="4" rx="2" fill="#64748B" />

      <rect x="224" y="24" width="76" height="22" rx="7" fill="#0B1221" stroke="#334155" />
      <circle cx="236" cy="35" r="3.5" fill="#38BDF8" />
      <rect x="246" y="33" width="42" height="4" rx="2" fill="#94A3B8" />

      <rect x="224" y="74" width="76" height="22" rx="7" fill="#0B1221" stroke="#334155" />
      <circle cx="236" cy="85" r="3.5" fill="#F59E0B" />
      <rect x="246" y="83" width="44" height="4" rx="2" fill="#94A3B8" />

      {/* Animated pulse ring */}
      {!reduced && (
        <motion.circle
          cx="160"
          cy="60"
          r="14"
          stroke="#10B981"
          strokeWidth="1.5"
          animate={{ r: [14, 46], opacity: [0.7, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </svg>
  );
};

/**
 * Vector 3: Cryptographic Shareable Dossier Seal
 */
export const CryptoDossierVector: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="320" height="120" rx="14" fill="#F8FAFC" />

      {/* Document Card */}
      <rect x="34" y="18" width="168" height="84" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="50" y="32" width="64" height="6" rx="3" fill="#0F172A" />
      <rect x="50" y="45" width="110" height="4" rx="2" fill="#94A3B8" />
      <rect x="50" y="55" width="92" height="4" rx="2" fill="#CBD5E1" />

      {/* Skill Bars inside Document */}
      <rect x="50" y="70" width="136" height="6" rx="3" fill="#F1F5F9" />
      <rect x="50" y="70" width="106" height="6" rx="3" fill="#2563EB" />
      <rect x="50" y="82" width="136" height="6" rx="3" fill="#F1F5F9" />
      <rect x="50" y="82" width="84" height="6" rx="3" fill="#10B981" />

      {/* Cryptographic Seal Badge */}
      <rect x="184" y="32" width="102" height="58" rx="12" fill="#0B1221" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="206" cy="54" r="10" fill="#F59E0B" fillOpacity="0.18" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M202.5 54L205 56.5L210 51.5" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="223" y="48" width="48" height="5" rx="2.5" fill="#F8FAFC" />
      <rect x="223" y="58" width="38" height="4" rx="2" fill="#94A3B8" />
      <rect x="196" y="74" width="78" height="6" rx="3" fill="#1E293B" />
      <rect x="200" y="76" width="52" height="2" rx="1" fill="#FBBF24" />
    </svg>
  );
};

/**
 * Vector 4: Auth Split Showcase Vector Graphic
 */
export const AuthShowcaseVector: React.FC<{ className?: string }> = ({ className = 'w-full h-44' }) => {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 380 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Terminal Window */}
      <rect x="12" y="14" width="248" height="148" rx="14" fill="#111A2E" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="12" y="14" width="248" height="28" rx="14" fill="#17233B" />
      <circle cx="30" cy="28" r="3.5" fill="#F43F5E" />
      <circle cx="42" cy="28" r="3.5" fill="#FBBF24" />
      <circle cx="54" cy="28" r="3.5" fill="#10B981" />

      {/* Code Lines */}
      <rect x="28" y="56" width="76" height="5" rx="2.5" fill="#38BDF8" />
      <rect x="112" y="56" width="48" height="5" rx="2.5" fill="#64748B" />
      <rect x="38" y="72" width="124" height="5" rx="2.5" fill="#E2E8F0" fillOpacity="0.8" />
      {/* Bug Highlight Line */}
      <rect x="26" y="86" width="218" height="16" rx="5" fill="#F43F5E" fillOpacity="0.16" stroke="#F43F5E" strokeOpacity="0.45" />
      <rect x="38" y="92" width="110" height="4" rx="2" fill="#FDA4AF" />
      {/* Fixed Line */}
      <rect x="26" y="108" width="218" height="16" rx="5" fill="#10B981" fillOpacity="0.14" stroke="#10B981" strokeOpacity="0.45" />
      <rect x="38" y="114" width="142" height="4" rx="2" fill="#6EE7B7" />
      <rect x="28" y="138" width="84" height="5" rx="2.5" fill="#60A5FA" />

      {/* Floating Verification Card */}
      <motion.g
        animate={reduced ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="228" y="42" width="140" height="96" rx="14" fill="#0B1221" stroke="#38BDF8" strokeWidth="1.5" />
        <circle cx="252" cy="66" r="11" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="1.5" />
        <path d="M247.5 66L250.5 69L256.5 63" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="272" y="60" width="76" height="5" rx="2.5" fill="#FFFFFF" />
        <rect x="272" y="70" width="52" height="4" rx="2" fill="#94A3B8" />
        <rect x="242" y="92" width="112" height="7" rx="3.5" fill="#1E293B" />
        <rect x="242" y="92" width="92" height="7" rx="3.5" fill="#2563EB" />
        <rect x="242" y="108" width="112" height="7" rx="3.5" fill="#1E293B" />
        <rect x="242" y="108" width="76" height="7" rx="3.5" fill="#10B981" />
      </motion.g>
    </svg>
  );
};
