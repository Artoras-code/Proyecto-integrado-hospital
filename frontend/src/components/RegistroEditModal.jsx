import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export default function RegistroEditModal({ isOpen, onClose, onSaveSuccess, registroToEdit, parametros }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // --- Estados para los datos del formulario ---
  const [madre, setMadre] = useState({});
  const [parto, setParto] = useState({});
  const [rn, setRn] = useState({}); // Asumimos 1 RN por ahora

  // --- 1. Llenar el formulario cuando se abre el modal --- (Sin cambios)
  useEffect(() => {
    if (registroToEdit) {
      // Seteamos los datos de la madre
      setMadre(registroToEdit.madre || {});

      // Seteamos los datos del Recién Nacido (tomamos el primero)
      setRn(registroToEdit.recien_nacidos?.[0] || {});

      // Seteamos los datos del Parto, extrayendo los IDs de los objetos
      setParto({
        id: registroToEdit.id,
        fecha_parto: registroToEdit.fecha_parto?.slice(0, 16), // Formato para datetime-local
        edad_gestacional_semanas: registroToEdit.edad_gestacional_semanas || '',
        personal_atiende: registroToEdit.personal_atiende || '',
        uso_oxitocina: registroToEdit.uso_oxitocina || false,
        ligadura_tardia_cordon: registroToEdit.ligadura_tardia_cordon || false,
        contacto_piel_a_piel: registroToEdit.contacto_piel_a_piel || false,
        
        // Mapeamos los objetos a sus IDs para los <select>
        tipo_parto: registroToEdit.tipo_parto?.id || '',
        tipo_analgesia: registroToEdit.tipo_analgesia?.id || '',
        complicaciones: registroToEdit.complicaciones?.map(c => c.id) || [],
      });
      
      setError('');
    }
  }, [registroToEdit]); // Se re-ejecuta si el registro a editar cambia

  // --- 2. Manejadores de cambios (sin cambios) ---
  
  const handleMadreChange = (e) => {
    const { name, value } = e.target;
    setMadre(prev => ({ ...prev, [name]: value }));
  };

  const handlePartoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParto(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleComplicacionesChange = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => option.value);
    setParto(prev => ({ ...prev, complicaciones: values }));
  };

  const handleRnChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRn(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // --- 3. Lógica de Envío (sin cambios) ---
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // --- PASO 1: Actualizar la Madre ---
      await apiClient.put(`/dashboard/api/madres/${madre.id}/`, madre);

      // --- PASO 2: Actualizar el Registro de Parto ---
      const partoData = {
        ...parto,
        madre: madre.id,
        registrado_por: registroToEdit.registrado_por, // Mantenemos el usuario original
      };
      await apiClient.put(`/dashboard/api/registros-parto/${parto.id}/`, partoData);

      // --- PASO 3: Actualizar el Recién Nacido ---
      if (rn.id) {
        await apiClient.put(`/dashboard/api/recien-nacidos/${rn.id}/`, {
          ...rn,
          parto_asociado: parto.id,
        });
      }
      
      // --- Éxito ---
      setLoading(false);
      onSaveSuccess(); // Llama a la función del padre para refrescar y cerrar
      onClose();

    } catch (err) {
      setLoading(false);
      setError('Error al actualizar el registro. ' + (err.response?.data?.detail || err.message));
      console.error(err.response?.data || err);
    }
  };

  // --- 4. REFACTOR: Estilos de Clases Comunes ---
  const labelClass = "block text-sm font-medium text-secondary";
  const inputClass = "mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const checkboxClass = "h-4 w-4 rounded border-border bg-background text-indigo-600 focus:ring-indigo-500";

  if (!isOpen) return null;

  return (
    // Fondo oscuro semi-transparente
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      
      {/* 5. REFACTOR: Contenedor del Modal (bg-gray-800 -> bg-surface) */}
      <div className="w-full max-w-4xl rounded-lg bg-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* 6. REFACTOR: Título (text-white -> text-primary) */}
          <h1 className="text-2xl font-bold text-primary">
            Editar Registro de Parto (ID: {registroToEdit.id})
          </h1>

          {/* 7. REFACTOR: Secciones (bg-gray-900 -> bg-background) */}
          <div className="bg-background p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-primary mb-4">1. Datos de la Madre</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="rut_edit" className={labelClass}>RUT</label>
                <input type="text" name="rut" id="rut_edit" value={madre.rut || ''} onChange={handleMadreChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="nombre_edit" className={labelClass}>Nombre Completo</label>
                <input type="text" name="nombre" id="nombre_edit" value={madre.nombre || ''} onChange={handleMadreChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="fecha_nacimiento_edit" className={labelClass}>Fecha Nacimiento Madre</label>
                <input type="date" name="fecha_nacimiento" id="fecha_nacimiento_edit" value={madre.fecha_nacimiento || ''} onChange={handleMadreChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="telefono_edit" className={labelClass}>Teléfono</label>
                <input type="tel" name="telefono" id="telefono_edit" value={madre.telefono || ''} onChange={handleMadreChange} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="direccion_edit" className={labelClass}>Dirección</label>
                <input type="text" name="direccion" id="direccion_edit" value={madre.direccion || ''} onChange={handleMadreChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* --- SECCIÓN 2: DATOS DEL PARTO --- */}
          <div className="bg-background p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-primary mb-4">2. Datos del Parto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="fecha_parto_edit" className={labelClass}>Fecha y Hora del Parto</label>
                <input type="datetime-local" name="fecha_parto" id="fecha_parto_edit" value={parto.fecha_parto || ''} onChange={handlePartoChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="edad_gestacional_semanas_edit" className={labelClass}>Edad Gestacional (Semanas)</label>
                <input type="number" name="edad_gestacional_semanas" id="edad_gestacional_semanas_edit" value={parto.edad_gestacional_semanas || ''} onChange={handlePartoChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="tipo_parto_edit" className={labelClass}>Tipo de Parto</label>
                <select name="tipo_parto" id="tipo_parto_edit" value={parto.tipo_parto || ''} onChange={handlePartoChange} className={inputClass} required>
                  <option value="">Seleccione...</option>
                  {parametros.tiposParto.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="tipo_analgesia_edit" className={labelClass}>Tipo de Analgesia</label>
                <select name="tipo_analgesia" id="tipo_analgesia_edit" value={parto.tipo_analgesia || ''} onChange={handlePartoChange} className={inputClass}>
                  <option value="">Seleccione...</option>
                  {parametros.tiposAnalgesia.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="complicaciones_edit" className={labelClass}>Complicaciones (múltiple)</label>
                <select multiple name="complicaciones" id="complicaciones_edit" value={parto.complicaciones || []} onChange={handleComplicacionesChange} className={inputClass} size="4">
                  {parametros.complicaciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="flex items-center gap-x-2">
                <input id="uso_oxitocina_edit" name="uso_oxitocina" type="checkbox" checked={parto.uso_oxitocina || false} onChange={handlePartoChange} className={checkboxClass} />
                <label htmlFor="uso_oxitocina_edit" className={labelClass}>Uso Oxitocina</label>
              </div>
              <div className="flex items-center gap-x-2">
                <input id="ligadura_tardia_cordon_edit" name="ligadura_tardia_cordon" type="checkbox" checked={parto.ligadura_tardia_cordon || false} onChange={handlePartoChange} className={checkboxClass} />
                <label htmlFor="ligadura_tardia_cordon_edit" className={labelClass}>Ligadura Tardía</label>
              </div>
              <div className="flex items-center gap-x-2">
                <input id="contacto_piel_a_piel_edit" name="contacto_piel_a_piel" type="checkbox" checked={parto.contacto_piel_a_piel || false} onChange={handlePartoChange} className={checkboxClass} />
                <label htmlFor="contacto_piel_a_piel_edit" className={labelClass}>Piel a Piel</label>
              </div>
            </div>
          </div>
          
          {/* --- SECCIÓN 3: DATOS DEL RECIÉN NACIDO --- */}
          <div className="bg-background p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-primary mb-4">3. Datos del Recién Nacido (RN 1)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="sexo_edit" className={labelClass}>Sexo</label>
                <select name="sexo" id="sexo_edit" value={rn.sexo || 'I'} onChange={handleRnChange} className={inputClass} required>
                  <option value="I">Indeterminado</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                </select>
              </div>
              <div>
                <label htmlFor="peso_grs_edit" className={labelClass}>Peso (gramos)</label>
                <input type="number" name="peso_grs" id="peso_grs_edit" value={rn.peso_grs || ''} onChange={handleRnChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="talla_cm_edit" className={labelClass}>Talla (cm)</label>
                <input type="number" step="0.1" name="talla_cm" id="talla_cm_edit" value={rn.talla_cm || ''} onChange={handleRnChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="apgar_1_min_edit" className={labelClass}>APGAR (1 min)</label>
                <input type="number" name="apgar_1_min" id="apgar_1_min_edit" value={rn.apgar_1_min || ''} onChange={handleRnChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="apgar_5_min_edit" className={labelClass}>APGAR (5 min)</label>
                <input type="number" name="apgar_5_min" id="apgar_5_min_edit" value={rn.apgar_5_min || ''} onChange={handleRnChange} className={inputClass} required />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-x-2">
                <input id="profilaxis_ocular_edit" name="profilaxis_ocular" type="checkbox" checked={rn.profilaxis_ocular || false} onChange={handleRnChange} className={checkboxClass} />
                <label htmlFor="profilaxis_ocular_edit" className={labelClass}>Profilaxis Ocular</label>
              </div>
              <div className="flex items-center gap-x-2">
                <input id="vacuna_hepatitis_b_edit" name="vacuna_hepatitis_b" type="checkbox" checked={rn.vacuna_hepatitis_b || false} onChange={handleRnChange} className={checkboxClass} />
                <label htmlFor="vacuna_hepatitis_b_edit" className={labelClass}>Vacuna Hepatitis B</label>
              </div>
            </div>
          </div>

          {/* 8. REFACTOR: Barra de botones (bg-gray-800 -> bg-surface) */}
          <div className="sticky bottom-0 bg-surface p-4 -m-6 mt-8 flex justify-end items-center gap-4">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            
            {/* 9. REFACTOR: Botón Cancelar */}
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Actualizando...' : 'Actualizar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}