/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        navy: {
          950: '#020617',
          900: '#0a0f1e',
          800: '#0d1b3e',
          700: '#1a2a5e',
        },
        teal: {
          DEFAULT: '#00d4aa',
          50:  '#e6fdf8',
          100: '#b3f7ec',
          200: '#80f0df',
          300: '#4de9d2',
          400: '#1ae1c5',
          500: '#00d4aa',
          600: '#00a886',
          700: '#007d63',
          800: '#005240',
          900: '#00271d',
        },
        amber: {
          DEFAULT: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,170,0.15), transparent)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'glow-teal': 'radial-gradient(circle, rgba(0,212,170,0.3) 0%, transparent 70%)',
        'glow-amber': 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'count-up': 'countUp 2s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0,212,170,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0,212,170,0.6)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
