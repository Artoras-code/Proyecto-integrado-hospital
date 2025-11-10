import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { 
  UsersIcon, 
  ArrowRightOnRectangleIcon, 
  PencilSquareIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Función para formatear la fecha (sin cambios)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    loginsToday: 0,
    actionsToday: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Usamos Promise.all para cargar todo en paralelo
        const [usersRes, sessionsRes, actionsRes] = await Promise.all([
          apiClient.get('/cuentas/api/users/'),
          apiClient.get('/auditoria/api/sesiones/'), // Tu API ya ordena por más reciente
          apiClient.get('/auditoria/api/acciones/')  // Tu API ya ordena por más reciente
        ]);

        // Procesar estadísticas
        const loginsToday = sessionsRes.data.filter(
          s => s.accion === 'login' && s.timestamp.startsWith(today)
        ).length;
        
        const actionsToday = actionsRes.data.filter(
          a => a.timestamp.startsWith(today)
        ).length;

        setStats({
          userCount: usersRes.data.length,
          loginsToday: loginsToday,
          actionsToday: actionsToday,
        });

        // Tomar solo los 5 más recientes para los feeds
        setRecentSessions(sessionsRes.data.slice(0, 5));
        setRecentActions(actionsRes.data.slice(0, 5));

      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    // 1. REFACTOR: text-white -> text-primary
    return <h1 className="text-3xl font-bold text-primary">Cargando...</h1>;
  }

  // Datos para las tarjetas de estadísticas
  const kpiCards = [
    { name: 'Usuarios Totales', value: stats.userCount, icon: UsersIcon },
    { name: 'Inicios de Sesión (Hoy)', value: stats.loginsToday, icon: ArrowRightOnRectangleIcon },
    { name: 'Acciones (Hoy)', value: stats.actionsToday, icon: PencilSquareIcon },
  ];
  
  // Datos para los atajos rápidos
  const shortcuts = [
    { name: 'Crear Usuario', href: '/admin/users', icon: UserPlusIcon },
    { name: 'Ver Auditoría', href: '/admin/audit', icon: ShieldCheckIcon },
  ];

  return (
    <div>
      {/* 2. REFACTOR: text-white -> text-primary */}
      <h1 className="text-3xl font-bold text-primary">Panel del Administrador</h1>

      {/* --- 1. Tarjetas de Estadísticas --- */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((item) => (
          // 3. REFACTOR: bg-gray-900 -> bg-surface
          <div key={item.name} className="overflow-hidden rounded-lg bg-surface shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {/* 4. REFACTOR: text-gray-400 -> text-secondary */}
                  <item.icon className="h-6 w-6 text-secondary" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    {/* 5. REFACTOR: text-gray-400 -> text-secondary */}
                    <dt className="truncate text-sm font-medium text-secondary">{item.name}</dt>
                    {/* 6. REFACTOR: text-white -> text-primary */}
                    <dd className="text-3xl font-semibold tracking-tight text-primary">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* --- 2. Atajos Rápidos --- */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
         {shortcuts.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            // 7. REFACTOR: bg-gray-900 -> bg-surface, text-white -> text-primary, hover:bg-gray-800 -> hover:bg-border
            className="flex flex-col items-center justify-center rounded-lg bg-surface p-6 text-primary shadow transition-all hover:bg-border hover:shadow-lg"
          >
            <item.icon className="h-10 w-10 text-indigo-400" />
            <span className="mt-3 text-sm font-medium">{item.name}</span>
          </Link>
         ))}
      </div>

      {/* --- 3. Feeds de Actividad Reciente --- */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        
        {/* Columna de Sesiones */}
        <div>
          {/* 8. REFACTOR: text-white -> text-primary */}
          <h2 className="text-xl font-semibold text-primary">Últimos Inicios de Sesión</h2>
          {/* 9. REFACTOR: divide-gray-700 -> divide-border */}
          <ul role="list" className="mt-4 divide-y divide-border">
            {recentSessions.map((session) => (
              <li key={session.id} className="flex gap-x-4 py-3">
                <span className={`flex-none rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  session.accion === 'login' 
                    ? 'text-green-200 bg-green-900 ring-green-700' 
                    : 'text-red-200 bg-red-900 ring-red-700'
                }`}>
                  {session.accion === 'login' ? 'Login' : 'Logout'}
                </span>
                <div className="text-sm">
                  {/* 10. REFACTOR: text-white -> text-primary, text-gray-400 -> text-secondary */}
                  <div className="font-medium text-primary">{session.usuario?.username || 'N/A'}</div>
                  <div className="text-secondary">{session.ip_address}</div>
                </div>
                <div className="ml-auto text-right text-xs text-secondary">
                  {formatDate(session.timestamp)}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Columna de Acciones */}
        <div>
          <h2 className="text-xl font-semibold text-primary">Últimas Acciones</h2>
           <ul role="list" className="mt-4 divide-y divide-border">
            {recentActions.map((action) => (
              <li key={action.id} className="flex gap-x-4 py-3">
                <span className="flex-none rounded-md px-2 py-1 text-xs font-medium text-yellow-200 bg-yellow-900 ring-1 ring-inset ring-yellow-700">
                  {action.accion}
                </span>
                <div className="text-sm">
                  <div className="font-medium text-primary">{action.usuario?.username || 'N/A'}</div>
                  <div className="text-secondary">
                    {action.content_type_model} (ID: {action.object_id})
                  </div>
                </div>
                <div className="ml-auto text-right text-xs text-secondary">
                  {formatDate(action.timestamp)}
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}