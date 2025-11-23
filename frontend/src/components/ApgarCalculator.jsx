import React, { useState, useEffect } from 'react';

export default function ApgarCalculator({ isOpen, onClose, onCalculate, title }) {
  const [scores, setScores] = useState({
    apariencia: 0,
    pulso: 0,
    gestos: 0,
    actividad: 0,
    respiracion: 0
  });

  const [total, setTotal] = useState(0);


  useEffect(() => {
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    setTotal(sum);
  }, [scores]);

  if (!isOpen) return null;

  const handleChange = (criterio, valor) => {
    setScores(prev => ({ ...prev, [criterio]: parseInt(valor) }));
  };

  const handleSave = () => {
    onCalculate(total); 
    onClose(); 
  };


  const labelClass = "block text-sm font-medium text-primary mb-1";
  const selectClass = "block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-accent-mint focus:ring-accent-mint text-sm p-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface rounded-xl shadow-2xl overflow-hidden border border-border">
        <div className="bg-accent-mint p-4">
          <h3 className="text-lg font-bold text-white">Calculadora APGAR - {title}</h3>
        </div>
        

        <div className="p-6 space-y-4">
          <div>
            <label className={labelClass}>1. Apariencia (Color de piel)</label>
            <select className={selectClass} onChange={(e) => handleChange('apariencia', e.target.value)} value={scores.apariencia}>
              <option value="0">0 - Azulado o pálido por completo (Cianosis)</option>
              <option value="1">1 - Cuerpo rosado, extremidades azules (Acrocianosis)</option>
              <option value="2">2 - Completamente rosado</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>2. Pulso (Frecuencia Cardíaca)</label>
            <select className={selectClass} onChange={(e) => handleChange('pulso', e.target.value)} value={scores.pulso}>
              <option value="0">0 - Ausente (Sin latidos)</option>
              <option value="1">1 - Menos de 100 latidos/min</option>
              <option value="2">2 - Más de 100 latidos/min</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>3. Gestos (Irritabilidad Refleja)</label>
            <select className={selectClass} onChange={(e) => handleChange('gestos', e.target.value)} value={scores.gestos}>
              <option value="0">0 - Sin respuesta</option>
              <option value="1">1 - Muecas débiles</option>
              <option value="2">2 - Llanto vigoroso, tos o estornudo</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>4. Actividad (Tono Muscular)</label>
            <select className={selectClass} onChange={(e) => handleChange('actividad', e.target.value)} value={scores.actividad}>
              <option value="0">0 - Flácido / Sin tono</option>
              <option value="1">1 - Cierta flexión de extremidades</option>
              <option value="2">2 - Movimiento activo / Buena flexión</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>5. Respiración (Esfuerzo)</label>
            <select className={selectClass} onChange={(e) => handleChange('respiracion', e.target.value)} value={scores.respiracion}>
              <option value="0">0 - Ausente</option>
              <option value="1">1 - Lenta, irregular, llanto débil</option>
              <option value="2">2 - Buena, llanto fuerte</option>
            </select>
          </div>

          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center border border-gray-200 dark:border-gray-600">
            <span className="text-xs font-bold text-secondary uppercase tracking-wide">Puntaje Total</span>
            <div className={`text-5xl font-extrabold mt-1 ${total >= 7 ? 'text-green-500' : total >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
              {total} / 10
            </div>
            <p className="text-xs text-secondary mt-1">
              {total >= 7 ? 'Normal' : total >= 4 ? 'Depresión Moderada' : 'Depresión Severa'}
            </p>
          </div>

        </div>
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex justify-end gap-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-accent-mint px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-accent-mint-hover transition-colors"
          >
            Usar Puntaje
          </button>
        </div>
      </div>
    </div>
  );
}