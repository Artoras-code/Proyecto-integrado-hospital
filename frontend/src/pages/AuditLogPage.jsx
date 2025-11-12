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
      {/* 1. REFACTOR: text-white -> text-primary */}
      <h1 className="text-3xl font-bold text-primary">Registros de Auditoría</h1>

      {/* Pestañas (Tabs) */}
      <div className="mt-6">
        <div className="sm:hidden">
          {/* 2. REFACTOR: Select para móviles */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-border bg-surface text-primary focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => setActiveTab(e.target.value)}
            value={activeTab}
          >
            <option value="sesiones">Historial de Sesiones</option>
            <option value="acciones">Historial de Acciones</option>
          </select>
        </div>
        <div className="hidden sm:block">
          {/* 3. REFACTOR: Pestañas para desktop */}
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('sesiones')}
              className={classNames(
                activeTab === 'sesiones'
                  ? 'bg-gray-800 text-white' // (Acento se mantiene)
                  // Refactor:
                  : 'text-secondary hover:text-primary hover:bg-border',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              Historial de Sesiones
            </button>
            <button
              onClick={() => setActiveTab('acciones')}
              className={classNames(
                activeTab === 'acciones'
                  ? 'bg-gray-800 text-white' // (Acento se mantiene)
                  // Refactor:
                  : 'text-secondary hover:text-primary hover:bg-border',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              Historial de Acciones
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de la Pestaña (Los componentes hijos se actualizan después) */}
      <div className="mt-4">
        {activeTab === 'sesiones' ? <SessionLog /> : <ActionLog />}
      </div>
    </div>
  );
}