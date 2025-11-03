import React from 'react';
import { Outlet } from 'react-router-dom';
import ClinicoSidebar from './ClinicoSidebar'; // Importamos el nuevo sidebar

export default function ClinicoLayout() {
  return (
    <div className="flex min-h-screen">
      {/* 1. El Sidebar del Clínico (fijo) */}
      <ClinicoSidebar />

      {/* 2. El contenido principal (Mis Registros, Nuevo Registro) */}
      <main className="flex-1 bg-gray-800 p-8">
        <Outlet /> {/* Las rutas anidadas se renderizarán aquí */}
      </main>
    </div>
  );
}