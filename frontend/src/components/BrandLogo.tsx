import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showStatusDot?: boolean;
  dark?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showStatusDot = false,
  dark = false,
  className = '',
}) => {
  const dims =
    size === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : size === 'lg'
        ? 'w-11 h-11 rounded-2xl'
        : 'w-9 h-9 rounded-xl';

  const svgSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`${dims} flex items-center justify-center shadow-blue-sm transition-transform duration-200 group-hover:scale-105 ${
          dark
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white'
            : 'bg-gradient-to-br from-[#0b1221] via-slate-900 to-blue-950 text-white ring-1 ring-blue-500/30'
        }`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={svgSize}
          aria-hidden="true"
        >
          {/* Outer Hex/Shield Frame */}
          <path
            d="M14 2.5L24 7.8V16.2C24 21.1 19.8 24.7 14 26C8.2 24.7 4 21.1 4 16.2V7.8L14 2.5Z"
            stroke="url(#bq-stroke)"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          {/* Terminal Chevron & Bug Node */}
          <path
            d="M9.5 11.5L12.75 14.25L9.5 17"
            stroke="#38BDF8"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.75 17H18.75"
            stroke="#FFFFFF"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <circle cx="17.5" cy="11.25" r="1.75" fill="#10B981" />
          <defs>
            <linearGradient id="bq-stroke" x1="4" y1="2.5" x2="24" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="0.55" stopColor="#38BDF8" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showStatusDot && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </span>
      )}
    </div>
  );
};
