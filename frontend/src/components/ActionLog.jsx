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
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Usuario</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Acción</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Objeto Afectado</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Detalles</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900">
                {loading && (
                  <tr><td colSpan="5" className="py-4 text-center text-gray-400">Cargando...</td></tr>
                )}
                {error && (
                  <tr><td colSpan="5" className="py-4 text-center text-red-400">{error}</td></tr>
                )}
                {!loading && logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-white">{log.usuario?.username || 'Sistema'}</div>
                      <div className="text-gray-400">{log.usuario?.rol || ''}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getActionColor(log.accion)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      <div>{log.content_type_model} (ID: {log.object_id})</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{log.detalles || 'N/A'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
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