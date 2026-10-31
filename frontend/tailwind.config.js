/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070B12',
        surface: 'rgba(255, 255, 255, 0.04)',
        'surface-border': 'rgba(255, 255, 255, 0.1)',
        'text-main': '#E6EDF5',
        'text-muted': '#93A1B5',
        cyan: {
          DEFAULT: '#22D3EE',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        input: {
          bg: '#0A111C',
          border: '#243247',
        },
        list: {
          bg: '#0A111C',
          border: '#1B2433',
        },
        active: {
          bg: '#0F1A2A',
          border: '#1E3A4C',
        },
        risk: {
          red: {
            text: '#FB7185',
            bg: '#2A0F1B',
            border: '#7F1D3A',
          },
          amber: {
            text: '#FBBF24',
            bg: '#2A1B07',
            border: '#78350F',
          },
          green: {
            text: '#34D399',
            bg: '#0B2018',
            border: '#14532D',
          },
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        input: '10px',
        row: '10px',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #0E1622 1px, transparent 1px), linear-gradient(to bottom, #0E1622 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-48': '48px 48px',
      },
    },
  },
  plugins: [],
}
