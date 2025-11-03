import React from 'react';
import {
  TableCellsIcon,
  DocumentPlusIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom';

// 1. Definimos la navegación para el Clínico (limitada)
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col shrink-0 gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 min-h-screen w-72">
      <div className="flex h-16 shrink-0 items-center text-white gap-x-3">
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
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800',
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
            <div className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white">
                {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
              </span>
              <span className="truncate">{user?.username || 'Usuario'} ({user?.rol || 'Clínico'})</span>
            </div>
            <button
              onClick={handleLogout}
              className="group -mx-2 mt-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
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