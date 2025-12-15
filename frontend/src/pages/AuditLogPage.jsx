import React, { useState } from 'react';
import SessionLog from '../components/SessionLog';
import ActionLog from '../components/ActionLog';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AuditLogPage() {
  const [activeTab, setActiveTab] = useState('sesiones');

  return (
    <div className="bg-surface rounded-lg shadow-md">
      
      <div className="px-4 py-5 sm:px-6 border-b border-border">
        {/* ¡CORREGIDO! */}
        <h1 className="text-2xl font-bold text-primary">Registros de Auditoría</h1>
        
        <div className="mt-6">
          <div className="sm:hidden">
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-border bg-surface text-primary focus:border-accent-mint focus:ring-accent-mint"
              onChange={(e) => setActiveTab(e.target.value)}
              value={activeTab}
            >
              <option value="sesiones">Historial de Sesiones</option>
              <option value="acciones">Historial de Acciones</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('sesiones')}
                className={classNames(
                  activeTab === 'sesiones'
                    ? 'bg-accent-mint/10 text-accent-mint'
                    : 'text-secondary hover:text-primary',
                  'rounded-md px-3 py-2 text-sm font-medium'
                )}
              >
                Historial de Sesiones
              </button>
              <button
                onClick={() => setActiveTab('acciones')}
                className={classNames(
                  activeTab === 'acciones'
                    ? 'bg-accent-mint/10 text-accent-mint'
                    : 'text-secondary hover:text-primary',
                  'rounded-md px-3 py-2 text-sm font-medium'
                )}
              >
                Historial de Acciones
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'sesiones' ? <SessionLog /> : <ActionLog />}
      </div>
    </div>
  );
}