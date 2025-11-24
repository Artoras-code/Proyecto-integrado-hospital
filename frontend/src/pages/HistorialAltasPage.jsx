import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Pagination from '../components/Pagination';

export default function HistorialAltasPage() {
  const [activeTab, setActiveTab] = useState('rn');
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  useEffect(() => {
    fetchData(currentPage, activeTab);
  }, [currentPage, activeTab]);

  const fetchData = async (page, tab) => {
    setLoading(true);
    try {
      const endpoint = tab === 'rn' 
        ? `/dashboard/api/historial-altas/?page=${page}`
        : `/dashboard/api/historial-altas-madres/?page=${page}`;

      const response = await apiClient.get(endpoint);
      
      if (response.data.results) {
        setData(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        setData(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setData([]);
  };

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Historial de Altas</h1>

        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('rn')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rn' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Recién Nacidos
          </button>
          <button
            onClick={() => handleTabChange('madres')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'madres' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Madres
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {activeTab === 'rn' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">ID RN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Fecha Alta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Médico Resp.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Alimentación</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Nombre Madre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">RUT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Fecha Alta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Médico Resp.</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
             {loading && <tr><td colSpan="4" className="px-6 py-4 text-center text-secondary">Cargando...</td></tr>}
             
             {!loading && data.map(item => (
               <tr key={item.id}>
                 {activeTab === 'rn' ? (
                   <>
                     <td className="px-6 py-4 text-sm text-primary">#{item.id}</td>
                     <td className="px-6 py-4 text-sm text-secondary">{new Date(item.fecha_alta).toLocaleDateString()}</td>
                     <td className="px-6 py-4 text-sm text-secondary">{item.responsable_medico || 'N/A'}</td>
                     <td className="px-6 py-4 text-sm text-secondary">{item.alimentacion_alta}</td>
                   </>
                 ) : (
                   <>
                     <td className="px-6 py-4 text-sm text-primary font-medium">{item.nombre}</td>
                     <td className="px-6 py-4 text-sm text-secondary">{item.rut}</td>
                     <td className="px-6 py-4 text-sm text-secondary">{new Date(item.fecha_alta).toLocaleDateString()}</td>
                     <td className="px-6 py-4 text-sm text-secondary">{item.responsable_medico || 'N/A'}</td>
                   </>
                 )}
               </tr>
             ))}

             {!loading && data.length === 0 && (
               <tr>
                 <td colSpan="4" className="px-6 py-4 text-center text-secondary">
                   No hay altas registradas en esta categoría.
                 </td>
               </tr>
             )}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} hasNext={!!nextPage} hasPrevious={!!prevPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}