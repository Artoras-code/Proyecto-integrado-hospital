const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      fontFamily: {
        sans: ['Satoshi', ...defaultTheme.fontFamily.sans],
      },
      

      colors: {

        background: 'var(--color-background)', 
        surface: 'var(--color-surface)',     
        primary: 'var(--color-text-primary)',     
        secondary: 'var(--color-text-secondary)', 
        border: 'var(--color-border)', 
        

        'accent-mint': '#20C997', 
        'accent-mint-hover': '#1AAE8A', 
        'accent-mint-light': '#99E6C9', 


        'dark-surface': '#2D3436', 
        'light-gray': '#DFE6E9',   
        'dark-gray': '#636E72',    
        'mid-gray': '#B2BEC3',     
      }
    },
  },
  plugins: [],
}