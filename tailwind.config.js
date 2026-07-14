/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          bg: '#FAF9F6',       // Clean stone background
          charcoal: '#1C1917', // Stone-900 charcoal
          wood: '#8C1D1D',     // Pentecostal rich crimson red
          gold: '#F59E0B',     // Pentecostal flame/amber gold
          goldLight: '#FEF3C7',// Light flame/amber
          goldDark: '#D97706', // Dark flame/amber
          creamDark: '#E7E5E4',// Stone-200 cream
        }
      },
      fontFamily: {
        serif: ['Outfit', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
