/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#1e1f22',
        'secondary-bg': '#2b2d31',
        'tertiary-bg': '#313338',
        'accent': '#5865f2',
        'text-primary': '#f2f3f5',
        'text-secondary': '#b5bac1',
        'text-muted': '#949ba4',
        'success': '#3ba55c',
        'danger': '#ed4245',
        'warning': '#faa61a'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'ping-slow': {
          '0%, 100%': { transform: 'scale(0.95)', opacity: '0.2' },
          '50%': { transform: 'scale(1.1)', opacity: '0.1' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
