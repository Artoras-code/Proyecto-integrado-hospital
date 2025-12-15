import React, { useState } from 'react';
import apiClient from '../services/apiClient';
import { ChartBarIcon, DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const getToday = () => new Date().toISOString().split('T')[0];
const getFirstDayOfMonth = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
};

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState(getFirstDayOfMonth());
  const [fechaFin, setFechaFin] = useState(getToday());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [error, setError] = useState('');

  const handleGenerarReporte = async () => {
    setLoading(true);
    setError('');
    setData(null);
    
    if (!fechaInicio || !fechaFin) {
      setError('Por favor, seleccione una fecha de inicio y fin.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/dashboard/api/reportes/rem/', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      });
      setData(response.data);
    } catch (err) {
      setError('Error al generar el reporte: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    setLoadingExport(true);
    try {
      const response = await apiClient.get('/dashboard/api/export/excel/', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registros_partos_${fechaInicio}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al exportar Excel.');
    } finally {
      setLoadingExport(false);
    }
  };

  const handleExportarREMPDF = async () => {
    setLoadingExport(true);
    try {
      const response = await apiClient.get('/dashboard/api/reportes/rem/pdf/', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `REM_A24_${fechaInicio}_al_${fechaFin}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al exportar PDF.');
    } finally {
      setLoadingExport(false);
    }
  };


  const Th = ({ children, align = "left", className = "" }) => (
    <th className={`px-4 py-3 bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-${align} ${className}`}>
      {children}
    </th>
  );
  
  const Td = ({ children, align = "left", className = "" }) => (
    <td className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 text-${align} ${className}`}>
      {children}
    </td>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 py-8">
      <h1 className="text-4xl lg:text-5xl font-extrabold text-accent-mint uppercase leading-tight tracking-tighter mb-6">
        Reporte REM A.24
      </h1>


      <div className="bg-surface p-6 rounded-2xl shadow-lg border border-border mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">Seleccionar Rango de Fechas</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Fecha Inicio</label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={e => setFechaInicio(e.target.value)} 
              className="block w-full rounded-md border-border bg-background text-primary p-2 focus:ring-accent-mint focus:border-accent-mint" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Fecha Fin</label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={e => setFechaFin(e.target.value)} 
              className="block w-full rounded-md border-border bg-background text-primary p-2 focus:ring-accent-mint focus:border-accent-mint" 
            />
          </div>
          
          <div className="flex-1"></div>

          <div className="flex gap-3">
            <button 
                onClick={handleExportarExcel} disabled={loading || loadingExport}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
                <DocumentArrowDownIcon className="h-5 w-5" /> Excel
            </button>
            <button 
                onClick={handleExportarREMPDF} disabled={loading || loadingExport}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
                <DocumentTextIcon className="h-5 w-5" /> PDF REM
            </button>
            <button 
                onClick={handleGenerarReporte} disabled={loading || loadingExport}
                className="flex items-center gap-2 bg-accent-mint text-white px-6 py-2 rounded-lg font-semibold hover:bg-accent-mint-hover disabled:opacity-50"
            >
                <ChartBarIcon className="h-5 w-5" /> {loading ? 'Generando...' : 'Ver Reporte'}
            </button>
          </div>
        </div>
        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">{error}</div>}
      </div>


      {data && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-primary">Sección A: Información General de Partos</h3>
            </div>
            <table className="w-full">
              <tbody>
                <tr><Td><strong>Total Partos</strong></Td><Td align="right" className="text-lg font-bold">{data.seccion_a.total_partos}</Td></tr>
                <tr><Td className="pl-8">Parto Vaginal Espontáneo</Td><Td align="right">{data.seccion_a.vaginal_espontaneo}</Td></tr>
                <tr><Td className="pl-8">Parto Vaginal Instrumental</Td><Td align="right">{data.seccion_a.vaginal_instrumental}</Td></tr>
                <tr><Td className="pl-8">Cesárea Electiva</Td><Td align="right">{data.seccion_a.cesarea_electiva}</Td></tr>
                <tr><Td className="pl-8">Cesárea Urgencia</Td><Td align="right">{data.seccion_a.cesarea_urgencia}</Td></tr>
                <tr><Td className="text-secondary italic">Con uso de Oxitocina</Td><Td align="right" className="text-secondary">{data.seccion_a.con_oxitocina}</Td></tr>
                <tr><Td className="text-secondary italic">Con Ligadura Tardía de Cordón</Td><Td align="right" className="text-secondary">{data.seccion_a.con_ligadura_tardia}</Td></tr>
                <tr><Td className="text-secondary italic">Con Contacto Piel a Piel</Td><Td align="right" className="text-secondary">{data.seccion_a.con_piel_a_piel}</Td></tr>
              </tbody>
            </table>
          </div>


          <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-primary">Sección D.1: Información General RN Vivos (Peso)</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr><Th>Rango de Peso</Th><Th align="right">Cantidad</Th></tr>
              </thead>
              <tbody>
                <tr><Td>Menos de 500g</Td><Td align="right">{data.seccion_d1.peso_menor_500}</Td></tr>
                <tr><Td>500 - 999g</Td><Td align="right">{data.seccion_d1.peso_500_999}</Td></tr>
                <tr><Td>1000 - 1499g</Td><Td align="right">{data.seccion_d1.peso_1000_1499}</Td></tr>
                <tr><Td>1500 - 1999g</Td><Td align="right">{data.seccion_d1.peso_1500_1999}</Td></tr>
                <tr><Td>2000 - 2499g</Td><Td align="right">{data.seccion_d1.peso_2000_2499}</Td></tr>
                <tr><Td>2500 - 2999g</Td><Td align="right">{data.seccion_d1.peso_2500_2999}</Td></tr>
                <tr><Td>3000 - 3999g</Td><Td align="right">{data.seccion_d1.peso_3000_3999}</Td></tr>
                <tr><Td>4000g y más</Td><Td align="right">{data.seccion_d1.peso_mayor_4000}</Td></tr>
                <tr className="bg-red-50 dark:bg-red-900/20"><Td className="text-red-700 dark:text-red-300 font-medium">Con Anomalía Congénita</Td><Td align="right" className="text-red-700 dark:text-red-300 font-bold">{data.seccion_d1.con_anomalia}</Td></tr>
                <tr className="bg-gray-100 dark:bg-gray-700"><Td><strong>TOTAL NACIDOS VIVOS</strong></Td><Td align="right"><strong>{data.seccion_d1.total_rn}</strong></Td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-primary">Sección D.2: Atención Inmediata del RN</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <table className="w-full border-r border-border">
                    <thead><tr><Th colSpan="2" align="center">Profilaxis y Tipo Parto (RN)</Th></tr></thead>
                    <tbody>
                        <tr><Td>Profilaxis Ocular</Td><Td align="right">{data.seccion_d2.profilaxis_ocular}</Td></tr>
                        <tr><Td>Vacuna Hepatitis B</Td><Td align="right">{data.seccion_d2.profilaxis_hepb}</Td></tr>
                        <tr><Td className="border-t-4 border-gray-100 dark:border-gray-700">RN por Parto Vaginal</Td><Td align="right" className="border-t-4 border-gray-100 dark:border-gray-700">{data.seccion_d2.rn_vaginal}</Td></tr>
                        <tr><Td>RN por Parto Instrumental</Td><Td align="right">{data.seccion_d2.rn_instrumental}</Td></tr>
                        <tr><Td>RN por Cesárea</Td><Td align="right">{data.seccion_d2.rn_cesarea}</Td></tr>
                    </tbody>
                </table>
                <table className="w-full">
                    <thead><tr><Th colSpan="2" align="center">Condición del Recién Nacido</Th></tr></thead>
                    <tbody>
                        <tr><Td>APGAR 1' ≤ 3</Td><Td align="right">{data.seccion_d2.apgar_1_min_lte_3}</Td></tr>
                        <tr><Td>APGAR 5' ≤ 6</Td><Td align="right">{data.seccion_d2.apgar_5_min_lte_6}</Td></tr>
                        <tr><Td className="border-t-4 border-gray-100 dark:border-gray-700">Reanimación Básica</Td><Td align="right" className="border-t-4 border-gray-100 dark:border-gray-700">{data.seccion_d2.reanimacion_basica}</Td></tr>
                        <tr><Td>Reanimación Avanzada</Td><Td align="right">{data.seccion_d2.reanimacion_avanzada}</Td></tr>
                    </tbody>
                </table>
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow overflow-hidden border border-border">
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-primary">Sección E: Alimentación al Alta</h3>
            </div>
            <table className="w-full text-center">
              <thead>
                <tr>
                  <Th align="left">Tipo Alimentación</Th>
                  <Th align="center">Total General</Th>
                  <Th align="center">Pueblos Originarios</Th>
                  <Th align="center">Migrantes</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td className="font-medium">Lactancia Materna Exclusiva</Td>
                  <Td align="center" className="font-bold text-accent-mint">{data.seccion_e.lme_total}</Td>
                  <Td align="center">{data.seccion_e.lme_pueblo}</Td>
                  <Td align="center">{data.seccion_e.lme_migrante}</Td>
                </tr>
                <tr>
                  <Td className="font-medium">Lactancia Mixta</Td>
                  <Td align="center" className="font-bold">{data.seccion_e.mixta_total}</Td>
                  <Td align="center">{data.seccion_e.mixta_pueblo}</Td>
                  <Td align="center">{data.seccion_e.mixta_migrante}</Td>
                </tr>
                <tr>
                  <Td className="font-medium">Fórmula Artificial</Td>
                  <Td align="center" className="font-bold">{data.seccion_e.formula_total}</Td>
                  <Td align="center">{data.seccion_e.formula_pueblo}</Td>
                  <Td align="center">{data.seccion_e.formula_migrante}</Td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}