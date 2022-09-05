const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Inter var', ...fontFamily.sans],
    },
    extend: {
      colors: {
        current: 'currentColor',
        primary: '#0066FF',
        primaryDark: '#0146AE',
        primaryLight: '#e5f0ff',
        secondary: '#25283D',
        secondaryLight: '#A5A7B4',
        success: '#1FCC83',
        warning: '#FFFDE9',
        error: '#F76363',
        body: '#f6f7f9',
        'neutral-01': '#fff',
        'neutral-04': '#fdfdfe',
        'neutral-08': '#f4f4f7',
        'neutral-12': '#e8e9ed',
        'neutral-24': '#CBCCD1',
        'neutral-64': '#636679',
      },
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
