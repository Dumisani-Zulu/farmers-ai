/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8dd28d',
          400: '#5cb85c',
          500: '#3a9b3a',
          600: '#2e7d2e',
          700: '#266226',
          800: '#1f4f1f',
          900: '#1a421a',
        },
        earth: {
          50: '#faf8f3',
          100: '#f3ede1',
          200: '#e6d7c1',
          300: '#d4bb95',
          400: '#c29967',
          500: '#b0804a',
          600: '#9d6c3e',
          700: '#825635',
          800: '#6b4530',
          900: '#57392b',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        'inter': ['Inter-Regular'],
        'inter-medium': ['Inter-Medium'],
        'inter-bold': ['Inter-Bold'],
      },
    },
  },
  plugins: [],
};