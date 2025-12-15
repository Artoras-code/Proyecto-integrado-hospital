import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Pagination from '../components/Pagination';
import { 
  UserIcon, 
  FaceSmileIcon, 
  ClipboardDocumentCheckIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

export default function GestionPacientesPage() {
  const [activeTab, setActiveTab] = useState('madres');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fechaAccion, setFechaAccion] = useState(new Date().toISOString().slice(0, 16));
  const [alimentacion, setAlimentacion] = useState('LME');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDoctor = user.rol === 'doctor';

  useEffect(() => {
    fetchData(currentPage);
  }, [activeTab, currentPage]);

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'madres' 
        ? `/dashboard/api/madres/?page=${page}` 
        : `/dashboard/api/recien-nacidos/?page=${page}`;
      
      const response = await apiClient.get(endpoint);
      
      let dataResults = response.data.results || response.data;
      let next = response.data.next;
      let prev = response.data.previous;

      const filtered = dataResults.filter(item => !item.fecha_alta && !item.fallecida && !item.fallecido);
      
      setItems(filtered);
      setNextPage(next);
      setPrevPage(prev);
    } catch (err) {
      console.error("Error cargando pacientes", err);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenModal = (type, item) => { setModalType(type); setSelectedItem(item); setFechaAccion(new Date().toISOString().slice(0, 16)); };
  const handleCloseModal = () => { setModalType(null); setSelectedItem(null); };
  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const endpointBase = activeTab === 'madres' ? '/dashboard/api/madres' : '/dashboard/api/recien-nacidos';
    const action = modalType === 'alta' ? 'dar_alta' : 'registrar_defuncion';
    const payload = modalType === 'alta' ? { fecha_alta: fechaAccion, alimentacion_alta: alimentacion } : { fecha_fallecimiento: fechaAccion };
    try {
      await apiClient.post(`${endpointBase}/${selectedItem.id}/${action}/`, payload);
      alert("Acción registrada exitosamente.");
      handleCloseModal();
      fetchData(currentPage);
    } catch (err) {
      alert("Error al registrar acción: " + (err.response?.data?.error || "Error desconocido"));
    }
  };

  const displayItems = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (activeTab === 'madres') {
      return item.nombre.toLowerCase().includes(term) || item.rut.includes(term);
    } else {
        return item.id.toString().includes(term);
    }
  });

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Gestión de Pacientes</h1>
          <p className="mt-2 text-secondary">
            {isDoctor 
              ? "Administrar altas médicas y defunciones de pacientes activos." 
              : "Visualización de pacientes actualmente hospitalizados."}
          </p>
        </div>
        
        <div className="flex space-x-4 mt-4 md:mt-0 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button onClick={() => { setActiveTab('madres'); setCurrentPage(1); }} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'madres' ? 'bg-white dark:bg-gray-700 text-accent-mint shadow-sm' : 'text-secondary hover:text-primary'}`}>
            <UserIcon className="h-5 w-5 mr-2" /> Madres
          </button>
          <button onClick={() => { setActiveTab('rn'); setCurrentPage(1); }} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'rn' ? 'bg-white dark:bg-gray-700 text-accent-mint shadow-sm' : 'text-secondary hover:text-primary'}`}>
            <FaceSmileIcon className="h-5 w-5 mr-2" /> Recién Nacidos
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative mb-6 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input type="text" className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-surface text-primary placeholder-gray-500 focus:outline-none focus:ring-accent-mint focus:border-accent-mint sm:text-sm" placeholder={activeTab === 'madres' ? "Buscar por nombre o RUT..." : "Buscar por ID de RN..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">ID / RUT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Nombre / Detalle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Estado</th>
              {isDoctor && <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Acciones</th>}
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {loading && <tr><td colSpan={isDoctor ? 4 : 3} className="px-6 py-4 text-center text-secondary">Cargando...</td></tr>}
            {!loading && displayItems.length === 0 && <tr><td colSpan={isDoctor ? 4 : 3} className="px-6 py-4 text-center text-secondary">No se encontraron pacientes activos.</td></tr>}

            {!loading && displayItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                  {activeTab === 'madres' ? item.rut : `#${item.id}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {activeTab === 'madres' ? item.nombre : `Peso: ${item.peso_grs}g - Talla: ${item.talla_cm}cm`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Hospitalizado
                  </span>
                </td>
                

                {isDoctor && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleOpenModal('alta', item)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center">
                      <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" /> Dar Alta
                    </button>
                    <button onClick={() => handleOpenModal('defuncion', item)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" /> Defunción
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} hasNext={!!nextPage} hasPrevious={!!prevPage} onPageChange={setCurrentPage} />
      </div>


      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className={`text-lg font-bold mb-4 ${modalType === 'alta' ? 'text-green-600' : 'text-red-600'}`}>
              {modalType === 'alta' ? 'Registrar Alta Médica' : 'Registrar Defunción'}
            </h3>
            <p className="text-sm text-secondary mb-4">
              Paciente: <strong>{activeTab === 'madres' ? selectedItem.nombre : `Recién Nacido #${selectedItem.id}`}</strong>
            </p>
            <form onSubmit={handleSubmitAction}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1">Fecha y Hora</label>
                <input type="datetime-local" required className="w-full rounded-md border-border bg-background text-primary p-2" value={fechaAccion} onChange={(e) => setFechaAccion(e.target.value)} />
              </div>
              {modalType === 'alta' && activeTab === 'rn' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-secondary mb-1">Alimentación al Alta</label>
                  <select className="w-full rounded-md border-border bg-background text-primary p-2" value={alimentacion} onChange={(e) => setAlimentacion(e.target.value)}>
                    <option value="LME">Lactancia Materna Exclusiva</option>
                    <option value="LMixta">Lactancia Mixta</option>
                    <option value="Formula">Fórmula Artificial</option>
                  </select>
                </div>
              )}
              {modalType === 'defuncion' && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded text-red-700 text-xs">
                  Advertencia: Esta acción marcará al paciente como fallecido y cerrará su episodio clínico.
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancelar</button>
                <button type="submit" className={`px-4 py-2 text-sm font-bold text-white rounded shadow-sm ${modalType === 'alta' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}