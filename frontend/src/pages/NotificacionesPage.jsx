import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// (Función formatDate sin cambios)
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

  // (Lógica de fetchSolicitudes, handleResolver, etc. se mantiene igual)
  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
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

  const handleResolver = async (id) => {
    if (!window.confirm("¿Está seguro que ya corrigió el registro y desea marcar esta solicitud como 'resuelta'?")) {
      return;
    }
    try {
      await apiClient.post(`/dashboard/api/solicitudes-correccion/${id}/resolver/`);
      fetchSolicitudes();
    } catch (err) {
      alert("Error al marcar como resuelta.");
    }
  };

  const handleIrARegistro = () => {
    alert("Será redirigido a la 'Gestión de Registros' para editar la ficha.\nPor favor, anote el ID del registro que necesita corregir.");
    navigate('/supervisor/registros');
  };

  return (
    // 1. Contenedor principal de la tarjeta flotante
    <div className="bg-surface rounded-lg shadow-md p-6">

      {/* 2. Header de la tarjeta */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Solicitudes de Corrección</h1>
          <p className="mt-1 text-sm text-secondary">
            Lista de registros que el personal clínico ha marcado para revisión.
          </p>
        </div>
      </div>

      {/* --- 3. Tabla de Solicitudes --- */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {/* 4. Nuevo contenedor de la tabla con borde */}
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border">
                {/* 5. Cabecera gris claro */}
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
                {/* 6. Cuerpo de tabla blanco (surface) */}
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
                        {/* ¡CAMBIO! Usamos color menta para el ID */}
                        <span className="font-mono text-accent-mint">{solicitud.registro}</span>
                      </td>
                      <td className="whitespace-normal px-3 py-4 text-sm text-secondary max-w-xs truncate">
                        {solicitud.mensaje}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{formatDate(solicitud.timestamp_creacion)}</td>
                      
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        <button
                          onClick={handleIrARegistro}
                          // ¡CAMBIO! Color menta para "Ver"
                          className="text-accent-mint hover:text-accent-mint-hover"
                          title="Ir a gestionar registros"
                        >
                          <EyeIcon className="h-5 w-5" />
                          <span className="sr-only">Ir a Registro</span>
                        </button>
                        <button
                          onClick={() => handleResolver(solicitud.id)}
                          // Mantenemos verde para "Resolver" (acción positiva)
                          className="text-green-500 hover:text-green-600"
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