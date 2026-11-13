/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F8F7F4',
        ink: { DEFAULT: '#142348', soft: '#2A3A63' },
        brand: { DEFAULT: '#1937B9', dark: '#132C95', light: '#E8ECFA', 50: '#F2F4FC' },
        magenta: { DEFAULT: '#E60088', dark: '#C20073', light: '#FDE6F3' },
        meta: '#65738C',
        line: '#E4E8EE',
        sand: '#F1EEE7',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Sans Variable"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '20px' },
      boxShadow: {
        card: '0 1px 2px rgba(20,35,72,.04), 0 2px 8px rgba(20,35,72,.04)',
        lift: '0 4px 12px rgba(20,35,72,.08), 0 16px 40px rgba(20,35,72,.10)',
        modal: '0 24px 80px rgba(20,35,72,.28)',
      },
      maxWidth: { content: '1500px' },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        rise: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { from: { opacity: 0, transform: 'scale(.97)' }, to: { opacity: 1, transform: 'none' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        kenburns: { from: { transform: 'scale(1.0)' }, to: { transform: 'scale(1.08) translate(-1%, -1%)' } },
        pulseRing: { '0%': { transform: 'scale(.9)', opacity: .7 }, '100%': { transform: 'scale(1.6)', opacity: 0 } },
      },
      animation: {
        fadeIn: 'fadeIn .2s ease-out',
        rise: 'rise .25s ease-out',
        pop: 'pop .2s ease-out',
        slideIn: 'slideIn .25s ease-out',
        kenburns: 'kenburns 12s ease-out forwards',
        pulseRing: 'pulseRing 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}
