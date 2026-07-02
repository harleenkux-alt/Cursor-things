/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/ui/ui.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#005FCC',
          50: '#EAF2FF',
          100: '#D5E5FF',
          200: '#ADCBFF',
          300: '#7FAEFF',
          400: '#5B8DEF',
          500: '#2F74E6',
          600: '#005FCC',
          700: '#004BA3',
          800: '#003A7D',
          900: '#002B5C',
        },
        accent: '#5B8DEF',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#005FCC',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        xl2: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        'soft-lg': '0 8px 40px rgba(15, 23, 42, 0.10)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
