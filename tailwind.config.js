/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: { DEFAULT: '#0A7B79', soft: '#7CA8A1' },
        surface: { DEFAULT: '#D3F2E9', 2: '#EAF8F4' },
        brand: {
          blue: '#0A7B79',
          'blue-soft': '#D3F2E9',
          violet: '#7CA8A1',
          teal: '#7CA8A1',
          rose: '#DB767D',
          amber: '#F4A363',
          green: '#0A7B79',
          yellow: '#F4A363',
        },
      },
      boxShadow: {
        card: '0 10px 25px -5px rgba(10,123,121,.08)',
        'card-hover': '0 15px 30px -5px rgba(244,163,99,.25)',
      },
      borderRadius: { xl: '14px' },
    },
  },
  plugins: [],
}
