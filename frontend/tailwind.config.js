/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1C3334',
        surface: 'rgba(28, 51, 52, 0.65)',
        'surface-border': 'rgba(55, 110, 111, 0.35)',
        'text-main': '#F8FAFC',
        'text-muted': '#B8C5D6',
        haus: {
          slate: '#2F4454',
          plum: '#2E151B',
          rose: '#DA7B93',
          teal: '#376E6F',
          spruce: '#1C3334',
          dark: '#0E1C1D',
        },
        cyan: {
          DEFAULT: '#DA7B93',
          400: '#DA7B93',
          500: '#376E6F',
        },
        input: {
          bg: '#0F1D1E',
          border: '#376E6F',
        },
        list: {
          bg: '#1C3334',
          border: '#2F4454',
        },
        active: {
          bg: '#2E151B',
          border: '#DA7B93',
        },
        risk: {
          red: {
            text: '#DA7B93',
            bg: '#2E151B',
            border: '#DA7B93',
          },
          amber: {
            text: '#E0A96D',
            bg: '#2E151B',
            border: '#E0A96D',
          },
          green: {
            text: '#376E6F',
            bg: '#1C3334',
            border: '#376E6F',
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
