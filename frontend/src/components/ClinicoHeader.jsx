import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  TableCellsIcon, 
  PlusIcon, 
  SunIcon, 
  MoonIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ClinicoHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="sticky top-4 lg:top-6 z-10 mx-auto max-w-7xl rounded-2xl bg-surface shadow-lg border border-border px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img 
              src="/logo2.png" 
              alt="Logo Hospital" 
              className="h-10 w-auto"
            />
          </div>
        </div>

        <nav className="hidden lg:flex lg:gap-x-6">
          <NavLink
            to="/clinico/mis-registros"
            className={({ isActive }) =>
              classNames(
                isActive ? 'text-accent-mint font-semibold' : 'text-secondary hover:text-primary',
                "text-sm font-medium leading-6 transition-colors"
              )
            }
          >
            Mis Registros
          </NavLink>
          <button
            onClick={() => navigate('/clinico/nuevo-registro')}
            className="flex items-center gap-x-1 rounded-md bg-accent-mint px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-mint-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Ingresar Registro
          </button>
        </nav>

        <div className="flex items-center gap-x-3 lg:gap-x-4">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-1.5 text-secondary hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
          >
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>

          <button
            onClick={handleLogout}
            type="button"
            className="p-1.5 text-secondary hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            title="Cerrar Sesión"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="hidden lg:flex items-center gap-x-4">
            <div className="h-6 w-px bg-border" aria-hidden="true" />
            <div className="relative">
              <button className="flex items-center" title={user?.username || 'Usuario'}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-surface text-xs font-medium text-white">
                  {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                </span>
              </button>
            </div>
          </div>
          <div className="flex lg:hidden gap-x-2">
            <button
              onClick={() => navigate('/clinico/nuevo-registro')}
              className="p-1.5 text-accent-mint"
              title="Ingresar Nuevo Registro"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => navigate('/clinico/mis-registros')}
              className="p-1.5 text-secondary hover:text-primary"
              title="Mis Registros"
            >
              <TableCellsIcon className="h-6 w-6" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}