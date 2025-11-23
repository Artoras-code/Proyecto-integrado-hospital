import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  
  let user = null;

  try {
    // Intentamos parsear el usuario. Si falla, se captura el error abajo.
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error al leer datos de usuario:", e);
    // Si el JSON está mal, borramos todo para limpiar el estado
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // 1. Validación básica: Si no hay token o usuario válido -> Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Validación de Rol: Si se requieren roles y el usuario no tiene uno válido -> Home (o Login)
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    console.warn(`Acceso denegado. Usuario: ${user.rol}, Requerido: ${allowedRoles}`);
    return <Navigate to="/" replace />;
  }

  // 3. Renderizado: Muestra el contenido hijo o el Outlet (para rutas anidadas)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;