import React, { useState, useEffect, Fragment } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  CheckCircleIcon // <-- Nuevo icono para resolver
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
    // Lógica para SUPERVISOR (Correcciones)
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
    
    // Lógica para ADMIN (Solicitudes de Clave)
    if (user && user.rol === 'admin') {
       const fetchAdminNotifs = async () => {
         try {
            // Obtenemos las solicitudes de clave pendientes
            const response = await apiClient.get('/cuentas/api/solicitudes-clave/');
            // La API es paginada, usamos 'results'
            const results = response.data.results || []; 
            setNotificationCount(results.length);
            setNotificationList(results);
         } catch (err) {
            console.error("Error cargando notificaciones admin:", err);
         }
       };
       fetchAdminNotifs();
    }
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Función para que el admin resuelva la solicitud de clave
  const handleResolvePasswordRequest = async (id) => {
      if(!window.confirm("¿Marcar como resuelta? (Asegúrate de haber cambiado la clave del usuario primero)")) return;
      try {
          await apiClient.post(`/cuentas/api/solicitudes-clave/${id}/marcar_resuelta/`);
          // Actualizar lista local visualmente
          setNotificationList(prev => prev.filter(n => n.id !== id));
          setNotificationCount(prev => Math.max(0, prev - 1));
      } catch(err) {
          alert("Error al resolver solicitud.");
      }
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
              <div className="rounded-2xl shadow-lg border border-border bg-surface overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-lg font-medium text-primary">
                    {user.rol === 'admin' ? 'Solicitudes de Clave' : 'Solicitudes Pendientes'}
                  </h3>
                </div>
                
                <div className="flow-root max-h-96 overflow-y-auto">
                  <ul role="list" className="divide-y divide-border">
                    {notificationList.length > 0 ? (
                      notificationList.map((item) => (
                        <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-2">
                             {/* Renderizado condicional según el tipo de usuario */}
                             {user.rol === 'admin' ? (
                                 <>
                                    <p className="text-sm font-bold text-primary">Usuario: {item.usuario_nombre}</p>
                                    <p className="text-xs text-secondary mt-1">Solicitó cambio de contraseña</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(item.fecha_solicitud).toLocaleDateString()}</p>
                                 </>
                             ) : (
                                 <>
                                    <p className="text-sm font-medium text-primary">De: <b>{item.solicitado_por}</b></p>
                                    <p className="text-xs text-secondary truncate mt-1">ID Registro: <span className="font-mono">{item.registro_id}</span></p>
                                    <p className="text-xs text-secondary truncate mt-1 italic">"{item.mensaje}"</p>
                                    <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                                 </>
                             )}
                          </div>
                          
                          {/* Botón de acción rápida solo para Admin */}
                          {user.rol === 'admin' && (
                              <button 
                                onClick={() => handleResolvePasswordRequest(item.id)} 
                                className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" 
                                title="Marcar como resuelta"
                              >
                                  <CheckCircleIcon className="h-6 w-6" />
                              </button>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="p-4">
                        <p className="text-sm text-secondary text-center">No hay notificaciones nuevas.</p>
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Footer del popover solo para supervisor (Admin resuelve aquí mismo) */}
                {user.rol === 'supervisor' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-border">
                      <button 
                        onClick={() => navigate('/supervisor/notificaciones')} 
                        className="w-full text-center text-sm font-medium text-accent-mint hover:text-accent-mint-hover"
                      >
                        Ver todas las solicitudes
                      </button>
                    </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );

  return (
    <header className={classNames(
      "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-x-4 px-4 transition-all",
      "bg-surface border-b border-border shadow-sm",
      "lg:shadow-none lg:bg-transparent lg:border-0 lg:px-0 lg:justify-end"
    )}>
      
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-secondary hover:text-primary lg:hidden" 
        onClick={onMobileMenuClick}
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className={classNames(
        "flex items-center gap-x-3",
        "lg:gap-x-4 lg:bg-surface lg:p-3 lg:rounded-2xl lg:shadow-lg lg:border lg:border-border"
      )}>
        
        {/* Mostramos notificación para Supervisor Y Admin */}
        {(user && (user.rol === 'supervisor' || user.rol === 'admin')) ? (
          <NotificationBell />
        ) : (
          <button type="button" className="p-1.5 text-secondary rounded-full hover:text-primary" title="Sin notificaciones">
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

        <div className="h-6 w-px bg-border mx-1" aria-hidden="true" />

        <div className="relative">
          <button className="flex items-center gap-2" title={user?.username || 'Usuario'}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-surface text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-border">
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
            </span>
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-semibold text-primary" aria-hidden="true">
                {user?.username}
              </span>
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}