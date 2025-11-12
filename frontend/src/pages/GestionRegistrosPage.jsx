import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import RegistroEditModal from '../components/RegistroEditModal';

const PARAMETROS_FIJOS = {
  tiposParto: [
    { id: 1, nombre: "Parto Eutócico (Normal)" },
    { id: 2, nombre: "Cesárea" },
    { id: 3, nombre: "Fórceps" },
    { id: 4, nombre: "Vaccum" },
  ],
  tiposAnalgesia: [
    { id: 1, nombre: "Epidural" },
    { id: 2, nombre: "Raquídea" },
    { id: 3, nombre: "General" },
    { id: 4, nombre: "Local" },
    { id: 5, nombre: "Sin Analgesia" },
  ],
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-CL');
};

export default function GestionRegistrosPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);


  useEffect(() => {
    fetchRegistros();
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

  const handleEdit = (registro) => {
    setSelectedRegistro(registro);
    setIsModalOpen(true);        
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchRegistros();  
  };

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Gestión de Registros</h1>
          <p className="mt-1 text-sm text-secondary">Edita los registros existentes o ingresa uno nuevo.</p>
        </div>
        <button
          onClick={() => navigate('/supervisor/nuevo-registro')}
          className="flex items-center gap-x-2 rounded-lg bg-accent-mint px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-mint-hover"
        >
          <PlusIcon className="h-5 w-5" />
          Ingresar Nuevo Registro
        </button>
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
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="font-medium text-primary">{registro.madre.nombre}</div>
                        <div className="text-secondary">{registro.madre.rut}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{formatDate(registro.fecha_parto)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{registro.tipo_parto?.nombre || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                        {registro.recien_nacidos.length}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(registro)}
                          className="text-accent-mint hover:text-accent-mint-hover"
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
      {selectedRegistro && (
        <RegistroEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSaveSuccess={handleSaveSuccess}
          registroToEdit={selectedRegistro}
          parametros={PARAMETROS_FIJOS}
        />
      )}
    </div>
  );
}