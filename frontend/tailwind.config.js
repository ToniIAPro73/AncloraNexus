// archivo: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './auth/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'anclora-blue': {
          light: '#dbeafe',
          primary: '#3b82f6',
          secondary: '#2563eb',
          dark: '#1e40af',
        },
        'anclora-slate': {
          light: '#f1f5f9',
          DEFAULT: '#64748b',
          dark: '#1e293b',
          darker: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}

