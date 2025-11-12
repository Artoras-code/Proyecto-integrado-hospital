import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export default function ActionLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/auditoria/api/acciones/');
        setLogs(response.data);
      } catch (err) {
        setError('No se pudo cargar el historial de acciones.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    // Ajustamos los colores para el nuevo fondo claro/oscuro
    switch (action) {
      case 'creacion': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200';
      case 'modificacion': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200';
      case 'eliminacion': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200';
    }
  };

  return (
    // 1. ¡ELIMINADOS! Quitamos los divs exteriores (flow-root, overflow-x, etc)
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="min-w-full divide-y divide-border">
        {/* 2. Cabecera (thead) con fondo gris claro */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">Usuario</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Acción</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Objeto Afectado</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Detalles</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha y Hora</th>
          </tr>
        </thead>
        {/* 3. Cuerpo (tbody) con fondo blanco (surface) */}
        <tbody className="divide-y divide-border bg-surface">
          {loading && (
            <tr>
              <td colSpan="5" className="py-4 text-center text-secondary">Cargando...</td>
            </tr>
          )}
          {error && (
            <tr><td colSpan="5" className="py-4 text-center text-red-400">{error}</td></tr>
          )}
          {!loading && logs.map((log) => (
            <tr key={log.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="font-medium text-primary">{log.usuario?.username || 'Sistema'}</div>
                <div className="text-secondary">{log.usuario?.rol || ''}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getActionColor(log.accion)}`}>
                  {log.accion}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                <div>{log.content_type_model} (ID: {log.object_id})</div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{log.detalles || 'N/A'}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}