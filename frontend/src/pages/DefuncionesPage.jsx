import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { PrinterIcon } from '@heroicons/react/24/outline';

export default function DefuncionesPage() {
  const [data, setData] = useState({ madres: [], recien_nacidos: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/api/defunciones/')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCertificado = async (tipo, id) => {
    try {
        const response = await apiClient.get(`/dashboard/api/certificado-defuncion/${tipo}/${id}/pdf/`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Certificado_Defuncion_${tipo}_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        alert("Error al descargar el certificado. " + (err.message || ""));
    }
  };

  const TableSection = ({ title, items, type }) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-red-600 mb-4">{title}</h3>
      <div className="bg-surface rounded-lg shadow overflow-hidden border border-red-200">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-red-50 dark:bg-red-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Nombre / ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">RUT / ID Madre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Fecha Fallecimiento</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase tracking-wider">Certificado</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                   {type === 'madre' ? item.nombre : `RN de ID Madre: ${item.parto_asociado}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                   {type === 'madre' ? item.rut : 'Ver detalle parto'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                   {item.fecha_fallecimiento ? new Date(item.fecha_fallecimiento).toLocaleString() : 'Sin fecha registrada'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                        // 'type' aquí es 'madre' o 'rn', que coincide con lo que espera el backend
                        onClick={() => handleDownloadCertificado(type, item.id)}
                        className="text-red-600 hover:text-red-800 flex items-center justify-end gap-1 ml-auto"
                        title="Descargar Certificado de Defunción"
                    >
                        <PrinterIcon className="h-5 w-5" /> Descargar
                    </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-secondary">No hay registros de fallecimientos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) return <div className="p-6 text-center">Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Registro de Defunciones</h1>
      <TableSection title="Mortalidad Materna" items={data.madres} type="madre" />
      <TableSection title="Mortalidad Neonatal" items={data.recien_nacidos} type="rn" />
    </div>
  );
}