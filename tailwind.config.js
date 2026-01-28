/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        diamond: '#B9F2FF',
        mythic: '#FF00FF',
        legend: '#FF6347',
        god: '#FFD700',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}


