import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  
  let user = null;

  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error al leer datos de usuario:", e);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }


  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }


  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    console.warn(`Acceso denegado. Usuario: ${user.rol}, Requerido: ${allowedRoles}`);
    return <Navigate to="/" replace />;
  }


  return children ? children : <Outlet />;
};

export default ProtectedRoute;