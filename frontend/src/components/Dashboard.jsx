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
    <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">¡Bienvenido al Dashboard!</h1>
        <p className="mt-2 text-gray-600">Usuario: <strong>{user?.username}</strong></p>
        <p className="text-gray-600">Rol: <strong>{user?.rol}</strong></p>
        <p className="text-gray-600">RUT: <strong>{user?.rut}</strong></p>
        
        <button 
          onClick={handleLogout}
          className="w-full px-4 py-2 mt-6 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}