/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#8b5cf6',
        'secondary': '#ec4899',
        'dark': '#0f172a',
        'light': '#f8fafc',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'tarot-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'tarot-light': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
