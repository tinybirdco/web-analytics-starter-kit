const { fontFamily } = require('tailwindcss/defaultTheme')
const { colors, typography } = require('./styles/theme')

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: [typography.fontFamily, ...fontFamily.sans],
    },
    extend: {
      colors,
      textColor: {
        base: '#25283D',
      },
      fontSize: {
        md: '1rem',
      },
      gridTemplateRows: {
        '2-auto': 'repeat(2, auto)',
        '3-auto': 'repeat(3, auto)',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('state-active', '&[data-state="active"]')
    },
  ],
}
