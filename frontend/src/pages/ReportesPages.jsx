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
// ---

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState(getFirstDayOfMonth());
  const [fechaFin, setFechaFin] = useState(getToday());
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [error, setError] = useState('');

  // (Lógica de handleGenerarReporte y handleExportarExcel sin cambios)
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
  
  const handleExportarExcel = async () => {
    setLoadingExport(true);
    setError('');

    try {
      const response = await apiClient.get('/dashboard/api/export/excel/', {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `reporte_partos_${fechaInicio}_al_${fechaFin}.xlsx`;
      if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch && fileNameMatch.length === 2)
              fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
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
  
  // --- Clases de estilo reutilizables ---
  const labelClass = "block text-sm font-medium text-secondary";
  const inputClass = "mt-1 block w-full rounded-md border-border bg-surface text-primary shadow-sm focus:border-accent-mint focus:ring-accent-mint";
  const cardClass = "bg-surface rounded-2xl shadow-lg border border-border p-6";

  return (
    <div className="space-y-6">
      {/* 1. Título principal */}
      <h1 className="text-4xl lg:text-5xl font-extrabold text-accent-mint uppercase leading-tight tracking-tighter">
        Generación de Reportes
      </h1>

      {/* --- 2. Tarjeta de Controles --- */}
      <div className={cardClass}>
        <h2 className="text-xl font-semibold text-primary">Seleccionar Rango de Fechas</h2>
        <p className="mt-1 text-sm text-secondary">Elija el período para generar el reporte REM o exportar a Excel.</p>
        
        {/* Controles */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label htmlFor="fecha_inicio" className={labelClass}>Fecha de Inicio</label>
            <input
              type="date"
              id="fecha_inicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="fecha_fin" className={labelClass}>Fecha de Fin</label>
            <input
              type="date"
              id="fecha_fin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={inputClass}
            />
          </div>
          {/* Espaciador */}
          <div className="flex-1" />
          
          {/* Botones de Acción */}
          <button
            onClick={handleExportarExcel}
            disabled={loading || loadingExport}
            // Botón Secundario (Verde para 'éxito')
            className="flex w-full md:w-auto items-center justify-center gap-x-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            {loadingExport ? 'Exportando...' : 'Exportar a Excel'}
          </button>
          <button
            onClick={handleGenerarReporte}
            disabled={loading || loadingExport}
            // Botón Primario (Mint)
            className="flex w-full md:w-auto items-center justify-center gap-x-2 rounded-lg bg-accent-mint px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-mint-hover disabled:opacity-50"
          >
            <ChartBarIcon className="h-5 w-5" />
            {loading ? 'Generando...' : 'Generar Reporte REM'}
          </button>
        </div>
      </div>

      {/* --- 3. Tarjeta de Resultados (Condicional) --- */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {reporteData && (
        <div className={`${cardClass} space-y-8`}>
          {/* Resumen de Totales */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-border">
              <dt className="truncate text-sm font-medium text-secondary">Rango de Fechas</dt>
              <dd className="mt-1 text-xl font-semibold tracking-tight text-primary">{reporteData.rango_fechas.inicio} al {reporteData.rango_fechas.fin}</dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-border">
              <dt className="truncate text-sm font-medium text-secondary">Total de Partos</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-primary">{reporteData.total_partos}</dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-border">
              <dt className="truncate text-sm font-medium text-secondary">Total de Recién Nacidos</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-primary">{reporteData.total_recien_nacidos}</dd>
            </div>
          </div>
          
          {/* Tablas de Reporte */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-primary">Sección A: Partos por Tipo</h3>
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">Tipo de Parto</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {reporteData.seccion_A_partos_por_tipo.map((item) => (
                      <tr key={item.tipo_parto__nombre}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-6">{item.tipo_parto__nombre || 'No especificado'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary">Sección D.1: Peso de Recién Nacidos</h3>
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">Rango de Peso</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {Object.entries(reporteData.seccion_D1_pesos_recien_nacidos).map(([key, value]) => (
                      <tr key={key}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-6">{pesosRNCategorias[key] || key}</td>
                        <td className="whitespace-nowarpx-3 py-4 text-sm text-secondary">{value}</td>
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
  );
}