/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bangers: ['Bangers', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['Space Mono', 'monospace']
      },
      colors: {
        yellow: '#FFD23F',
        red: '#FF3B30',
        orange: '#FF6B35',
        cream: '#FFF8E7',
        ink: '#1A1A1A'
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'marquee-reverse': 'marquee 40s linear infinite reverse',
        float: 'float 3s ease-in-out infinite',
        stripe: 'stripeMove 4s linear infinite'
      }
    }
  },
  plugins: []
}