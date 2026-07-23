/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./design.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF5FF',
          100: '#DBE8FE',
          200: '#BFD6FE',
          300: '#93B4FD',
          400: '#5E8BF9',
          500: '#2563EB',   // primary actions, links, active nav accent
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#1E3A8A',
        },
        // Deep, desaturated navy for the sidebar / dark chrome. Reads more
        // premium than a flat royal blue and gives the app a distinct spine.
        ink: {
          950: '#080D18',
          900: '#0B1120',
          850: '#0F1728',
          800: '#141E33',
          700: '#1C2942',
          600: '#2A3A5C',
        },
        ai: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          500: '#8B5CF6',   // AI-attributed elements
          600: '#7C3AED',
        },
        status: {
          success: '#16A34A',  // completed, confirmed, resolved
          successBg: '#F0FDF4',
          warning: '#D97706',  // waiting, needs review
          warningBg: '#FFFBEB',
          danger: '#DC2626',   // escalation, urgent, no-show
          dangerBg: '#FEF2F2',
        },
        surface: {
          base: '#FFFFFF',
          subtle: '#F6F8FB',   // page background — slightly cooler/cleaner
          muted: '#EEF2F7',    // secondary fills, hover rows
          border: '#E4E9F0',
        },
        text: {
          primary: '#0B1424',
          secondary: '#5B6879',
          muted: '#93A0B4',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      letterSpacing: {
        tightish: '-0.01em',
        tighter2: '-0.02em',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 23, 42, 0.06)',
        'soft-md': '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        elevated: '0 8px 24px -6px rgba(16, 24, 40, 0.12), 0 2px 6px -2px rgba(16, 24, 40, 0.06)',
        'brand-glow': '0 6px 18px -4px rgba(37, 99, 235, 0.35)',
        'inset-hair': 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
