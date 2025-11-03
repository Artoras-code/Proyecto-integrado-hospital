import React, { useState } from 'react';
import SessionLog from '../components/SessionLog';
import ActionLog from '../components/ActionLog';

// Función para clases de Tailwind
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AuditLogPage() {
  const [activeTab, setActiveTab] = useState('sesiones'); // 'sesiones' o 'acciones'

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Registros de Auditoría</h1>

      {/* Pestañas (Tabs) */}
      <div className="mt-6">
        <div className="sm:hidden">
          {/* Select para móviles (opcional pero bueno para responsive) */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-700 bg-gray-900 text-white focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => setActiveTab(e.target.value)}
            value={activeTab}
          >
            <option value="sesiones">Historial de Sesiones</option>
            <option value="acciones">Historial de Acciones</option>
          </select>
        </div>
        <div className="hidden sm:block">
          {/* Pestañas para desktop */}
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('sesiones')}
              className={classNames(
                activeTab === 'sesiones'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              Historial de Sesiones
            </button>
            <button
              onClick={() => setActiveTab('acciones')}
              className={classNames(
                activeTab === 'acciones'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              Historial de Acciones
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de la Pestaña */}
      <div className="mt-4">
        {activeTab === 'sesiones' ? <SessionLog /> : <ActionLog />}
      </div>
    </div>
  );
}