/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          950: '#050607',
          900: '#0A0C0E',
          850: '#0F1215',
          800: '#15191D',
          750: '#1C2227',
          700: '#252D34',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(197, 255, 54, 0.3)',
        },
        neon: {
          DEFAULT: '#C5FF36',
          hover: '#D4FF66',
          dark: '#9FE600',
          dim: 'rgba(197, 255, 54, 0.12)',
          border: 'rgba(197, 255, 54, 0.25)',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 15px rgba(197, 255, 54, 0.15)',
        'neon-md': '0 0 30px rgba(197, 255, 54, 0.25)',
        'neon-lg': '0 0 50px rgba(197, 255, 54, 0.35)',
      },
      animation: {
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
