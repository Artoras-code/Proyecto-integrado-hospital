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

// Estado inicial para un recién nacido limpio
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

  // Estado para controlar qué Apgar se está calculando: índice del bebé y campo (min 1 o 5)
  const [apgarConfig, setApgarConfig] = useState({ show: false, index: null, field: '' });

  const [madre, setMadre] = useState({
    rut: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: '',
  });
  
  const [parto, setParto] = useState({
    fecha_parto: '', edad_gestacional_semanas: '', tipo_parto: '', 
    tipo_analgesia: '', complicaciones_texto: '', 
    uso_oxitocina: false, ligadura_tardia_cordon: false, contacto_piel_a_piel: false,
  });

  // Array de bebés para manejar múltiples nacimientos
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
  
  // Manejo de cambios para un bebé específico por su índice en el array
  const handleRnChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newRns = [...recienNacidos];
    newRns[index] = {
        ...newRns[index],
        [name]: type === 'checkbox' ? checked : value
    };
    setRecienNacidos(newRns);
  };

  // Agregar un nuevo formulario de bebé (gemelo, trillizo...)
  const addRecienNacido = () => {
    setRecienNacidos([...recienNacidos, { ...INITIAL_RN_STATE }]);
  };

  // Eliminar un bebé de la lista
  const removeRecienNacido = (index) => {
    if (recienNacidos.length === 1) return; // Evitar dejar la lista vacía
    const newRns = recienNacidos.filter((_, i) => i !== index);
    setRecienNacidos(newRns);
  };

  // Abrir la calculadora para un bebé específico
  const openApgarCalc = (index, targetField) => {
    setApgarConfig({ show: true, index: index, field: targetField });
  };

  // Recibir resultado de la calculadora y aplicarlo al bebé correcto
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
        setError('No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.');
        setLoading(false);
        return;
    }
    const isSupervisor = user.rol === 'supervisor';
    
    let madreId = null;

    try {
      // 1. Crear o actualizar Madre
      const resMadre = await apiClient.post('/dashboard/api/madres/', madre);
      madreId = resMadre.data.id;

      // 2. Crear Registro de Parto
      const partoData = {
        ...parto,
        madre: madreId,
        // Si es supervisor, asignamos explícitamente. Si es clínico, el backend usa request.user
        registrado_por: isSupervisor ? user.id : undefined, 
      };
      
      const partoApiUrl = isSupervisor ? '/dashboard/api/registros-parto/' : '/dashboard/api/mis-registros/';
      const resParto = await apiClient.post(partoApiUrl, partoData);
      const partoId = resParto.data.id;

      // 3. Crear Recién Nacidos (Iterar sobre el array y enviarlos todos)
      const promises = recienNacidos.map(rn => {
        return apiClient.post('/dashboard/api/recien-nacidos/', {
            ...rn,
            parto_asociado: partoId
        });
      });

      await Promise.all(promises);
      
      setLoading(false);
      setSuccess(`Registro creado exitosamente con ${recienNacidos.length} recién nacido(s).`);
      
      // Resetear formularios
      setMadre({ rut: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: '' });
      setParto({ fecha_parto: '', edad_gestacional_semanas: '', tipo_parto: '', tipo_analgesia: '', complicaciones_texto: '', uso_oxitocina: false, ligadura_tardia_cordon: false, contacto_piel_a_piel: false });
      setRecienNacidos([{ ...INITIAL_RN_STATE }]);
      
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (err) {
      setLoading(false);
      setError('Error al guardar el registro. Revise los campos. ' + (err.response?.data?.detail || err.message));
      console.error(err);
      
      // Nota: Si falla la creación de RNs, el parto y la madre ya quedaron creados.
      // Se podría implementar una lógica de reversión aquí si fuera crítico.
    }
  };

  const labelClass = "block text-sm font-medium text-secondary";
  const inputClass = "mt-1 block w-full rounded-md border-border bg-surface text-primary shadow-sm focus:border-accent-mint focus:ring-accent-mint";
  const checkboxClass = "h-4 w-4 rounded border-border bg-surface text-accent-mint focus:ring-accent-mint";
  const cardClass = "bg-surface p-6 rounded-2xl shadow-lg border border-border";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-extrabold text-accent-mint uppercase tracking-tighter leading-tight">
            Ingresar Nuevo Registro
        </h1>
        <div className="text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            {recienNacidos.length > 1 ? 'Parto Múltiple' : 'Parto Único'}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: MADRE */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold text-primary mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">1. Datos de la Madre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rut" className={labelClass}>RUT</label>
              <input type="text" name="rut" id="rut" value={madre.rut} onChange={handleMadreChange} className={inputClass} placeholder="Ej: 12.345.678-9" required />
            </div>
            <div>
              <label htmlFor="nombre" className={labelClass}>Nombre Completo</label>
              <input type="text" name="nombre" id="nombre" value={madre.nombre} onChange={handleMadreChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="fecha_nacimiento" className={labelClass}>Fecha Nacimiento</label>
              <input type="date" name="fecha_nacimiento" id="fecha_nacimiento" value={madre.fecha_nacimiento} onChange={handleMadreChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="telefono" className={labelClass}>Teléfono</label>
              <input type="tel" name="telefono" id="telefono" value={madre.telefono} onChange={handleMadreChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="direccion" className={labelClass}>Dirección</label>
              <input type="text" name="direccion" id="direccion" value={madre.direccion} onChange={handleMadreChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PARTO */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold text-primary mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">2. Datos del Parto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Fecha y Hora</label>
              <input type="datetime-local" name="fecha_parto" value={parto.fecha_parto} onChange={handlePartoChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Edad Gestacional (Sem)</label>
              <input type="number" name="edad_gestacional_semanas" value={parto.edad_gestacional_semanas} onChange={handlePartoChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Tipo de Parto</label>
              <select name="tipo_parto" value={parto.tipo_parto} onChange={handlePartoChange} className={inputClass} required>
                <option value="">Seleccione...</option>
                {PARAMETROS_FIJOS.tiposParto.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Analgesia</label>
              <select name="tipo_analgesia" value={parto.tipo_analgesia} onChange={handlePartoChange} className={inputClass}>
                <option value="">Seleccione...</option>
                {PARAMETROS_FIJOS.tiposAnalgesia.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Complicaciones</label>
              <textarea name="complicaciones_texto" value={parto.complicaciones_texto} onChange={handlePartoChange} className={inputClass} rows="2" placeholder="Opcional..."></textarea>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            {['uso_oxitocina', 'ligadura_tardia_cordon', 'contacto_piel_a_piel'].map(field => (
                <div key={field} className="flex items-center gap-x-2">
                    <input id={field} name={field} type="checkbox" checked={parto[field]} onChange={handlePartoChange} className={checkboxClass} />
                    <label htmlFor={field} className={labelClass}>
                        {field === 'uso_oxitocina' ? 'Uso Oxitocina' : field === 'ligadura_tardia_cordon' ? 'Ligadura Tardía' : 'Piel a Piel'}
                    </label>
                </div>
            ))}
          </div>
        </div>
        
        {/* SECCIÓN 3: RECIÉN NACIDOS (DINÁMICO) */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-xl font-semibold text-primary">3. Recién Nacidos ({recienNacidos.length})</h2>
                <button 
                    type="button" 
                    onClick={addRecienNacido} 
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold shadow-sm"
                >
                    <PlusCircleIcon className="h-5 w-5" /> Agregar Gemelo/Trillizo
                </button>
            </div>

            <div className="space-y-6">
                {recienNacidos.map((rn, index) => (
                    <div key={index} className={`${cardClass} border-l-4 ${index === 0 ? 'border-l-accent-mint' : 'border-l-purple-500'} relative animate-fade-in`}>
                        
                        {/* Cabecera de la tarjeta del bebé */}
                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${index === 0 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
                                    Recién Nacido #{index + 1}
                                </h3>
                            </div>
                            {recienNacidos.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeRecienNacido(index)} 
                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" 
                                    title="Eliminar este bebé del registro"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Campos del Bebé */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className={labelClass}>Sexo</label>
                                <select name="sexo" value={rn.sexo} onChange={(e) => handleRnChange(index, e)} className={inputClass} required>
                                    <option value="I">Indeterminado</option>
                                    <option value="F">Femenino</option>
                                    <option value="M">Masculino</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Peso (g)</label>
                                <input type="number" name="peso_grs" value={rn.peso_grs} onChange={(e) => handleRnChange(index, e)} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Talla (cm)</label>
                                <input type="number" step="0.1" name="talla_cm" value={rn.talla_cm} onChange={(e) => handleRnChange(index, e)} className={inputClass} required />
                            </div>
                            
                            {/* APGAR Inputs con botón de calculadora */}
                            <div>
                                <label className={labelClass}>APGAR 1'</label>
                                <div className="flex gap-1">
                                    <input type="number" name="apgar_1_min" value={rn.apgar_1_min} onChange={(e) => handleRnChange(index, e)} className={inputClass} min="0" max="10" required />
                                    <button 
                                        type="button" 
                                        onClick={() => openApgarCalc(index, 'apgar_1_min')} 
                                        className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
                                        title="Calcular APGAR"
                                    >
                                        <CalculatorIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>APGAR 5'</label>
                                <div className="flex gap-1">
                                    <input type="number" name="apgar_5_min" value={rn.apgar_5_min} onChange={(e) => handleRnChange(index, e)} className={inputClass} min="0" max="10" required />
                                    <button 
                                        type="button" 
                                        onClick={() => openApgarCalc(index, 'apgar_5_min')} 
                                        className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
                                        title="Calcular APGAR"
                                    >
                                        <CalculatorIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Campos REM A.24 Específicos */}
                            <div>
                                <label className={labelClass}>Reanimación</label>
                                <select name="reanimacion" value={rn.reanimacion} onChange={(e) => handleRnChange(index, e)} className={inputClass}>
                                    <option value="ninguna">Ninguna</option>
                                    <option value="basica">Básica</option>
                                    <option value="avanzada">Avanzada</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass}>Alimentación Alta</label>
                                <select name="alimentacion_alta" value={rn.alimentacion_alta} onChange={(e) => handleRnChange(index, e)} className={inputClass}>
                                    <option value="LME">Lactancia Materna Excl.</option>
                                    <option value="LMixta">Mixta</option>
                                    <option value="Formula">Fórmula</option>
                                </select>
                            </div>
                        </div>

                        {/* Checkboxes del Bebé */}
                        <div className="mt-4 flex flex-wrap gap-4 text-sm pt-2 border-t border-gray-50 dark:border-gray-700/50">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="profilaxis_ocular" checked={rn.profilaxis_ocular} onChange={(e) => handleRnChange(index, e)} className={checkboxClass} />
                                <span className="text-gray-700 dark:text-gray-300">Profilaxis Ocular</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="vacuna_hepatitis_b" checked={rn.vacuna_hepatitis_b} onChange={(e) => handleRnChange(index, e)} className={checkboxClass} />
                                <span className="text-gray-700 dark:text-gray-300">Vacuna Hep B</span>
                            </label>
                            <div className="flex-grow"></div>
                            <label className="flex items-center gap-2 cursor-pointer bg-red-50 dark:bg-red-900/10 px-3 py-1 rounded-md border border-red-100 dark:border-red-900/30">
                                <input type="checkbox" name="anomalia_congenita" checked={rn.anomalia_congenita} onChange={(e) => handleRnChange(index, e)} className="h-4 w-4 rounded border-red-300 text-red-500 focus:ring-red-500" />
                                <span className="text-red-700 dark:text-red-400 font-medium">Anomalía Congénita</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Botones de Acción Global */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 -mx-4 -mb-4 rounded-b-lg">
          {error && <div className="text-red-600 text-sm font-bold bg-red-100 px-3 py-2 rounded-lg border border-red-200">{error}</div>}
          {success && <div className="text-green-600 text-sm font-bold bg-green-100 px-3 py-2 rounded-lg border border-green-200">{success}</div>}
          
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors font-medium" 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="bg-accent-mint hover:bg-accent-mint-hover text-white px-8 py-2 rounded-lg font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : `Guardar Registro (${recienNacidos.length} RN)`}
          </button>
        </div>
      </form>

      {/* Calculadora Modal */}
      <ApgarCalculator
        isOpen={apgarConfig.show}
        onClose={() => setApgarConfig({ ...apgarConfig, show: false })}
        onCalculate={handleApgarResult}
        title={`RN #${(apgarConfig.index || 0) + 1} - ${apgarConfig.field === 'apgar_1_min' ? 'Minuto 1' : 'Minuto 5'}`}
      />
    </div>
  );
}