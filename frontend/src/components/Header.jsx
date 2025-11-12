import React, { useState, useEffect, Fragment } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react'; 
import { useTheme } from '../context/ThemeContext';
import apiClient from '../services/apiClient'; 

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header({ onMobileMenuClick }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationList, setNotificationList] = useState([]);



  useEffect(() => {
    if (user && user.rol === 'supervisor') {
      const fetchNotifications = async () => {
        try {

          const response = await apiClient.get('/dashboard/api/supervisor_dashboard_stats/');
          setNotificationCount(response.data.pending_corrections_count);
          setNotificationList(response.data.latest_pending_corrections);
        } catch (err) {
          console.error("Error cargando notificaciones:", err);
        }
      };
      fetchNotifications();
    }
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };


  const NotificationBell = () => (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              "p-1.5 text-secondary rounded-full transition-colors",
              "hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-accent-mint focus:ring-offset-2"
            )}
            title="Notificaciones"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notificationCount}
              </span>
            )}
          </Popover.Button>


          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 lg:w-96 transform">
              <div className="rounded-2xl shadow-lg border border-border bg-surface">
                <div className="p-4">
                  <h3 className="text-lg font-medium text-primary">Solicitudes Pendientes</h3>
                </div>
                <div className="flow-root max-h-96 overflow-y-auto">
                  <ul role="list" className="divide-y divide-border">
                    {notificationList.length > 0 ? (
                      notificationList.map((item) => (
                        <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <p className="text-sm font-medium text-primary">
                            Solicitud de <span className="font-bold">{item.solicitado_por}</span>
                          </p>
                          <p className="text-sm text-secondary truncate">
                            ID Registro: <span className="font-mono">{item.registro_id}</span>
                          </p>
                          <p className="text-sm text-secondary truncate">
                            "{item.mensaje}"
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{item.timestamp}</p>
                        </li>
                      ))
                    ) : (
                      <li className="p-4">
                        <p className="text-sm text-secondary text-center">No hay notificaciones nuevas.</p>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
                  <button
                    onClick={() => navigate('/supervisor/notificaciones')}
                    className="w-full text-center text-sm font-medium text-accent-mint hover:text-accent-mint-hover"
                  >
                    Ver todas las solicitudes
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-border bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none lg:bg-transparent lg:border-0 lg:justify-end">
      

      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-secondary lg:hidden" 
        onClick={onMobileMenuClick}
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      

      <div className="hidden lg:flex items-center gap-x-3 lg:gap-x-4 bg-surface p-3 rounded-2xl shadow-lg border border-border">
        

        {user && user.rol === 'supervisor' ? (
          <NotificationBell />
        ) : (
          <button
            type="button"
            className="p-1.5 text-secondary rounded-full"
            title="Notificaciones"
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}


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

        <div className="h-6 w-px bg-border" aria-hidden="true" />
        <div className="relative">
          <button className="flex items-center" title={user?.username || 'Usuario'}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-surface text-xs font-medium text-white">
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}