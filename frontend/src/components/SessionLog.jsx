import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export default function SessionLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/auditoria/api/sesiones/');
        setLogs(response.data);
      } catch (err) {
        setError('No se pudo cargar el historial de sesiones.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="mt-4 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          {/* 1. REFACTOR: ring-black ring-opacity-5 -> ring-border */}
          <div className="overflow-hidden shadow ring-1 ring-border sm:rounded-lg">
            {/* 2. REFACTOR: divide-gray-700 -> divide-border */}
            <table className="min-w-full divide-y divide-border">
              {/* 3. REFACTOR: bg-gray-800 -> bg-surface */}
              <thead className="bg-surface">
                <tr>
                  {/* 4. REFACTOR: text-white -> text-primary */}
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">Usuario</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Acción</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Dirección IP</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha y Hora</th>
                </tr>
              </thead>
              {/* 5. REFACTOR: divide-gray-800 -> divide-border, bg-gray-900 -> bg-surface */}
              <tbody className="divide-y divide-border bg-surface">
                {loading && (
                  <tr>
                    {/* 6. REFACTOR: text-gray-400 -> text-secondary */}
                    <td colSpan="4" className="py-4 text-center text-secondary">Cargando...</td>
                  </tr>
                )}
                {error && (
                  <tr><td colSpan="4" className="py-4 text-center text-red-400">{error}</td></tr>
                )}
                {!loading && logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      {/* 7. REFACTOR: text-white -> text-primary, text-gray-400 -> text-secondary */}
                      <div className="font-medium text-primary">{log.usuario?.username || 'Sistema'}</div>
                      <div className="text-secondary">{log.usuario?.rol || ''}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                      {log.accion === 'login' ? (
                        <span className="inline-flex items-center rounded-md bg-green-900 px-2 py-1 text-xs font-medium text-green-200">
                          Inicio de Sesión
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-red-900 px-2 py-1 text-xs font-medium text-red-200">
                          Cierre de Sesión
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{log.ip_address}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}