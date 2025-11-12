import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
// --- 1. CAMBIO DE ÍCONO ---
import { BellAlertIcon } from '@heroicons/react/24/outline';
// (Se quita PencilIcon y RegistroEditModal)

// Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-CL');
};

export default function MisRegistrosPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- 2. SE ELIMINA LA LÓGICA DEL MODAL ---
  // (Se quitan los estados isModalOpen, selectedRegistro y parametros)

  // 1. Cargar la lista de "MIS" registros
  useEffect(() => {
    fetchMisRegistros();
    // (Se quita la llamada a fetchParametros)
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

  // --- 3. SE REEMPLAZA handleEdit POR handleSolicitarCorreccion ---
  const handleSolicitarCorreccion = async (registroId) => {
    const mensaje = window.prompt(
      "Por favor, describe brevemente el error a corregir (este mensaje lo verá tu supervisor):"
    );

    // Si el usuario presiona "Cancelar"
    if (mensaje === null) {
      return;
    }
    
    // Evitar mensajes vacíos (opcional)
    if (mensaje.trim() === "") {
        alert("Debes ingresar un mensaje para el supervisor.");
        return;
    }

    try {
      // Usamos la nueva API 'action' que creamos en el backend
      await apiClient.post(
        `/dashboard/api/mis-registros/${registroId}/solicitar_correccion/`, 
        { mensaje: mensaje }
      );
      alert("Solicitud enviada correctamente. Un supervisor la revisará.");
      // Opcional: podríamos actualizar el estado de la UI para mostrar "Solicitud pendiente"
      
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "No se pudo enviar la solicitud."));
      console.error(err);
    }
  };



  return (
    <div>
      <div className="flex items-center justify-between">
        {/* 1. REFACTOR: text-white -> text-primary */}
        <h1 className="text-3xl font-bold text-primary">Mis Registros de Parto</h1>
        <button
          onClick={() => navigate('/clinico/nuevo-registro')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + Ingresar Nuevo Registro
        </button>
      </div>

      {/* --- Tabla de Registros --- */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {/* 2. REFACTOR: ring-black ring-opacity-5 -> ring-border */}
            <div className="overflow-hidden shadow ring-1 ring-border sm:rounded-lg">
              {/* 3. REFACTOR: divide-gray-700 -> divide-border */}
              <table className="min-w-full divide-y divide-border">
                {/* 4. REFACTOR: bg-gray-800 -> bg-surface */}
                <thead className="bg-surface">
                  <tr>
                    {/* 5. REFACTOR: text-white -> text-primary */}
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">Madre</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Fecha del Parto</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Tipo de Parto</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Recién Nacidos</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                {/* 6. REFACTOR: divide-gray-800 -> divide-border, bg-gray-900 -> bg-surface */}
                <tbody className="divide-y divide-border bg-surface">
                  {loading && (
                    <tr>
                      {/* 7. REFACTOR: text-gray-400 -> text-secondary */}
                      <td colSpan="5" className="py-4 text-center text-secondary">Cargando mis registros...</td>
                    </tr>
                  )}
                  {error && (
                     <tr>
                      <td colSpan="5" className="py-4 text-center text-red-400">{error}</td>
                    </tr>
                  )}
                  {!loading && registros.map((registro) => (
                    <tr key={registro.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        {/* 8. REFACTOR: text-white -> text-primary, text-gray-400 -> text-secondary */}
                        <div className="font-medium text-primary">{registro.madre.nombre}</div>
                        <div className="text-secondary">{registro.madre.rut}</div>
                      </td>
                      {/* 9. REFACTOR: text-gray-300 -> text-secondary */}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{formatDate(registro.fecha_parto)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{registro.tipo_parto?.nombre || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                        {registro.recien_nacidos.length}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        
                        {/* --- 4. CAMBIO DE BOTÓN --- */}
                        <button
                          onClick={() => handleSolicitarCorreccion(registro.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Solicitar Corrección"
                        >
                          <BellAlertIcon className="h-5 w-5" />
                          <span className="sr-only">Solicitar Corrección</span>
                        </button>
                      
                      </td>
                    </tr>
                  ))}
                  {!loading && registros.length === 0 && (
                    <tr>
                      {/* 10. REFACTOR: text-gray-400 -> text-secondary */}
                      <td colSpan="5" className="py-4 text-center text-secondary">No has creado ningún registro todavía.</td>
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