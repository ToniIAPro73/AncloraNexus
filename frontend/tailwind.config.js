// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006EE6',
          dark: '#0050A7',
        },
        secondary: {
          DEFAULT: '#00B8D9',
          dark: '#00829B',
        },
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
        gray: {
          100: '#F5F7FA',
          200: '#E4E7EB',
          400: '#8492A6',
          700: '#3E4C59',
          900: '#1F2933',
        },
      },
      fontFamily: {
        primary: ['var(--font-primary)', 'sans-serif'],
        secondary: ['var(--font-secondary)', 'serif'],
      },
      fontSize: {
        h1: ['clamp(2.5rem, 5vw + 1rem, 3.5rem)', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['clamp(2rem, 4vw + 1rem, 2.75rem)', { lineHeight: '1.25', fontWeight: '700' }],
        h3: ['clamp(1.75rem, 3vw + 1rem, 2rem)', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['clamp(1.5rem, 2vw + 1rem, 1.75rem)', { lineHeight: '1.35', fontWeight: '600' }],
        subtitle: ['clamp(1.25rem, 1vw + 1rem, 1.5rem)', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['clamp(1rem, 0.5vw + 0.875rem, 1.125rem)', { lineHeight: '1.5', fontWeight: '400' }],
        button: ['clamp(0.875rem, 0.5vw + 0.75rem, 1rem)', { lineHeight: '1.4', fontWeight: '500' }],
        small: ['clamp(0.75rem, 0.4vw + 0.6rem, 0.875rem)', { lineHeight: '1.5', fontWeight: '400' }],
        micro: ['clamp(0.625rem, 0.3vw + 0.5rem, 0.75rem)', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '48px',
        '8': '64px',
      },
      borderRadius: {
        DEFAULT: '6px',
        'lg': '8px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active'],
      transform: ['active'],
    },
  },
  plugins: [],
};
