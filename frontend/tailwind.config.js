/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-indigo': '#292663',
        'sky-blue': '#00AEEF',
        'light-bg': '#f8f9fc',
        'card-bg': '#ffffff',
        'text-dark': '#1a1a2e',
        'text-muted': '#6b7280',
      }
    },
  },
  plugins: [],
}