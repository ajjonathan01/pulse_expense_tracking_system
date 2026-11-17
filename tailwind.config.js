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
        pulse: {
          bg: '#111411',
          sidebar: '#171B17',
          card: '#1B211B',
          'card-hover': '#222922',
          accent: '#B7E477',
          'accent-hover': '#c7f08c',
          'accent-dark': '#8fc247',
          'text-primary': '#F1F3ED',
          'text-secondary': '#929A90',
          border: '#303830',
          'border-light': '#3c473c',
          positive: '#50C995',
          negative: '#EF7777',
          warning: '#F59E0B',
          info: '#3B82F6',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '14px',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'accent-glow': '0 0 15px rgba(183, 228, 119, 0.25)',
      },
    },
  },
  plugins: [],
}
