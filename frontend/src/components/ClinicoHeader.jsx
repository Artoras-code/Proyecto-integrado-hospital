import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon, 
  PlusCircleIcon, 
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UsersIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

export default function ClinicoHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDoctor = user.rol === 'doctor';
  const isEnfermero = user.rol === 'enfermero';


  const navigation = [
    { name: 'Mis Registros', href: '/clinico/mis-registros', icon: ClipboardDocumentListIcon },
    { name: 'Nuevo Registro', href: '/clinico/nuevo-registro', icon: PlusCircleIcon },
    { name: 'Pacientes Activos', href: '/clinico/pacientes', icon: UsersIcon }, 
  ];


  if (isDoctor) {
    navigation.push({
      name: 'Defunciones',
      href: '/clinico/defunciones',
      icon: DocumentTextIcon
    });
  }


  if (isDoctor || isEnfermero) {
    navigation.push({ 
      name: isDoctor ? 'Mis Equipos' : 'Mi Equipo', 
      href: '/clinico/equipos', 
      icon: UserGroupIcon 
    });
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-surface border border-border sticky top-0 z-40 rounded-2xl shadow-md transition-all">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        

        <div className="flex lg:flex-1">
          <Link to="/clinico/mis-registros" className="-m-1.5 p-1.5 flex items-center gap-2">
            <img className="h-8 w-auto" src="/logo_hospital.jpg" alt="Hospital" />
            <span className="font-bold text-xl text-primary hidden sm:block">Obstetricia</span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-secondary hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Abrir menú</span>
            {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-accent-mint text-white shadow-sm' 
                    : 'text-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </div>


        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
            
            {/* Botón Tema */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-1.5 text-secondary hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
            >
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>


            <div className="text-sm text-right hidden xl:block">
                <div className="font-medium text-primary">{user.nombre || user.username}</div>
                <div className="text-xs text-secondary capitalize">{user.rol}</div>
            </div>
            
            <div className="h-6 w-px bg-border" aria-hidden="true" />
            

            <button
                onClick={handleLogout}
                className="text-sm font-semibold leading-6 text-secondary hover:text-red-500 flex items-center gap-1 transition-colors"
            >
                Salir <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
        </div>
      </nav>


      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-border rounded-b-2xl" role="dialog" aria-modal="true">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => {
               const isActive = location.pathname === item.href;
               return (
                <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-md px-3 py-2 text-base font-medium flex items-center gap-3 ${
                        isActive ? 'bg-accent-mint text-white' : 'text-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <item.icon className="h-6 w-6 shrink-0" />
                    {item.name}
                </Link>
               )
            })}
            
            <button
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
            >
                {theme === 'light' ? <MoonIcon className="h-6 w-6 shrink-0" /> : <SunIcon className="h-6 w-6 shrink-0" />}
                {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </button>

            <button
                onClick={handleLogout}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
            >
                <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" />
                Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}