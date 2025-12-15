import React, { useState } from 'react';
import ParameterManager from '../components/ParameterManager'; 


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}


const tabs = [
  { name: 'Tipos de Parto', key: 'parto', apiUrl: '/dashboard/api/parametros/tipos-parto/' },
  { name: 'Tipos de Analgesia', key: 'analgesia', apiUrl: '/dashboard/api/parametros/tipos-analgesia/' },
  { name: 'Complicaciones', key: 'complicacion', apiUrl: '/dashboard/api/parametros/complicaciones-parto/' },
];

export default function ParametersPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const currentTab = tabs.find(tab => tab.key === activeTab);

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary">Parámetros del Sistema</h1>
      <p className="mt-2 text-sm text-secondary">
        Administra las opciones de las listas desplegables que se usan en los formularios.
      </p>


      <div className="mt-6">
        <div className="sm:hidden">
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
                    ? 'bg-gray-800 text-white' 
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

      <div className="mt-8">
        {currentTab && (
          <ParameterManager 
            key={currentTab.key}
            title={currentTab.name}
            apiUrl={currentTab.apiUrl}
          />
        )}
      </div>
    </div>
  );
}