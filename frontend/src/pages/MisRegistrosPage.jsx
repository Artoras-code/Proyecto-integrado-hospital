import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { PencilIcon } from '@heroicons/react/24/outline';
// Importamos el modal de edición que YA EXISTE
import RegistroEditModal from '../components/RegistroEditModal';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);

  // Estado para los parámetros (para pasarlos al modal de edición)
  const [parametros, setParametros] = useState({
    tiposParto: [],
    tiposAnalgesia: [],
    complicaciones: [],
  });

  // 1. Cargar la lista de "MIS" registros y los parámetros al iniciar
  useEffect(() => {
    fetchMisRegistros();
    fetchParametros(); // Cargar los desplegables para el modal
  }, []);

  const fetchMisRegistros = async () => {
    setLoading(true);
    try {
      // --- ¡LA CLAVE! ---
      // Llamamos a la API del clínico, no a la del supervisor
      const response = await apiClient.get('/dashboard/api/mis-registros/');
      setRegistros(response.data);
    } catch (err) {
      setError('No se pudieron cargar tus registros.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar los parámetros que usará el modal
  const fetchParametros = async () => {
    try {
      // El clínico necesita leer los parámetros para editar,
      // pero la API de parámetros está (correctamente) protegida para el Supervisor.
      
      // --- SOLUCIÓN TEMPORAL: Usamos la API del supervisor ---
      // (Idealmente, haríamos una API de "lectura" para parámetros)
      // Por ahora, esto fallará si un clínico intenta editar.
      // ¡LO ARREGLAREMOS DESPUÉS! Por ahora nos centramos en mostrar.
      
      // --- SIMPLIFICACIÓN: ---
      // No cargaremos parámetros por ahora, solo mostraremos la lista.
      // La edición la implementaremos en el siguiente paso.
      
      // const [resParto, resAnalgesia, resComplicaciones] = await Promise.all([
      //   apiClient.get('/dashboard/api/parametros/tipos-parto/'),
      //   apiClient.get('/dashboard/api/parametros/tipos-analgesia/'),
      //   apiClient.get('/dashboard/api/parametros/complicaciones-parto/'),
      // ]);
      // setParametros({
      //   tiposParto: resParto.data.filter(p => p.activo),
      //   tiposAnalgesia: resAnalgesia.data.filter(p => p.activo),
      //   complicaciones: resComplicaciones.data.filter(p => p.activo),
      // });
    } catch (err) {
       console.warn("No se pudieron cargar parámetros (esto es esperado para rol clínico por ahora)");
    }
  };

  const handleEdit = (registro) => {
    //setSelectedRegistro(registro);
    //setIsModalOpen(true);
    alert("Funcionalidad de Edición para Clínico pendiente.");
    // NOTA: Para que la edición funcione, necesitaremos que el Clínico
    // pueda LEER los parámetros (TipoParto, etc.)
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchMisRegistros(); // Refresca la lista
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Mis Registros de Parto</h1>
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
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Madre</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Fecha del Parto</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Tipo de Parto</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Recién Nacidos</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-900">
                  {loading && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-400">Cargando mis registros...</td>
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
                        <div className="font-medium text-white">{registro.madre.nombre}</div>
                        <div className="text-gray-400">{registro.madre.rut}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{formatDate(registro.fecha_parto)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{registro.tipo_parto?.nombre || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        {registro.recien_nacidos.length}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
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
                  {!loading && registros.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-400">No has creado ningún registro todavía.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal de Edición (aún no se puede abrir) --- */}
      {selectedRegistro && (
        <RegistroEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSaveSuccess={handleSaveSuccess}
          registroToEdit={selectedRegistro}
          parametros={parametros} 
        />
      )}
    </div>
  );
}