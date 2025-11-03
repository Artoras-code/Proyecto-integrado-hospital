import React, { useState } from 'react';
import apiClient from '../services/apiClient';
import { ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

// (Funciones de fecha y mapeo de categorías... sin cambios)
const getToday = () => new Date().toISOString().split('T')[0];
const getFirstDayOfMonth = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
};
const pesosRNCategorias = {
  menos_500g: "Menos de 500g",
  de_500_a_999g: "500g - 999g",
  de_1000_a_1499g: "1000g - 1499g",
  de_1500_a_1999g: "1500g - 1999g",
  de_2000_a_2499g: "2000g - 2499g",
  de_2500_a_2999g: "2500g - 2999g",
  de_3000_a_3999g: "3000g - 3999g",
  mas_4000g: "4000g o más",
};

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState(getFirstDayOfMonth());
  const [fechaFin, setFechaFin] = useState(getToday());
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false); // Estado de carga para el Excel
  const [error, setError] = useState('');

  // 1. Función para llamar a la API de reportes (sin cambios)
  const handleGenerarReporte = async () => {
    setLoading(true);
    setError('');
    setReporteData(null);

    if (!fechaInicio || !fechaFin) {
      setError('Por favor, seleccione una fecha de inicio y fin.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/dashboard/api/reportes/rem/', {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }
      });
      setReporteData(response.data);
    } catch (err) {
      setError('Error al generar el reporte: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // --- 2. ¡NUEVA FUNCIÓN DE EXPORTACIÓN! ---
  const handleExportarExcel = async () => {
    setLoadingExport(true);
    setError('');

    try {
      const response = await apiClient.get('/dashboard/api/export/excel/', {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
        responseType: 'blob', // ¡Importante! Le pedimos a Axios que maneje la respuesta como un archivo binario
      });

      // Crear un "enlace fantasma" para iniciar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Extraer el nombre del archivo de los headers si es posible, si no, poner uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `reporte_partos_${fechaInicio}_al_${fechaFin}.xlsx`;
      if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch.length === 2)
              fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      
      // Simular clic
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontraron datos para exportar en ese rango de fechas.');
      } else {
        setError('Error al exportar el archivo.');
      }
      console.error(err);
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Generación de Reportes (REM BS22)</h1>
      <p className="mt-2 text-gray-400">
        Seleccione un rango de fechas para generar el consolidado o exportar la data cruda.
      </p>

      {/* --- Controles de Fecha --- */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center rounded-lg bg-gray-900 p-4">
        {/* ... (inputs de fecha sin cambios) ... */}
        <div>
          <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-300">Fecha de Inicio</label>
          <input
            type="date"
            id="fecha_inicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="mt-1 block rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-300">Fecha de Fin</label>
          <input
            type="date"
            id="fecha_fin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="mt-1 block rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1" />
        
        {/* Botón de Generar Reporte */}
        <button
          onClick={handleGenerarReporte}
          disabled={loading || loadingExport}
          className="flex w-full md:w-auto items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          <ChartBarIcon className="h-5 w-5" />
          {loading ? 'Generando...' : 'Generar Reporte'}
        </button>
        
        {/* Botón de Exportar a Excel */}
        <button
          onClick={handleExportarExcel}
          disabled={loading || loadingExport} // Deshabilitado si cualquiera de las dos acciones está en curso
          className="flex w-full md:w-auto items-center justify-center gap-x-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 disabled:opacity-50"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          {loadingExport ? 'Exportando...' : 'Exportar a Excel'}
        </button>
      </div>

      {/* --- Contenedor de Resultados --- */}
      <div className="mt-8">
        {error && <div className="rounded-md border border-red-500 bg-red-800 p-4 text-center text-red-200">{error}</div>}
        
        {reporteData && (
          // ... (El JSX para mostrar el reporte JSON no cambia) ...
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-lg bg-gray-900 p-5 shadow">
                <dt className="truncate text-sm font-medium text-gray-400">Rango de Fechas</dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight text-white">{reporteData.rango_fechas.inicio} al {reporteData.rango_fechas.fin}</dd>
              </div>
              <div className="overflow-hidden rounded-lg bg-gray-900 p-5 shadow">
                <dt className="truncate text-sm font-medium text-gray-400">Total de Partos</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{reporteData.total_partos}</dd>
              </div>
              <div className="overflow-hidden rounded-lg bg-gray-900 p-5 shadow">
                <dt className="truncate text-sm font-medium text-gray-400">Total de Recién Nacidos</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{reporteData.total_recien_nacidos}</dd>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold text-white">Sección A: Partos por Tipo</h3>
                <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Tipo de Parto</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-900">
                      {reporteData.seccion_A_partos_por_tipo.map((item) => (
                        <tr key={item.tipo_parto__nombre}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{item.tipo_parto__nombre || 'No especificado'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Sección D.1: Peso de Recién Nacidos</h3>
                <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Rango de Peso</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-900">
                      {Object.entries(reporteData.seccion_D1_pesos_recien_nacidos).map(([key, value]) => (
                        <tr key={key}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{pesosRNCategorias[key] || key}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}