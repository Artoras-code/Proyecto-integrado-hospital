import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { BellAlertIcon, InboxIcon } from '@heroicons/react/24/outline'; 

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-CL');
};

export default function MisRegistrosPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMisRegistros();
  }, []);

  const fetchMisRegistros = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/dashboard/api/mis-registros/');
      setRegistros(response.data);
    } catch (err) {
      setError('No se pudieron cargar tus registros.');
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarCorreccion = async (registroId) => {
    const mensaje = window.prompt(
      "Por favor, describe brevemente el error a corregir (este mensaje lo verá tu supervisor):"
    );
    if (mensaje === null) {
      return;
    }
    if (mensaje.trim() === "") {
        alert("Debes ingresar un mensaje para el supervisor.");
        return;
    }
    try {
      await apiClient.post(
        `/dashboard/api/mis-registros/${registroId}/solicitar_correccion/`, 
        { mensaje: mensaje }
      );
      alert("Solicitud enviada correctamente. Un supervisor la revisará.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "No se pudo enviar la solicitud."));
      console.error(err);
    }
  };


  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mis Registros de Parto</h1>
          <p className="mt-1 text-sm text-secondary">Registros que has ingresado personalmente.</p>
        </div>
      </div>



      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Madre</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha del Parto</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Tipo de Parto</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Recién Nacidos</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {loading && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-secondary">Cargando mis registros...</td>
                    </tr>
                  )}
                  {error && (
                     <tr>
                      <td colSpan="5" className="py-16 text-center text-red-400">{error}</td>
                    </tr>
                  )}

                  {!loading && !error && registros.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-semibold text-primary">No hay registros</h3>
                        <p className="mt-1 text-sm text-secondary">Aún no has ingresado ningún registro de parto.</p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => navigate('/clinico/nuevo-registro')}
                            className="flex items-center gap-x-2 rounded-lg bg-accent-mint px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-mint-hover mx-auto"
                          >
                            Ingresar tu primer registro
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!loading && !error && registros.map((registro) => (
                    <tr key={registro.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-primary">{registro.madre.nombre}</div>
                        <div className="text-secondary">{registro.madre.rut}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{formatDate(registro.fecha_parto)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{registro.tipo_parto?.nombre || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                        {registro.recien_nacidos.length}
                      </td>
                      <td className="relative whitespace-nowrap px-3 py-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleSolicitarCorreccion(registro.id)}
                          className="text-yellow-500 hover:text-yellow-400"
                          title="Solicitar Corrección"
                        >
                          <BellAlertIcon className="h-5 w-5" />
                          <span className="sr-only">Solicitar Corrección</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}