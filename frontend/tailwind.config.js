/** @type {import('tailwindcss').Config} */
export default {
  // 1. Habilitamos el modo oscuro basado en 'class'
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)', // Fondo principal
        surface: 'var(--color-surface)',     // Fondo de "tarjetas", "sidebars"
        
        primary: 'var(--color-text-primary)',     // Texto principal
        secondary: 'var(--color-text-secondary)', // Texto secundario, gris
        
        border: 'var(--color-border)', // Bordes
        
        // Colores de acento 
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        green: {
          200: '#bbf7d0',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        red: {
          200: '#fecaca',
          500: '#ef4444',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        yellow: {
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          900: '#713f12',
        },
        blue: {
          200: '#bfdbfe',
          900: '#1e3a8a',
        },
      }
    },
  },
  plugins: [],
}