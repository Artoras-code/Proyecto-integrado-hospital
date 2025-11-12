import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';


const PARAMETROS_FIJOS = {
  tiposParto: [
    { id: 1, nombre: "Parto Eutócico (Normal)" },
    { id: 2, nombre: "Cesárea" },
    { id: 3, nombre: "Fórceps" },
    { id: 4, nombre: "Vaccum" },
  ],
  tiposAnalgesia: [
    { id: 1, nombre: "Epidural" },
    { id: 2, nombre: "Raquídea" },
    { id: 3, nombre: "General" },
    { id: 4, nombre: "Local" },
    { id: 5, nombre: "Sin Analgesia" },
  ],
};


export default function RegistroFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


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
    complicaciones_texto: '',
    uso_oxitocina: false,
    ligadura_tardia_cordon: false,
    contacto_piel_a_piel: false,
  });

  const [rn, setRn] = useState({
    sexo: 'I',
    peso_grs: '',
    talla_cm: '',
    apgar_1_min: '',
    apgar_5_min: '',
    profilaxis_ocular: true,
    vacuna_hepatitis_b: true,
  });


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
  
  const handleRnChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRn(prev => ({ ...prev, [name]: checked }));
    } else {
      setRn(prev => ({ ...prev, [name]: value }));
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
    
    try {
      const resMadre = await apiClient.post('/dashboard/api/madres/', madre);
      const madreId = resMadre.data.id;


      const partoData = {
        ...parto,
        madre: madreId,
        tipo_parto: parto.tipo_parto || null,
        tipo_analgesia: parto.tipo_analgesia || null,
      };
  
      
      const partoApiUrl = isSupervisor 
        ? '/dashboard/api/registros-parto/' 
        : '/dashboard/api/mis-registros/';
        
      if (isSupervisor) {
        partoData.registrado_por = user.id; 
      }
      
      const resParto = await apiClient.post(partoApiUrl, partoData);
      const partoId = resParto.data.id;

      const rnData = {
        ...rn,
        parto_asociado: partoId,
      };
      await apiClient.post('/dashboard/api/recien-nacidos/', rnData);
      
      setLoading(false);
      setSuccess('Registro creado exitosamente.');
      

      setMadre({ rut: '', nombre: '', fecha_nacimiento: '', telefono: '', direccion: '' });
      setParto({ 
        fecha_parto: '', 
        edad_gestacional_semanas: '', 
        tipo_parto: '', 
        tipo_analgesia: '', 
        complicaciones_texto: '',
        uso_oxitocina: false, 
        ligadura_tardia_cordon: false, 
        contacto_piel_a_piel: false 
      });
      setRn({ sexo: 'I', peso_grs: '', talla_cm: '', apgar_1_min: '', apgar_5_min: '', profilaxis_ocular: true, vacuna_hepatitis_b: true });
      
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (err) {
      setLoading(false);

      setError('Error al guardar el registro. Revise los campos. ' + (err.response?.data?.detail || err.message));
      console.error(err.response?.data || err);
      

      if (madreId) {
        try {
          await apiClient.delete(`/dashboard/api/madres/${madreId}/`);
          console.log("Madre huérfana eliminada (ID:", madreId, ")");
        } catch (deleteErr) {
          console.error("Error al eliminar madre huérfana:", deleteErr);
        }
      }
    }
  };



  const labelClass = "block text-sm font-medium text-secondary";
  const inputClass = "mt-1 block w-full rounded-md border-border bg-surface text-primary shadow-sm focus:border-accent-mint focus:ring-accent-mint";
  const checkboxClass = "h-4 w-4 rounded border-border bg-surface text-accent-mint focus:ring-accent-mint";
  const cardClass = "bg-surface p-6 rounded-2xl shadow-lg border border-border";

  return (
    <div className="space-y-6">
      <h1 className="text-4xl lg:text-5xl font-extrabold text-accent-mint uppercase leading-tight tracking-tighter">
        Ingresar Nuevo Registro
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        

        <div className={cardClass}>
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


        <div className={cardClass}>
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
                {PARAMETROS_FIJOS.tiposParto.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tipo_analgesia" className={labelClass}>Tipo de Analgesia</label>
              <select name="tipo_analgesia" id="tipo_analgesia" value={parto.tipo_analgesia} onChange={handlePartoChange} className={inputClass}>
                <option value="">Seleccione...</option>
                {PARAMETROS_FIJOS.tiposAnalgesia.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="complicaciones_texto" className={labelClass}>Complicaciones (descripción)</label>
              <textarea
                name="complicaciones_texto"
                id="complicaciones_texto"
                value={parto.complicaciones_texto}
                onChange={handlePartoChange}
                className={inputClass}
                rows="4"
                placeholder="Describa sangrados, desgarros, u otras complicaciones..."
              ></textarea>
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
        

        <div className={cardClass}>
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


        <div className="flex justify-end items-center gap-4 pt-4">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          {success && <div className="text-green-500 text-sm font-medium">{success}</div>}
          
          <button
            type="button"
            onClick={() => navigate(-1)} 
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg border border-transparent bg-accent-mint px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-mint-hover disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}