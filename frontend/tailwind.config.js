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
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        obsidian: {
          950: '#06080d',
          900: '#0a0d14',
          850: '#0e121b',
          800: '#141a27',
          750: '#1b2234',
          700: '#232c42',
          600: '#323d5a',
          500: '#485579',
          400: '#6d7b9f',
          300: '#9aa5c2',
          200: '#c5cde0',
          100: '#e3e8f4',
        },
        quest: {
          dark: '#07090e',
          card: '#0d111c',
          cardHover: '#111726',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
          borderHover: 'rgba(99, 102, 241, 0.3)',
          muted: '#8b949e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 25px -4px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 40px -5px rgba(99, 102, 241, 0.45)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.3)',
        'card': '0 8px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'card-hover': '0 12px 40px -8px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
