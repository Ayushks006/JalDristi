/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#030816',
          900: '#071329',
          850: '#0b1b3b',
          800: '#0e244f',
          700: '#14366e',
          600: '#1b4d96',
          500: '#2367c2',
        },
        cyan: {
          glow: '#00f2fe',
          neon: '#05d5ff',
          muted: '#38bdf8',
        },
        turquoise: {
          accent: '#14b8a6',
          glow: '#2dd4bf',
        },
        navy: {
          card: 'rgba(7, 19, 41, 0.75)',
          border: 'rgba(14, 165, 233, 0.25)',
          glow: 'rgba(6, 182, 212, 0.15)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
