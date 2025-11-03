// frontend/src/components/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // <--- Asegúrate de que esto esté importado
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* 1. La Sidebar fija */}
      <Sidebar />

      {/* 2. El contenido principal de la página */}
      <main className="flex-1 bg-gray-800 p-8">
        <Outlet /> {/* <--- ¡Este es el componente clave que faltaba! */}
      </main>
    </div>
  );
}