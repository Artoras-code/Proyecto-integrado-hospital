import React from 'react';
import {
  TableCellsIcon,
  DocumentPlusIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon, // <-- 1. Añadido
  MoonIcon, // <-- 2. Añadido
} from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // <-- 3. Añadido

// 1. Definimos la navegación para el Clínico (sin cambios)
const navigation = [
  { name: 'Mis Registros', href: '/clinico/mis-registros', icon: TableCellsIcon },
  { name: 'Ingresar Nuevo Registro', href: '/clinico/nuevo-registro', icon: DocumentPlusIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ClinicoSidebar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme(); // <-- 4. Añadido

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    // 5. Refactor: bg-gray-900 -> bg-surface
    <div className="flex flex-col shrink-0 gap-y-5 overflow-y-auto bg-surface px-6 pb-4 min-h-screen w-72">
      {/* 6. Refactor: text-white -> text-primary */}
      <div className="flex h-16 shrink-0 items-center text-primary gap-x-3">
        {/* Puedes poner un logo diferente si quieres */}
        <DocumentPlusIcon className="h-8 w-auto text-indigo-400" />
        <span className='text-lg font-bold'>Registro Clínico</span>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'bg-gray-800 text-white' // (Acento se mantiene)
                          // 7. Refactor: text-gray-400 -> text-secondary, hover:text-white -> hover:text-primary, hover:bg-gray-800 -> hover:bg-border
                          : 'text-secondary hover:text-primary hover:bg-border',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )
                    }
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>

          {/* Perfil de Usuario y Logout */}
          <li className="mt-auto">
            {/* 8. Refactor: text-gray-400 -> text-secondary */}
            <div className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-secondary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white">
                {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
              </span>
              <span className="truncate">{user?.username || 'Usuario'} ({user?.rol || 'Clínico'})</span>
            </div>

            {/* 9. AÑADIR BOTÓN DE TEMA */}
            <button
              onClick={toggleTheme}
              className="group -mx-2 mt-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-secondary hover:bg-border hover:text-primary"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-6 w-6 shrink-0" />
              ) : (
                <SunIcon className="h-6 w-6 shrink-0" />
              )}
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </button>
            
            {/* 10. Refactor: text-gray-400 -> text-secondary, etc. */}
            <button
              onClick={handleLogout}
              className="group -mx-2 mt-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-secondary hover:bg-border hover:text-primary"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" />
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}