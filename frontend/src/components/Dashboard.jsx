import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    // 1. REFACTOR: bg-gray-100 -> bg-background
    <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-background">
      
      {/* 2. REFACTOR: bg-white -> bg-surface */}
      <div className="p-8 bg-surface rounded-lg shadow-md">
        
        {/* 3. REFACTOR: text-gray-800 -> text-primary */}
        <h1 className="text-3xl font-bold text-primary">¡Bienvenido al Dashboard!</h1>
        
        {/* 4. REFACTOR: text-gray-600 -> text-secondary */}
        <p className="mt-2 text-secondary">Usuario: <strong>{user?.username}</strong></p>
        <p className="text-secondary">Rol: <strong>{user?.rol}</strong></p>
        <p className="text-secondary">RUT: <strong>{user?.rut}</strong></p>
        
        <button 
          onClick={handleLogout}
          // 5. REFACTOR: ring-offset-2 -> ring-offset-background
          className="w-full px-4 py-2 mt-6 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-background focus:ring-red-500"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}