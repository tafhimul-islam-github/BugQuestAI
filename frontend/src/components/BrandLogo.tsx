import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showStatusDot?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showStatusDot = false,
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
        className={`${dims} flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-[0_6px_16px_-4px_rgba(37,99,235,0.42)] ring-1 ring-blue-500/20 transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={svgSize}
          aria-hidden="true"
        >
          <path
            d="M14 2.75L23.75 7.9V16.1C23.75 20.9 19.65 24.45 14 25.75C8.35 24.45 4.25 20.9 4.25 16.1V7.9L14 2.75Z"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 11.5L12.75 14.25L9.5 17"
            stroke="#FFFFFF"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.75 17H18.75"
            stroke="#BAE6FD"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <circle cx="17.5" cy="11.25" r="1.75" fill="#6EE7B7" />
        </svg>
      </div>
      {showStatusDot && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
        </span>
      )}
    </div>
  );
};
