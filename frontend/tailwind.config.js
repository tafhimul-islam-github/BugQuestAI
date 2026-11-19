/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        quest: {
          bg: '#f8fafc',
          card: '#ffffff',
          cardHover: '#f1f5f9',
          border: '#e2e8f0',
          borderSubtle: '#f1f5f9',
          borderHover: '#bfdbfe',
          muted: '#64748b',
          text: '#0f172a',
          navy: '#0b192c',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Cascadia Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(11, 18, 33, 0.05), 0 1px 2px -1px rgba(11, 18, 33, 0.04)',
        'card': '0 1px 3px 0 rgba(11, 18, 33, 0.05), 0 4px 14px -2px rgba(11, 18, 33, 0.04)',
        'card-hover': '0 14px 32px -8px rgba(37, 99, 235, 0.12), 0 6px 14px -4px rgba(11, 18, 33, 0.06)',
        'blue-sm': '0 4px 14px -2px rgba(37, 99, 235, 0.28)',
        'blue-md': '0 8px 24px -4px rgba(37, 99, 235, 0.34)',
        'blue-lg': '0 14px 36px -6px rgba(37, 99, 235, 0.38)',
        'obsidian': '0 24px 60px -15px rgba(11, 18, 33, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.14)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.18)', opacity: '0' },
          '100%': { transform: 'scale(1.18)', opacity: '0' },
        },
      }
    },
  },
  plugins: [],
}
