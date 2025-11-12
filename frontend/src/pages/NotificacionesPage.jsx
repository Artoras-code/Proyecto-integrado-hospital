import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Función para formatear la fecha
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

  // 1. Cargar las solicitudes pendientes al iniciar
  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      // Pedimos a la API solo las que están 'pendientes'
      const response = await apiClient.get('/dashboard/api/solicitudes-correccion/', {
        params: { estado: 'pendiente' }
      });
      setSolicitudes(response.data);
    } catch (err) {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Acción para marcar una solicitud como 'resuelta'
  const handleResolver = async (id) => {
    if (!window.confirm("¿Está seguro que ya corrigió el registro y desea marcar esta solicitud como 'resuelta'?")) {
      return;
    }
    try {
      await apiClient.post(`/dashboard/api/solicitudes-correccion/${id}/resolver/`);
      // Si tiene éxito, recargamos la lista para que desaparezca
      fetchSolicitudes();
    } catch (err) {
      alert("Error al marcar como resuelta.");
    }
  };

  // 3. Acción para navegar a la página de gestión
  const handleIrARegistro = () => {
    // Llevamos al supervisor a la página donde puede editar
    // (Abrir el modal directamente requeriría un state manager más complejo)
    alert("Será redirigido a la 'Gestión de Registros' para editar la ficha.\nPor favor, anote el ID del registro que necesita corregir.");
    navigate('/supervisor/registros');
  };

  return (
    <div>
      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-primary">Solicitudes de Corrección</h1>
      <p className="mt-2 text-secondary">
        Lista de registros que el personal clínico ha marcado para revisión.
      </p>

      {/* --- Tabla de Solicitudes --- */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-border sm:rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface">
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
                  {loading && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-secondary">Cargando solicitudes...</td>
                    </tr>
                  )}
                  {error && (
                     <tr>
                      <td colSpan="5" className="py-4 text-center text-red-400">{error}</td>
                    </tr>
                  )}
                  {!loading && solicitudes.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-primary">{solicitud.solicitado_por?.username || 'N/A'}</div>
                        <div className="text-secondary">{solicitud.solicitado_por?.rol || ''}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                        <span className="font-mono text-indigo-400">{solicitud.registro}</span>
                      </td>
                      <td className="whitespace-normal px-3 py-4 text-sm text-secondary max-w-xs truncate">
                        {solicitud.mensaje}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{formatDate(solicitud.timestamp_creacion)}</td>
                      
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        <button
                          onClick={handleIrARegistro}
                          className="text-indigo-400 hover:text-indigo-300"
                          title="Ir a gestionar registros"
                        >
                          <EyeIcon className="h-5 w-5" />
                          <span className="sr-only">Ir a Registro</span>
                        </button>
                        <button
                          onClick={() => handleResolver(solicitud.id)}
                          className="text-green-400 hover:text-green-300"
                          title="Marcar como Resuelta"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          <span className="sr-only">Marcar Resuelta</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && solicitudes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-secondary">No hay solicitudes pendientes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}