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
        primary: {
          DEFAULT: '#2A6B35',
          dark: '#1A4A22',
          light: '#4C9E5A',
          pale: '#E8F5EB',
        },
        gold: {
          DEFAULT: '#D4A017',
          light: '#F5D97A',
          pale: '#FEF9E8',
        },
        amber: {
          DEFAULT: '#E67E22',
        },
        earth: {
          brown: '#6B4A2A',
          soil: '#8B6040',
          wheat: '#F5DEB3',
        },
        surface: {
          DEFAULT: '#FAFAF7',
          2: '#F0EDE5',
          dark: '#1C2B1C',
        },
        dark: '#1A1A1A',
        text: {
          primary: '#1F2B1F',
          muted: '#6B7560',
        },
        farmborder: '#D5D0C4',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '32px',
        pill: '999px',
      },
      boxShadow: {
        'farm': '0 2px 16px rgba(42, 107, 53, 0.06)',
        'farm-hover': '0 12px 40px rgba(42, 107, 53, 0.12)',
        'gold-glow': '0 0 24px rgba(212, 160, 23, 0.3)',
      },
      animation: {
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
        'float-delayed': 'float-gentle 6s ease-in-out 2s infinite',
        'token-pulse': 'token-pulse 2s ease-out infinite',
      },
      keyframes: {
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1.5deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        'token-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(42, 107, 53, 0.5)' },
          '50%': { boxShadow: '0 0 0 16px rgba(42, 107, 53, 0)' },
        },
      },
    },
  },
  plugins: [],
}
