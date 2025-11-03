import React from 'react';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from './SupervisorSidebar'; // Importamos el nuevo sidebar

export default function SupervisorLayout() {
  return (
    <div className="flex min-h-screen">
      {/* 1. El Sidebar del Supervisor (fijo) */}
      <SupervisorSidebar />

      {/* 2. El contenido principal (Dashboard, Registros, Reportes, etc.) */}
      <main className="flex-1 bg-gray-800 p-8">
        <Outlet /> {/* Las rutas anidadas se renderizarán aquí */}
      </main>
    </div>
  );
}