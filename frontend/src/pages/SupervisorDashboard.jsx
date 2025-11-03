import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentPlusIcon, 
  TableCellsIcon, 
  DocumentDuplicateIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// 1. Definimos los accesos rápidos
const shortcuts = [
  { name: 'Ingresar Nuevo Registro', href: '/supervisor/nuevo-registro', icon: DocumentPlusIcon },
  { name: 'Ver/Editar Registros', href: '/supervisor/registros', icon: TableCellsIcon },
  { name: 'Generar Reporte REM', href: '/supervisor/reportes', icon: DocumentDuplicateIcon },
  { name: 'Gestionar Parámetros', href: '/supervisor/parameters', icon: CogIcon },
];

export default function SupervisorDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        Bienvenido, Supervisor {user?.username || ''}
      </h1>
      <p className="mt-2 text-gray-300">
        Accesos rápidos a las funciones de gestión clínica.
      </p>

      {/* 2. Contenedor de Atajos Rápidos */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {shortcuts.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex flex-col items-center justify-center rounded-lg bg-gray-900 p-8 text-white shadow-lg transition-all hover:bg-gray-800 hover:scale-105"
          >
            <item.icon className="h-12 w-12 text-indigo-400" />
            <span className="mt-4 text-base font-medium text-center">{item.name}</span>
          </Link>
         ))}
      </div>
    </div>
  );
}