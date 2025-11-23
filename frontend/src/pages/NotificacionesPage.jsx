import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Pagination from '../components/Pagination'; // <-- Importar

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

export default function NotificacionesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  useEffect(() => {
    fetchSolicitudes(currentPage);
  }, [currentPage]);

  const fetchSolicitudes = async (page) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/dashboard/api/solicitudes-correccion/?estado=pendiente&page=${page}`);
      
      if (response.data.results) {
        setSolicitudes(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        setSolicitudes(response.data);
      }
    } catch (err) {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolver = async (id) => {
    if (!window.confirm("¿Está seguro que ya corrigió el registro y desea marcar esta solicitud como 'resuelta'?")) {
      return;
    }
    try {
      await apiClient.post(`/dashboard/api/solicitudes-correccion/${id}/resolver/`);
      fetchSolicitudes(currentPage);
    } catch (err) {
      alert("Error al marcar como resuelta.");
    }
  };

  const handleIrARegistro = () => {
    alert("Será redirigido a la 'Gestión de Registros' para editar la ficha.\nPor favor, anote el ID del registro que necesita corregir.");
    navigate('/supervisor/registros');
  };

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Solicitudes de Corrección</h1>
          <p className="mt-1 text-sm text-secondary">
            Lista de registros que el personal clínico ha marcado para revisión.
          </p>
        </div>
      </div>

      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">Solicitado por</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">ID Registro</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Mensaje del Clínico</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha Solicitud</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {loading && <tr><td colSpan="5" className="py-4 text-center text-secondary">Cargando...</td></tr>}
                  {error && <tr><td colSpan="5" className="py-4 text-center text-red-400">{error}</td></tr>}
                  
                  {!loading && solicitudes.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-primary">{solicitud.solicitado_por?.username || 'N/A'}</div>
                        <div className="text-secondary">{solicitud.solicitado_por?.rol || ''}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                        <span className="font-mono text-accent-mint">{solicitud.registro}</span>
                      </td>
                      <td className="whitespace-normal px-3 py-4 text-sm text-secondary max-w-xs truncate">
                        {solicitud.mensaje}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{formatDate(solicitud.timestamp_creacion)}</td>
                      
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        <button
                          onClick={handleIrARegistro}
                          className="text-accent-mint hover:text-accent-mint-hover"
                          title="Ir a gestionar registros"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleResolver(solicitud.id)}
                          className="text-green-500 hover:text-green-600"
                          title="Marcar como Resuelta"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && solicitudes.length === 0 && (
                    <tr><td colSpan="5" className="py-4 text-center text-secondary">No hay solicitudes pendientes.</td></tr>
                  )}
                </tbody>
              </table>
              
              <Pagination 
                currentPage={currentPage}
                hasNext={!!nextPage}
                hasPrevious={!!prevPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}