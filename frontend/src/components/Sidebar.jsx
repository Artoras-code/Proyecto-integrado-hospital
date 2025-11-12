import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) { 
  
  const navigation = [
    { name: 'Inicio', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Gestión de Usuarios', href: '/admin/users', icon: UsersIcon },
    { name: 'Auditoría', href: '/admin/audit', icon: ShieldCheckIcon },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div 
      className={classNames(
        "hidden lg:flex flex-col gap-y-5 overflow-y-auto bg-dark-surface text-white p-6 rounded-2xl shadow-lg transition-all duration-300 sticky top-6 h-[calc(100vh-3rem)]",
        isSidebarOpen ? "w-64" : "w-24"
      )}
    >
      <div className="flex h-16 shrink-0 items-center">
        <img 
          src="/logo2.png" 
          alt="Logo Hospital" 
          className={classNames(
            "h-23 w-20 transition-all",
            !isSidebarOpen && "mx-auto" 
          )}
        />
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
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'text-accent-mint bg-accent-mint/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/10',
                        "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold",
                        !isSidebarOpen && "justify-center"
                      )
                    }
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span className={classNames(!isSidebarOpen && "hidden")}>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          
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
        </ul>
      </nav>
    </div>
  );
}