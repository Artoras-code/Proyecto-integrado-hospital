import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { 
  DocumentDuplicateIcon,
  TableCellsIcon, 
  BellAlertIcon
} from '@heroicons/react/24/outline';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    pending_corrections_count: 0,
    registros_this_month: 0,
    latest_pending_corrections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const shortcuts = [
    { name: 'Generar Reportes (REM)', href: '/supervisor/reportes', icon: DocumentDuplicateIcon, color: 'text-accent-mint' },
    { name: 'Ver Todos los Registros', href: '/supervisor/registros', icon: TableCellsIcon, color: 'text-yellow-500' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        const statsResponse = await apiClient.get('/dashboard/api/supervisor_dashboard_stats/');
        
        if (statsResponse.data) {
          setStats({
            pending_corrections_count: statsResponse.data.pending_corrections_count,
            registros_this_month: statsResponse.data.registros_this_month,
            latest_pending_corrections: statsResponse.data.latest_pending_corrections || [],
          });
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
      <div>
        <h1 className="text-5xl lg:text-6xl font-extrabold text-accent-mint uppercase leading-tight tracking-tighter">
          HOLA, {user?.username ? user.username.toUpperCase() : 'SUPERVISOR'}
        </h1>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary">Solicitudes Pendientes</h2>
              <button
                onClick={() => navigate('/supervisor/notificaciones')}
                className="text-sm font-medium text-accent-mint hover:underline"
              >
                Ver todas ({stats.pending_corrections_count})
              </button>
            </div>
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-0">Solicitado Por</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">ID Registro</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Mensaje</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.latest_pending_corrections.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="whitespace-nowrap py-4 text-sm text-secondary text-center">No hay solicitudes pendientes.</td>
                        </tr>
                      ) : (
                        stats.latest_pending_corrections.map((solicitud) => (
                          <tr key={solicitud.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-0">
                              {solicitud.solicitado_por}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                              <span className="font-mono">{solicitud.registro_id}</span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary truncate max-w-xs">
                              {solicitud.mensaje}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{solicitud.timestamp}</td>
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


        <div className="lg:col-span-1 space-y-6">

          <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border">
            <h2 className="text-xl font-semibold text-primary mb-4">Resumen del Mes</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg text-secondary">Solicitudes Pendientes</p>
                <p className="text-5xl font-bold text-red-500 mt-1">{stats.pending_corrections_count}</p>
              </div>
              <div>
                <p className="text-lg text-secondary">Registros (Mes)</p>
                <p className="text-5xl font-bold text-accent-mint mt-1">{stats.registros_this_month}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => navigate('/supervisor/notificaciones')}
                    className="flex items-center gap-x-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
                >
                    <BellAlertIcon className="h-5 w-5" />
                    Revisar Solicitudes
                </button>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border">
            <h2 className="text-xl font-semibold text-primary mb-4">Shortcuts</h2>
            <div className="space-y-4">
              {shortcuts.map((shortcut) => (
                <button
                  key={shortcut.name}
                  onClick={() => navigate(shortcut.href)}
                  className={`group flex w-full items-center gap-x-4 rounded-lg p-4 transition-colors bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <shortcut.icon className={`h-6 w-6 shrink-0 ${shortcut.color}`} aria-hidden="true" />
                  <span className="text-sm font-medium text-primary">{shortcut.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}