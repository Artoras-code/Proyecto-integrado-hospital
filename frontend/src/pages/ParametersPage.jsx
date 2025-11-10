import React, { useState } from 'react';
import ParameterManager from '../components/ParameterManager'; // <-- Importar

// Función para clases de Tailwind
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Definir las pestañas
const tabs = [
  { name: 'Tipos de Parto', key: 'parto', apiUrl: '/dashboard/api/parametros/tipos-parto/' },
  { name: 'Tipos de Analgesia', key: 'analgesia', apiUrl: '/dashboard/api/parametros/tipos-analgesia/' },
  { name: 'Complicaciones', key: 'complicacion', apiUrl: '/dashboard/api/parametros/complicaciones-parto/' },
];

export default function ParametersPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].key); // 'parto' por defecto

  const currentTab = tabs.find(tab => tab.key === activeTab);

  return (
    <div>
      {/* 1. REFACTOR: text-white -> text-primary */}
      <h1 className="text-3xl font-bold text-primary">Parámetros del Sistema</h1>
      {/* 2. REFACTOR: text-gray-400 -> text-secondary */}
      <p className="mt-2 text-sm text-secondary">
        Administra las opciones de las listas desplegables que se usan en los formularios.
      </p>

      {/* 3. Pestañas (Tabs) */}
      <div className="mt-6">
        <div className="sm:hidden">
          {/* 4. REFACTOR: Select (border-gray-700 -> border-border, bg-gray-900 -> bg-surface, text-white -> text-primary) */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-border bg-surface text-primary focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => setActiveTab(e.target.value)}
            value={activeTab}
          >
            {tabs.map((tab) => (
              <option key={tab.key} value={tab.key}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.key)}
                className={classNames(
                  tab.key === activeTab
                    ? 'bg-gray-800 text-white' // (Acento se mantiene)
                    // 5. REFACTOR: text-gray-400 -> text-secondary, hover:text-white -> hover:text-primary, hover:bg-gray-800 -> hover:bg-border
                    : 'text-secondary hover:text-primary hover:bg-border',
                  'rounded-md px-3 py-2 text-sm font-medium'
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 4. Contenido de la Pestaña (El componente hijo se actualiza en el sig. paso) */}
      <div className="mt-8">
        {currentTab && (
          <ParameterManager 
            key={currentTab.key} // key es importante para que React recargue el componente
            title={currentTab.name}
            apiUrl={currentTab.apiUrl}
          />
        )}
      </div>
    </div>
  );
}