import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { CalculatorIcon, PlusCircleIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import ApgarCalculator from '../components/ApgarCalculator';

const PARAMETROS_FIJOS = {
  tiposParto: [
    { id: 1, nombre: "Parto Vaginal Espontáneo" },
    { id: 2, nombre: "Parto Vaginal Instrumental (Fórceps)" },
    { id: 3, nombre: "Parto Vaginal Instrumental (Vacuum)" },
    { id: 4, nombre: "Cesárea Electiva" },
    { id: 5, nombre: "Cesárea de Urgencia" },
  ],
  tiposAnalgesia: [
    { id: 1, nombre: "Regional: Epidural" },
    { id: 2, nombre: "Regional: Espinal (Raquídea)" },
    { id: 3, nombre: "Regional: Combinada" },
    { id: 4, nombre: "Anestesia General" },
    { id: 5, nombre: "Inhalatoria (Óxido Nitroso)" },
    { id: 6, nombre: "Sin Analgesia (Manejo no farmacológico)" },
  ],
};

const formatRut = (value) => {
  let rut = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length <= 1) return rut;
  
  const dv = rut.slice(-1);
  let cuerpo = rut.slice(0, -1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpo}-${dv}`;
};

const INITIAL_RN_STATE = {
    sexo: 'I',
    peso_grs: '',
    talla_cm: '',
    apgar_1_min: '',
    apgar_5_min: '',
    profilaxis_ocular: true,
    vacuna_hepatitis_b: true,
    reanimacion: 'ninguna',
    anomalia_congenita: false,
    alimentacion_alta: 'LME',
};

export default function RegistroFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apgarConfig, setApgarConfig] = useState({ show: false, index: null, field: '' });

  const [madre, setMadre] = useState({
    rut: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: '',
  });
  
  const [parto, setParto] = useState({
    fecha_parto: '', edad_gestacional_semanas: '', tipo_parto: '', 
    tipo_analgesia: '', complicaciones_texto: '', 
    uso_oxitocina: false, ligadura_tardia_cordon: false, contacto_piel_a_piel: false,
  });

  const [recienNacidos, setRecienNacidos] = useState([ { ...INITIAL_RN_STATE } ]);

  const handleMadreChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rut') {
      const formatted = formatRut(value);
      if (formatted.length <= 12) setMadre(prev => ({ ...prev, [name]: formatted }));
    } else {
      setMadre(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePartoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParto(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleRnChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newRns = [...recienNacidos];
    newRns[index] = {
        ...newRns[index],
        [name]: type === 'checkbox' ? checked : value
    };
    setRecienNacidos(newRns);
  };

  const addRecienNacido = () => {
    setRecienNacidos([...recienNacidos, { ...INITIAL_RN_STATE }]);
  };

  const removeRecienNacido = (index) => {
    if (recienNacidos.length === 1) return;
    const newRns = recienNacidos.filter((_, i) => i !== index);
    setRecienNacidos(newRns);
  };

  const openApgarCalc = (index, targetField) => {
    setApgarConfig({ show: true, index: index, field: targetField });
  };

  const handleApgarResult = (total) => {
    if (apgarConfig.index !== null) {
        const newRns = [...recienNacidos];
        newRns[apgarConfig.index] = {
            ...newRns[apgarConfig.index],
            [apgarConfig.field]: total
        };
        setRecienNacidos(newRns);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        setError('No se pudo identificar al usuario. Inicie sesión nuevamente.');
        setLoading(false);
        return;
    }
    const isSupervisor = user.rol === 'supervisor';
    
    let madreId = null;

    try {
      const resMadre = await apiClient.post('/dashboard/api/madres/', madre);
      madreId = resMadre.data.id;

      const partoData = {
        ...parto,
        madre: madreId,
        registrado_por: isSupervisor ? user.id : undefined,
      };
      
      const partoApiUrl = isSupervisor ? '/dashboard/api/registros-parto/' : '/dashboard/api/mis-registros/';
      const resParto = await apiClient.post(partoApiUrl, partoData);
      const partoId = resParto.data.id;

      const promises = recienNacidos.map(rn => {
        return apiClient.post('/dashboard/api/recien-nacidos/', {
            ...rn,
            parto_asociado: partoId
        });
      });

      await Promise.all(promises);
      
      setLoading(false);
      setSuccess(`Registro guardado exitosamente (${recienNacidos.length} recién nacidos).`);
      
      setMadre({ rut: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: '' });
      setParto({ fecha_parto: '', edad_gestacional_semanas: '', tipo_parto: '', tipo_analgesia: '', complicaciones_texto: '', uso_oxitocina: false, ligadura_tardia_cordon: false, contacto_piel_a_piel: false });
      setRecienNacidos([{ ...INITIAL_RN_STATE }]);
      
      setTimeout(() => navigate(-1), 2000);

    } catch (err) {
      setLoading(false);
      setError('Error al guardar: ' + (err.response?.data?.detail || err.message));
    }
  };

  const labelClass = "block text-sm font-medium text-secondary mb-1";
  const inputClass = "block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-primary shadow-sm focus:border-accent-mint focus:ring-accent-mint py-2.5 px-3"; // Inputs más grandes
  const checkboxClass = "h-5 w-5 rounded border-gray-300 text-accent-mint focus:ring-accent-mint";
  // Tarjetas con más padding (p-8)
  const cardClass = "bg-surface p-8 rounded-2xl shadow-lg border border-border";

  return (
    // CAMBIO CLAVE: max-w-7xl para usar más ancho de pantalla
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-accent-mint uppercase tracking-tight leading-none">
                Nuevo Parto
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                Complete el formulario clínico. Todos los campos son obligatorios salvo indicación.
            </p>
        </div>
        <div className="text-base font-semibold text-accent-mint bg-accent-mint/10 px-4 py-2 rounded-full border border-accent-mint/20">
            {recienNacidos.length > 1 ? `Parto Múltiple (${recienNacidos.length} Bebés)` : 'Parto Único'}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECCIÓN 1: MADRE (Grid más espacioso) */}
        <div className={cardClass}>
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Datos de la Madre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            <div className="md:col-span-3">
              <label htmlFor="rut" className={labelClass}>RUT</label>
              <input type="text" name="rut" id="rut" value={madre.rut} onChange={handleMadreChange} className={inputClass} placeholder="12.345.678-9" required />
            </div>
            <div className="md:col-span-5">
              <label htmlFor="nombre" className={labelClass}>Nombre Completo</label>
              <input type="text" name="nombre" id="nombre" value={madre.nombre} onChange={handleMadreChange} className={inputClass} required />
            </div>
            <div className="md:col-span-4">
              <label htmlFor="fecha_nacimiento" className={labelClass}>Fecha Nacimiento</label>
              <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" value={madre.fecha_nacimiento} onChange={handleMadreChange} className={inputClass} required />
            </div>
            
            <div className="md:col-span-4">
              <label htmlFor="telefono" className={labelClass}>Teléfono</label>
              <input type="tel" name="telefono" id="telefono" value={madre.telefono} onChange={handleMadreChange} className={inputClass} placeholder="+56 9..." />
            </div>
            <div className="md:col-span-8">
              <label htmlFor="direccion" className={labelClass}>Dirección Domiciliaria</label>
              <input type="text" name="direccion" id="direccion" value={madre.direccion} onChange={handleMadreChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PARTO */}
        <div className={cardClass}>
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Antecedentes del Parto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div>
              <label className={labelClass}>Fecha y Hora</label>
              <input type="datetime-local" name="fecha_parto" value={parto.fecha_parto} onChange={handlePartoChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Edad Gest. (Semanas)</label>
              <input type="number" name="edad_gestacional_semanas" value={parto.edad_gestacional_semanas} onChange={handlePartoChange} className={inputClass} required />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Tipo de Parto</label>
              <select name="tipo_parto" value={parto.tipo_parto} onChange={handlePartoChange} className={inputClass} required>
                <option value="">Seleccione tipo de parto...</option>
                {PARAMETROS_FIJOS.tiposParto.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Analgesia / Anestesia</label>
              <select name="tipo_analgesia" value={parto.tipo_analgesia} onChange={handlePartoChange} className={inputClass}>
                <option value="">Seleccione analgesia...</option>
                {PARAMETROS_FIJOS.tiposAnalgesia.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Complicaciones (Opcional)</label>
              <input type="text" name="complicaciones_texto" value={parto.complicaciones_texto} onChange={handlePartoChange} className={inputClass} placeholder="Breve descripción..." />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Indicadores de Calidad</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {['uso_oxitocina', 'ligadura_tardia_cordon', 'contacto_piel_a_piel'].map(field => (
                    <label key={field} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <input id={field} name={field} type="checkbox" checked={parto[field]} onChange={handlePartoChange} className="h-6 w-6 text-accent-mint rounded focus:ring-accent-mint" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {field === 'uso_oxitocina' ? 'Uso Oxitocina' : field === 'ligadura_tardia_cordon' ? 'Ligadura Tardía' : 'Piel a Piel'}
                        </span>
                    </label>
                ))}
            </div>
          </div>
        </div>
        
        {/* SECCIÓN 3: RECIÉN NACIDOS */}
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center px-2">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Recién Nacidos ({recienNacidos.length})
                </h2>
                <button 
                    type="button" 
                    onClick={addRecienNacido} 
                    className="mt-4 sm:mt-0 flex items-center gap-2 bg-white text-accent-mint border-2 border-accent-mint px-6 py-2.5 rounded-xl hover:bg-accent-mint hover:text-white transition-all font-bold shadow-sm"
                >
                    <PlusCircleIcon className="h-6 w-6" /> Agregar Gemelo
                </button>
            </div>

            {recienNacidos.map((rn, index) => (
                <div key={index} className={`${cardClass} border-l-[6px] ${index === 0 ? 'border-l-accent-mint' : 'border-l-purple-500'} relative animate-fade-in`}>
                    
                    {/* Header Tarjeta Bebé */}
                    <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${index === 0 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                <UserIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recién Nacido #{index + 1}</h3>
                                <p className="text-sm text-gray-500">Complete la información antropométrica y clínica</p>
                            </div>
                        </div>
                        {recienNacidos.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeRecienNacido(index)} 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <TrashIcon className="h-5 w-5" /> <span className="hidden sm:inline">Eliminar</span>
                            </button>
                        )}
                    </div>

                    {/* Grid de Inputs del Bebé (4 columnas en pantallas grandes) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        <div>
                            <label className={labelClass}>Sexo Biológico</label>
                            <select name="sexo" value={rn.sexo} onChange={(e) => handleRnChange(index, e)} className={inputClass} required>
                                <option value="I">Indeterminado</option>
                                <option value="F">Femenino</option>
                                <option value="M">Masculino</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Peso (gramos)</label>
                            <input type="number" name="peso_grs" value={rn.peso_grs} onChange={(e) => handleRnChange(index, e)} className={inputClass} placeholder="Ej: 3250" required />
                        </div>
                        <div>
                            <label className={labelClass}>Talla (cm)</label>
                            <input type="number" step="0.1" name="talla_cm" value={rn.talla_cm} onChange={(e) => handleRnChange(index, e)} className={inputClass} placeholder="Ej: 50.5" required />
                        </div>
                        
                        {/* APGAR Group */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 lg:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2 text-center">Puntaje APGAR</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-center block mb-1">Min 1</label>
                                    <div className="flex gap-1">
                                        <input type="number" name="apgar_1_min" value={rn.apgar_1_min} onChange={(e) => handleRnChange(index, e)} className={`${inputClass} text-center px-1`} min="0" max="10" required />
                                        <button type="button" onClick={() => openApgarCalc(index, 'apgar_1_min')} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"><CalculatorIcon className="h-5 w-5" /></button>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-center block mb-1">Min 5</label>
                                    <div className="flex gap-1">
                                        <input type="number" name="apgar_5_min" value={rn.apgar_5_min} onChange={(e) => handleRnChange(index, e)} className={`${inputClass} text-center px-1`} min="0" max="10" required />
                                        <button type="button" onClick={() => openApgarCalc(index, 'apgar_5_min')} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"><CalculatorIcon className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fila 2 de Inputs */}
                        <div>
                            <label className={labelClass}>Reanimación Neonatal</label>
                            <select name="reanimacion" value={rn.reanimacion} onChange={(e) => handleRnChange(index, e)} className={inputClass}>
                                <option value="ninguna">Ninguna</option>
                                <option value="basica">Básica (Estimulación/O2)</option>
                                <option value="avanzada">Avanzada (VPP/Masaje)</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Alimentación al Alta</label>
                            <select name="alimentacion_alta" value={rn.alimentacion_alta} onChange={(e) => handleRnChange(index, e)} className={inputClass}>
                                <option value="LME">Lactancia Materna Exclusiva</option>
                                <option value="LMixta">Lactancia Mixta</option>
                                <option value="Formula">Fórmula Artificial</option>
                            </select>
                        </div>
                    </div>

                    {/* Checkboxes Footer */}
                    <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                         <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="profilaxis_ocular" checked={rn.profilaxis_ocular} onChange={(e) => handleRnChange(index, e)} className="h-5 w-5 rounded text-accent-mint focus:ring-accent-mint" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Profilaxis Ocular</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="vacuna_hepatitis_b" checked={rn.vacuna_hepatitis_b} onChange={(e) => handleRnChange(index, e)} className="h-5 w-5 rounded text-accent-mint focus:ring-accent-mint" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Vacuna Hepatitis B</span>
                        </label>
                        <div className="flex-grow hidden sm:block"></div>
                        <label className="flex items-center gap-3 cursor-pointer bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors">
                            <input type="checkbox" name="anomalia_congenita" checked={rn.anomalia_congenita} onChange={(e) => handleRnChange(index, e)} className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500" />
                            <span className="text-red-700 dark:text-red-400 font-bold">Presenta Anomalía Congénita</span>
                        </label>
                    </div>
                </div>
            ))}
        </div>

        {/* Action Bar Flotante */}
        <div className="flex justify-end items-center gap-4 pt-6 sticky bottom-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-6 border-t border-gray-200 dark:border-gray-700 shadow-up-lg -mx-4 sm:-mx-6 lg:-mx-8 rounded-t-2xl">
          {error && <div className="mr-auto text-red-600 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100 animate-pulse">{error}</div>}
          {success && <div className="mr-auto text-green-600 text-sm font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-100">{success}</div>}
          
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:border-gray-600 font-semibold transition-all" 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="bg-accent-mint hover:bg-accent-mint-hover text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : `Guardar Registro (${recienNacidos.length} RN)`}
          </button>
        </div>
      </form>

      <ApgarCalculator
        isOpen={apgarConfig.show}
        onClose={() => setApgarConfig({ ...apgarConfig, show: false })}
        onCalculate={handleApgarResult}
        title={`RN #${(apgarConfig.index || 0) + 1} - ${apgarConfig.field === 'apgar_1_min' ? 'Min 1' : 'Min 5'}`}
      />
    </div>
  );
}