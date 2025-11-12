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
    switch (action) {
      case 'creacion': return 'bg-blue-900 text-blue-200';
      case 'modificacion': return 'bg-yellow-900 text-yellow-200';
      case 'eliminacion': return 'bg-red-900 text-red-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

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
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Objeto Afectado</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Detalles</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha y Hora</th>
                </tr>
              </thead>
              {/* 5. REFACTOR: divide-gray-800 -> divide-border, bg-gray-900 -> bg-surface */}
              <tbody className="divide-y divide-border bg-surface">
                {loading && (
                  <tr>
                    {/* 6. REFACTOR: text-gray-400 -> text-secondary */}
                    <td colSpan="5" className="py-4 text-center text-secondary">Cargando...</td>
                  </tr>
                )}
                {error && (
                  <tr><td colSpan="5" className="py-4 text-center text-red-400">{error}</td></tr>
                )}
                {!loading && logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      {/* 7. REFACTOR: text-white -> text-primary, text-gray-400 -> text-secondary */}
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
        </div>
      </div>
    </div>
  );
}