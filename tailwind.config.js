/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',   // primary actions, links, active nav state
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#1E3A8A',   // sidebar background
        },
        ai: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
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
          subtle: '#F8FAFC',   // page background
          border: '#E2E8F0',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 23, 42, 0.06)',
        'soft-md': '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
