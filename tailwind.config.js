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
          navy: '#1F497D',
          teal: '#0B5563',
          red: '#C0392B',
          orange: '#E8743B',
          green: '#3A7D5C',
          light: '#F4F7F8',
          dark: '#111827',
          surface: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}
