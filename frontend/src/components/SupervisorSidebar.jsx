import React from 'react';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  TableCellsIcon,
  BellAlertIcon,
  ChevronDoubleLeftIcon, 
  ChevronDoubleRightIcon,
  PlusIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom'; 

export default function SupervisorSidebar({ isSidebarOpen, toggleSidebar, isMobile = false, onClose = () => {} }) {

  const navigate = useNavigate(); 

  const navigation = [
    { name: 'Inicio', href: '/supervisor/dashboard', icon: HomeIcon },
    { name: 'Ver Registros', href: '/supervisor/registros', icon: TableCellsIcon },
    { name: 'Generar Reportes', href: '/supervisor/reportes', icon: DocumentDuplicateIcon },
    { name: 'Solicitudes', href: '/supervisor/notificaciones', icon: BellAlertIcon },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between">
        <img 
          src="/logo2.png" 
          alt="Logo Hospital" 
          className={classNames(
            "h-23 w-20 transition-all",
            !isSidebarOpen && !isMobile && "mx-auto" 
          )}
        />
        {isMobile && (
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <span className="sr-only">Cerrar menú</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={classNames(
          "mt-4",
          !isSidebarOpen && !isMobile && "hidden" 
        )}>
        <button
          onClick={() => {
            navigate('/supervisor/nuevo-registro');
            if (isMobile) onClose(); 
          }}
          className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-accent-mint px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-mint-hover"
        >
          <PlusIcon className="h-5 w-5" />
          Ingresar Nuevo Registro
        </button>
      </div>


      <nav className="flex flex-1 flex-col mt-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    title={!isSidebarOpen ? item.name : undefined}
                    onClick={isMobile ? onClose : undefined} 
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'text-accent-mint bg-accent-mint/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/10',
                        "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold",
                        !isSidebarOpen && !isMobile && "justify-center" 
                      )
                    }
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span className={classNames(!isSidebarOpen && !isMobile && "hidden")}>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          
          {!isMobile && (
            <li className="mt-auto -mx-2">
              <button
                  onClick={toggleSidebar}
                  className="group flex justify-center w-full rounded-md p-3 text-sm font-semibold leading-6 text-gray-400 hover:text-white hover:bg-white/10"
                  title={isSidebarOpen ? "Colapsar" : "Expandir"}
              >
                  {isSidebarOpen ? (
                    <ChevronDoubleLeftIcon className="h-6 w-6 shrink-0" />
                  ) : (
                    <ChevronDoubleRightIcon className="h-6 w-6 shrink-0" />
                  )}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-dark-surface p-6">
        {sidebarContent}
      </div>
    );
  }

  return (
    <div 
      className={classNames(
        "hidden lg:flex flex-col gap-y-5 overflow-y-auto bg-dark-surface text-white p-6 rounded-2xl shadow-lg transition-all duration-300 sticky top-6 h-[calc(100vh-3rem)]",
        isSidebarOpen ? "w-72" : "w-24"
      )}
    >
      {sidebarContent}
    </div>
  );
}