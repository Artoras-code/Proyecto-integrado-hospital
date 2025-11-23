import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Pagination from '../components/Pagination';

export default function HistorialAltasPage() {
  const [altas, setAltas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  useEffect(() => {
    fetchAltas(currentPage);
  }, [currentPage]);

  const fetchAltas = async (page) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/dashboard/api/historial-altas/?page=${page}`);
      if (response.data.results) {
        setAltas(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        setAltas(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Historial de Altas</h1>
      
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">ID RN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Fecha Alta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Médico Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase">Alimentación</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
             {loading && <tr><td colSpan="4" className="px-6 py-4 text-center text-secondary">Cargando...</td></tr>}
             {!loading && altas.map(item => (
               <tr key={item.id}>
                 <td className="px-6 py-4 text-sm text-primary">#{item.id}</td>
                 <td className="px-6 py-4 text-sm text-secondary">{new Date(item.fecha_alta).toLocaleDateString()}</td>
                 <td className="px-6 py-4 text-sm text-secondary">{item.responsable_medico || 'N/A'}</td>
                 <td className="px-6 py-4 text-sm text-secondary">{item.alimentacion_alta}</td>
               </tr>
             ))}
             {!loading && altas.length === 0 && <tr><td colSpan="4" className="px-6 py-4 text-center">No hay altas registradas.</td></tr>}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} hasNext={!!nextPage} hasPrevious={!!prevPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}