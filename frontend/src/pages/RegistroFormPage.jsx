import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

export default function RegistroFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Estados para los datos del formulario ---
  const [madre, setMadre] = useState({
    rut: '',
    nombre: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
  });
  
  const [parto, setParto] = useState({
    fecha_parto: '',
    edad_gestacional_semanas: '',
    tipo_parto: '',
    tipo_analgesia: '',
    complicaciones: [], // Para el select múltiple
    uso_oxitocina: false,
    ligadura_tardia_cordon: false,
    contacto_piel_a_piel: false,
  });

  const [rn, setRn] = useState({
    sexo: 'I', // 'M', 'F', 'I' (Indeterminado por defecto)
    peso_grs: '',
    talla_cm: '',
    apgar_1_min: '',
    apgar_5_min: '',
    profilaxis_ocular: true, // Por defecto marcados
    vacuna_hepatitis_b: true, // Por defecto marcados
  });

  // --- Estado para los parámetros (listas desplegables) ---
  const [parametros, setParametros] = useState({
    tiposParto: [],
    tiposAnalgesia: [],
    complicaciones: [],
  });

  // --- Cargar los parámetros de la API al montar el componente ---
  useEffect(() => {
    const fetchParametros = async () => {
      try {
        // Esta llamada ahora SÍ FUNCIONARÁ para el rol Clínico (solo lectura)
        const [resParto, resAnalgesia, resComplicaciones] = await Promise.all([
          apiClient.get('/dashboard/api/parametros/tipos-parto/'),
          apiClient.get('/dashboard/api/parametros/tipos-analgesia/'),
          apiClient.get('/dashboard/api/parametros/complicaciones-parto/'),
        ]);
        
        setParametros({
          tiposParto: resParto.data.filter(p => p.activo),
          tiposAnalgesia: resAnalgesia.data.filter(p => p.activo),
          complicaciones: resComplicaciones.data.filter(p => p.activo),
        });
      } catch (err) {
        // Si falla, mostramos el error
        setError('Error al cargar los parámetros del formulario.');
        console.error(err);
      }
    };
    fetchParametros();
  }, []);

  // --- Manejadores de cambios (CORREGIDOS - SIN DUPLICADOS) ---
  
  const handleMadreChange = (e) => {
    const { name, value } = e.target;
    setMadre(prev => ({ ...prev, [name]: value }));
  };

  const handlePartoChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setParto(prev => ({ ...prev, [name]: checked }));
    } else {
      setParto(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleComplicacionesChange = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => option.value);
    setParto(prev => ({ ...prev, complicaciones: values }));
  };

  const handleRnChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRn(prev => ({ ...prev, [name]: checked }));
    } else {
      setRn(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Lógica de Envío (CORREGIDA - SIN DUPLICADOS) ---
  
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

    // --- ¡AQUÍ LA LÓGICA DE ROLES! ---
    const isSupervisor = user.rol === 'supervisor';
    
    try {
      // --- PASO 1: Crear la Madre (Ahora el clínico SÍ PUEDE) ---
      const resMadre = await apiClient.post('/dashboard/api/madres/', madre);
      const madreId = resMadre.data.id;

      // --- PASO 2: Crear el Registro de Parto ---
      const partoData = {
        ...parto,
        madre: madreId,
        // 'registrado_por' se asignará de forma diferente según el rol
      };
      
      // El Supervisor usa la API general, el Clínico usa la API "mis-registros"
      const partoApiUrl = isSupervisor 
        ? '/dashboard/api/registros-parto/' 
        : '/dashboard/api/mis-registros/';
        
      if (isSupervisor) {
        // El Supervisor debe asignar manualmente quién lo registra
        partoData.registrado_por = user.id; 
      }
      // Si es Clínico, el backend (MisRegistrosViewSet) lo asignará automáticamente.
      
      const resParto = await apiClient.post(partoApiUrl, partoData);
      const partoId = resParto.data.id;

      // --- PASO 3: Crear el Recién Nacido (Ahora el clínico SÍ PUEDE) ---
      const rnData = {
        ...rn,
        parto_asociado: partoId,
      };
      await apiClient.post('/dashboard/api/recien-nacidos/', rnData);
      
      // --- Éxito ---
      setLoading(false);
      setSuccess('Registro creado exitosamente.');
      
      // Limpiar formulario
      setMadre({ rut: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: '' });
      setParto({ fecha_parto: '', edad_gestacional_semanas: '', tipo_parto: '', tipo_analgesia: '', complicaciones: [], uso_oxitocina: false, ligadura_tardia_cordon: false, contacto_piel_a_piel: false });
      setRn({ sexo: 'I', peso_grs: '', talla_cm: '', apgar_1_min: '', apgar_5_min: '', profilaxis_ocular: true, vacuna_hepatitis_b: true });
      
      // Redirigir (a la página anterior) después de 2 segundos
      setTimeout(() => {
        navigate(-1); // Volver a la página anterior (p.ej. /clinico/mis-registros)
      }, 2000);

    } catch (err) {
      setLoading(false);
      setError('Error al guardar el registro. Revise los campos. ' + (err.response?.data?.detail || err.message));
      console.error(err.response?.data || err);
    }
  };

  // --- 1. REFACTOR: Estilos de Clases Comunes ---
  const labelClass = "block text-sm font-medium text-secondary";
  const inputClass = "mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const checkboxClass = "h-4 w-4 rounded border-border bg-background text-indigo-600 focus:ring-indigo-500";

  return (
    <div>
      {/* 2. REFACTOR: Título */}
      <h1 className="text-3xl font-bold text-primary">Ingresar Nuevo Registro de Parto</h1>
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        
        {/* --- SECCIÓN 1: DATOS DE LA MADRE --- */}
        {/* 3. REFACTOR: Fondo de la sección */}
        <div className="bg-surface p-6 rounded-lg shadow">
          {/* 4. REFACTOR: Título de sección */}
          <h2 className="text-xl font-semibold text-primary mb-4">1. Datos de la Madre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rut" className={labelClass}>RUT</label>
              <input type="text" name="rut" id="rut" value={madre.rut} onChange={handleMadreChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="nombre" className={labelClass}>Nombre Completo</label>
              <input type="text" name="nombre" id="nombre" value={madre.nombre} onChange={handleMadreChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="fecha_nacimiento" className={labelClass}>Fecha Nacimiento Madre</label>
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

        {/* --- SECCIÓN 2: DATOS DEL PARTO --- */}
        <div className="bg-surface p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary mb-4">2. Datos del Parto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="fecha_parto" className={labelClass}>Fecha y Hora del Parto</label>
              <input type="datetime-local" name="fecha_parto" id="fecha_parto" value={parto.fecha_parto} onChange={handlePartoChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="edad_gestacional_semanas" className={labelClass}>Edad Gestacional (Semanas)</label>
              <input type="number" name="edad_gestacional_semanas" id="edad_gestacional_semanas" value={parto.edad_gestacional_semanas} onChange={handlePartoChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="tipo_parto" className={labelClass}>Tipo de Parto</label>
              <select name="tipo_parto" id="tipo_parto" value={parto.tipo_parto} onChange={handlePartoChange} className={inputClass} required>
                <option value="">Seleccione...</option>
                {parametros.tiposParto.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tipo_analgesia" className={labelClass}>Tipo de Analgesia</label>
              <select name="tipo_analgesia" id="tipo_analgesia" value={parto.tipo_analgesia} onChange={handlePartoChange} className={inputClass}>
                <option value="">Seleccione...</option>
                {parametros.tiposAnalgesia.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="complicaciones" className={labelClass}>Complicaciones (múltiple)</label>
              <select 
                multiple 
                name="complicaciones" 
                id="complicaciones" 
                value={parto.complicaciones} 
                onChange={handleComplicacionesChange} 
                className={inputClass} 
                size="4"
              >
                {parametros.complicaciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="flex items-center gap-x-2">
              <input id="uso_oxitocina" name="uso_oxitocina" type="checkbox" checked={parto.uso_oxitocina} onChange={handlePartoChange} className={checkboxClass} />
              <label htmlFor="uso_oxitocina" className={labelClass}>Uso Oxitocina</label>
            </div>
            <div className="flex items-center gap-x-2">
              <input id="ligadura_tardia_cordon" name="ligadura_tardia_cordon" type="checkbox" checked={parto.ligadura_tardia_cordon} onChange={handlePartoChange} className={checkboxClass} />
              <label htmlFor="ligadura_tardia_cordon" className={labelClass}>Ligadura Tardía</label>
            </div>
            <div className="flex items-center gap-x-2">
              <input id="contacto_piel_a_piel" name="contacto_piel_a_piel" type="checkbox" checked={parto.contacto_piel_a_piel} onChange={handlePartoChange} className={checkboxClass} />
              <label htmlFor="contacto_piel_a_piel" className={labelClass}>Piel a Piel</label>
            </div>
          </div>
        </div>
        
        {/* --- SECCIÓN 3: DATOS DEL RECIÉN NACIDO --- */}
        <div className="bg-surface p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary mb-4">3. Datos del Recién Nacido</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="sexo" className={labelClass}>Sexo</label>
              <select name="sexo" id="sexo" value={rn.sexo} onChange={handleRnChange} className={inputClass} required>
                <option value="I">Indeterminado</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div>
              <label htmlFor="peso_grs" className={labelClass}>Peso (gramos)</label>
              <input type="number" name="peso_grs" id="peso_grs" value={rn.peso_grs} onChange={handleRnChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="talla_cm" className={labelClass}>Talla (cm)</label>
              <input type="number" step="0.1" name="talla_cm" id="talla_cm" value={rn.talla_cm} onChange={handleRnChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="apgar_1_min" className={labelClass}>APGAR (1 min)</label>
              <input type="number" name="apgar_1_min" id="apgar_1_min" value={rn.apgar_1_min} onChange={handleRnChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="apgar_5_min" className={labelClass}>APGAR (5 min)</label>
              <input type="number" name="apgar_5_min" id="apgar_5_min" value={rn.apgar_5_min} onChange={handleRnChange} className={inputClass} required />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="flex items-center gap-x-2">
              <input id="profilaxis_ocular" name="profilaxis_ocular" type="checkbox" checked={rn.profilaxis_ocular} onChange={handleRnChange} className={checkboxClass} />
              <label htmlFor="profilaxis_ocular" className={labelClass}>Profilaxis Ocular</label>
            </div>
            <div className="flex items-center gap-x-2">
              <input id="vacuna_hepatitis_b" name="vacuna_hepatitis_b" type="checkbox" checked={rn.vacuna_hepatitis_b} onChange={handleRnChange} className={checkboxClass} />
              <label htmlFor="vacuna_hepatitis_b" className={labelClass}>Vacuna Hepatitis B</label>
            </div>
          </div>
        </div>

        {/* --- BOTONES DE ACCIÓN (ACTUALIZADOS) --- */}
        <div className="flex justify-end items-center gap-4">
          {error && <div className="text-red-400 text-sm font-medium">{error}</div>}
          {success && <div className="text-green-400 text-sm font-medium">{success}</div>}
          
          {/* 5. REFACTOR: Botón Cancelar */}
          <button
            type="button"
            onClick={() => navigate(-1)} // <-- ¡CORREGIDO! Vuelve a la página anterior
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-secondary hover:bg-border"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}