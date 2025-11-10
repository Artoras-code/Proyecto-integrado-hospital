import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon, // <-- 1. Importar Sol
  MoonIcon // <-- 2. Importar Luna
} from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // <-- 3. Importar nuestro hook

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme(); // <-- 4. Usar el hook del tema

  // Lista de navegación del Administrador
  const navigation = [
    { name: 'Inicio', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Gestión de Usuarios', href: '/admin/users', icon: UsersIcon },
    { name: 'Auditoría', href: '/admin/audit', icon: ShieldCheckIcon },
  ];

  // Función para manejar el Logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    // 5. REFACTORIZAR COLORES:
    // 'bg-gray-900' -> 'bg-surface'
    <div className="flex flex-col shrink-0 gap-y-5 overflow-y-auto bg-surface px-6 pb-4 min-h-screen w-64">
      {/* 1. Logo (sin cambios) */}
      <div className="flex h-16 shrink-0 items-center">
        <svg className="h-8 w-auto text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75" />
        </svg>
      </div>

      {/* 2. Navegación */}
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
                          ? 'bg-gray-800 text-white' 
                          // 6. REFACTORIZAR COLORES:
                          // 'text-gray-400' -> 'text-secondary'
                          // 'hover:text-white' -> 'hover:text-primary'
                          // 'hover:bg-gray-800' -> 'hover:bg-border'
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

          {/* 3. Perfil de Usuario y Logout */}
          <li className="mt-auto">
            {/* Perfil del Usuario (Refactor: 'text-gray-400' -> 'text-secondary') */}
            <div
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-secondary"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white">
                {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
              </span>
              <span className="truncate">{user?.username || 'Usuario'} (Admin)</span>
            </div>

            {/* 7. AÑADIR EL BOTÓN DE TEMA */}
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

            {/* Botón de Cerrar Sesión (Refactor: 'text-gray-400' -> 'text-secondary', etc.) */}
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