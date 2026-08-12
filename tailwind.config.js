/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#060814',
          900: '#0a0e27',
          800: '#11173d',
          700: '#1b2358',
          600: '#2c3784',
          500: '#4353b3',
          400: '#6374db',
          300: '#929fe8',
          200: '#c5ccf5',
          100: '#eef0fd',
        },
        veil: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#7f00ff',
          pink: '#e100ff',
          emerald: '#00f5a0',
          dark: '#030712'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        shine: 'shine 2s infinite'
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 242, 254, 0.35)',
        'glow-purple': '0 0 25px rgba(127, 0, 255, 0.35)',
        'glow-emerald': '0 0 25px rgba(0, 245, 160, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
