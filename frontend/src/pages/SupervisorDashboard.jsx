import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentPlusIcon, 
  TableCellsIcon, 
  DocumentDuplicateIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// 1. Definimos los accesos rápidos (sin cambios)
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
      {/* 2. REFACTOR: text-white -> text-primary */}
      <h1 className="text-3xl font-bold text-primary">
        Bienvenido, Supervisor {user?.username || ''}
      </h1>
      {/* 3. REFACTOR: text-gray-300 -> text-secondary */}
      <p className="mt-2 text-secondary">
        Accesos rápidos a las funciones de gestión clínica.
      </p>

      {/* 4. Contenedor de Atajos Rápidos */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {shortcuts.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            // 5. REFACTOR: bg-gray-900 -> bg-surface, text-white -> text-primary, hover:bg-gray-800 -> hover:bg-border
            className="flex flex-col items-center justify-center rounded-lg bg-surface p-8 text-primary shadow-lg transition-all hover:bg-border hover:scale-105"
          >
            <item.icon className="h-12 w-12 text-indigo-400" />
            <span className="mt-4 text-base font-medium text-center">{item.name}</span>
          </Link>
         ))}
      </div>
    </div>
  );
}