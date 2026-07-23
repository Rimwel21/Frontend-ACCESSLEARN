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
        ink: { DEFAULT: '#2d6e61', soft: '#5a8d82' },
        surface: { DEFAULT: '#e8f5f0', 2: '#f3faf7' },
        brand: {
          blue: '#2d6e61',
          'blue-soft': '#c4e4da',
          violet: '#5a8d82',
          teal: '#a5d8cc',
          rose: '#DB767D',
          amber: '#f59e5b',
          green: '#2d6e61',
          yellow: '#f59e5b',
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
