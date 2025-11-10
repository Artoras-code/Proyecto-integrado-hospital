import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Crear el Contexto
const ThemeContext = createContext();

// 2. Crear el Proveedor (Provider)
export const ThemeProvider = ({ children }) => {
  // 'light' o 'dark'
  const [theme, setTheme] = useState(() => {
    // 3. Revisar localStorage o la preferencia del sistema al cargar
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Si no hay nada guardado, usa la preferencia del S.O.
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return userPrefersDark ? 'dark' : 'light';
  });

  // 4. Efecto para aplicar la clase al <html>
  useEffect(() => {
    const root = window.document.documentElement; 
    
    // 5. Agregar o quitar la clase '.dark'
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // 6. Guardar la preferencia en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // Se ejecuta cada vez que 'theme' cambia

  // 7. Función para cambiar el tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 8. Pasar el estado y la función al resto de la app
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => {
  return useContext(ThemeContext);
};