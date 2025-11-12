import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export default function RegistroEditModal({ isOpen, onClose, onSaveSuccess, registroToEdit, parametros }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [madre, setMadre] = useState({});
  const [parto, setParto] = useState({});
  const [rn, setRn] = useState({}); 


  useEffect(() => {
    if (registroToEdit) {
      setMadre(registroToEdit.madre || {});
      setRn(registroToEdit.recien_nacidos?.[0] || {});


      const tipoPartoObj = parametros.tiposParto.find(
        p => p.nombre === registroToEdit.tipo_parto
      );
      const tipoPartoId = tipoPartoObj ? tipoPartoObj.id : '';


      const tipoAnalgesiaObj = parametros.tiposAnalgesia.find(
        a => a.nombre === registroToEdit.tipo_analgesia
      );
      const tipoAnalgesiaId = tipoAnalgesiaObj ? tipoAnalgesiaObj.id : '';

 

      setParto({
        id: registroToEdit.id,
        fecha_parto: registroToEdit.fecha_parto?.slice(0, 16),
        edad_gestacional_semanas: registroToEdit.edad_gestacional_semanas || '',
        personal_atiende: registroToEdit.personal_atiende || '',
        uso_oxitocina: registroToEdit.uso_oxitocina || false,
        ligadura_tardia_cordon: registroToEdit.ligadura_tardia_cordon || false,
        contacto_piel_a_piel: registroToEdit.contacto_piel_a_piel || false, 
        

        tipo_parto: tipoPartoId,
        tipo_analgesia: tipoAnalgesiaId,
        
        complicaciones_texto: registroToEdit.complicaciones_texto || '', 
      });

      
      setError('');
    }
  }, [registroToEdit, parametros]); 

  
  const handleMadreChange = (e) => {
    const { name, value } = e.target;
    setMadre(prev => ({ ...prev, [name]: value }));
  };

  const handlePartoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParto(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  


  const handleRnChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRn(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {

      await apiClient.put(`/dashboard/api/madres/${madre.id}/`, madre);


      const partoData = {
        ...parto,
        madre: madre.id,
        registrado_por: registroToEdit.registrado_por, 
        tipo_parto: parto.tipo_parto || null, 
        tipo_analgesia: parto.tipo_analgesia || null, 
      };

      await apiClient.put(`/dashboard/api/registros-parto/${parto.id}/`, partoData);


      if (rn.id) {
        await apiClient.put(`/dashboard/api/recien-nacidos/${rn.id}/`, {
          ...rn,
          parto_asociado: parto.id,
        });
      }
      
      setLoading(false);
      onSaveSuccess(); 
      onClose(); 

    } catch (err) {
      setLoading(false);
      setError('Error al actualizar el registro. ' + (err.response?.data?.detail || err.message));
      console.error(err.response?.data || err);
    }
  };


  const labelClass = "block text-sm font-medium text-secondary";
  const inputClass = "mt-1 block w-full rounded-md border-border bg-surface text-primary shadow-sm focus:border-accent-mint focus:ring-accent-mint";
  const checkboxClass = "h-4 w-4 rounded border-border bg-surface text-accent-mint focus:ring-accent-mint";
  const sectionClass = "bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-inner";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-lg bg-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          <h1 className="text-2xl font-bold text-primary">
            Editar Registro de Parto (ID: {registroToEdit.id})
          </h1>


          <div className={sectionClass}>
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


          <div className={sectionClass}>
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
                <label htmlFor="complicaciones_texto_edit" className={labelClass}>Complicaciones (descripción)</label>
                <textarea
                  name="complicaciones_texto"
                  id="complicaciones_texto_edit"
                  value={parto.complicaciones_texto || ''}
                  onChange={handlePartoChange} 
                  className={inputClass}
                  rows="4"
                  placeholder="Describa sangrados, desgarros, u otras complicaciones..."
                ></textarea>
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
          
          <div className={sectionClass}>
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

          <div className="sticky bottom-0 bg-surface p-4 -m-6 mt-8 flex justify-end items-center gap-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Actualizando...' : 'Actualizar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}