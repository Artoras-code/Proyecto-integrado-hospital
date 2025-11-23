import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import {
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    latestSessions: [],
    latestActions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        const statsResponse = await apiClient.get('/cuentas/api/dashboard/stats/');
        
        if (statsResponse.data) {
          setStats(prevStats => ({
            ...prevStats,
            totalUsers: statsResponse.data.total_users,
            activeUsers: statsResponse.data.active_users,
            inactiveUsers: statsResponse.data.inactive_users,
            latestSessions: statsResponse.data.latest_sessions || [],
            latestActions: statsResponse.data.latest_actions || [],
          }));
        }

      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-md p-6 flex items-center justify-center h-48">
        <p className="text-primary">Cargando datos del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-4">
        <div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-accent-mint uppercase leading-tight tracking-tighter">
            HOLA, {user?.username ? user.username.toUpperCase() : 'ADMIN'}
          </h1>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary">Historial de Sesiones Recientes</h2>
              <button
                onClick={() => navigate('/admin/audit')}
                className="text-sm font-medium text-accent-mint hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-0">Usuario</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Tipo de Evento</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha y Hora</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.latestSessions.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="whitespace-nowrap py-4 text-sm text-secondary text-center">No hay sesiones recientes.</td>
                        </tr>
                      ) : (
                        stats.latestSessions.map((session, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-0">
                              {session.username}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                              <span className={classNames(
                                session.event_type.includes('Inicio') ? 'bg-green-100 text-green-700' :
                                session.event_type.includes('Cierre') ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700',
                                'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium dark:bg-gray-700 dark:text-gray-200'
                              )}>
                                {session.event_type}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{session.timestamp}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{session.ip_address}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta: Actividad Reciente */}
          <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary">Actividad Reciente</h2>
              <button
                onClick={() => navigate('/admin/audit')}
                className="text-sm font-medium text-accent-mint hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-0">Usuario</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Acción</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Objeto Afectado</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha y Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.latestActions.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="whitespace-nowrap py-4 text-sm text-secondary text-center">No hay acciones recientes.</td>
                        </tr>
                      ) : (
                        stats.latestActions.map((action, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-0">
                              {action.username}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                              <span className={classNames(
                                action.action_type === 'Creación' ? 'bg-blue-100 text-blue-700' :
                                action.action_type === 'Modificación' ? 'bg-yellow-100 text-yellow-700' :
                                action.action_type === 'Eliminación' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700',
                                'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium dark:bg-gray-700 dark:text-gray-200'
                              )}>
                                {action.action_type}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{action.target_object_id || 'N/A'}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{action.timestamp}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Columna Derecha (Paneles de Estado) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Tarjeta: Estado de Usuarios (ÚNICA TARJETA RESTANTE EN ESTA COLUMNA) */}
          <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border">
            <h2 className="text-xl font-semibold text-primary mb-4">Estado de Usuarios</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg text-secondary">Total Usuarios</p>
                <p className="text-5xl font-bold text-accent-mint mt-1">{stats.totalUsers}</p>
              </div>
              <div>
                <p className="text-lg text-secondary">Activos</p>
                <p className="text-5xl font-bold text-green-500 mt-1">{stats.activeUsers}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
                <p className="text-lg text-secondary">Inactivos</p>
                <p className="text-5xl font-bold text-red-500 mt-1">{stats.inactiveUsers}</p>
            </div>
            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-x-2 rounded-lg bg-accent-mint px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-mint-hover"
                >
                    <UserGroupIcon className="h-5 w-5" />
                    Gestionar Usuarios
                </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}