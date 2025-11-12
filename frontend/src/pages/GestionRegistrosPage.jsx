import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { PencilIcon } from '@heroicons/react/24/outline';
// --- 1. Importar el nuevo modal ---
import RegistroEditModal from '../components/RegistroEditModal';

// Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-CL');
};

export default function GestionRegistrosPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- 2. Estados para manejar el modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);

  // --- 3. Estado para los parámetros (para pasarlos al modal) ---
  const [parametros, setParametros] = useState({
    tiposParto: [],
    tiposAnalgesia: [],
    complicaciones: [],
  });

  // 1. Cargar la lista de registros y parámetros al iniciar
  useEffect(() => {
    fetchRegistros();
    fetchParametros(); // Cargar los desplegables para el modal
  }, []);

  const fetchRegistros = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/dashboard/api/registros-parto/');
      setRegistros(response.data);
    } catch (err) {
      setError('No se pudieron cargar los registros.');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Cargar los parámetros que usará el modal ---
  const fetchParametros = async () => {
    try {
      const [resParto, resAnalgesia, resComplicaciones] = await Promise.all([
        apiClient.get('/dashboard/api/parametros/tipos-parto/'),
        apiClient.get('/dashboard/api/parametros/tipos-analgesia/'),
        apiClient.get('/dashboard/api/parametros/complicaciones-parto/'),
      ]);
      setParametros({
        tiposParto: resParto.data.filter(p => p.activo),
        tiposAnalgesia: resAnalgesia.data.filter(p => p.activo),
        complicaciones: resComplicaciones.data.filter(p => p.activo),
      });
    } catch (err) {
      setError('Error al cargar los parámetros para la edición.');
    }
  };

  // --- 5. Handlers para abrir/cerrar el modal ---
  
  const handleEdit = (registro) => {
    setSelectedRegistro(registro); // Guardar el registro seleccionado
    setIsModalOpen(true);         // Abrir el modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal(); // Cierra el modal
    fetchRegistros();   // Refresca la lista
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        {/* 1. REFACTOR: text-white -> text-primary */}
        <h1 className="text-3xl font-bold text-primary">Gestión de Registros de Parto</h1>
        <button
          onClick={() => navigate('/supervisor/nuevo-registro')}
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
                      <td colSpan="5" className="py-4 text-center text-secondary">Cargando registros...</td>
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
                        {/* (Botón sin cambios) */}
                        <button
                          onClick={() => handleEdit(registro)}
                          className="text-indigo-400 hover:text-indigo-300"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span className="sr-only">Editar</span>
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

      {/* --- 7. Renderizar el modal (sin cambios) --- */}
      {selectedRegistro && (
        <RegistroEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSaveSuccess={handleSaveSuccess}
          registroToEdit={selectedRegistro}
          parametros={parametros} // Le pasamos los parámetros que ya cargamos
        />
      )}
    </div>
  );
}