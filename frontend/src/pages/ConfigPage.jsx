import React from 'react';
import { CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function ConfigPage() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary">Configuración del Sistema</h1>
      <p className="mt-4 text-secondary">
        Esta sección está reservada para configuraciones globales del sistema
        que solo el administrador ({user?.username}) puede gestionar.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg bg-surface shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CogIcon className="h-6 w-6 text-secondary" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-secondary">Modo Mantenimiento</dt>
                  <dd className="text-lg font-semibold tracking-tight text-primary">Desactivado</dd>
                </dl>
              </div>
            </div>
            <div className="mt-6 text-sm text-secondary">
              (Aquí podrías poner un interruptor para desactivar el sitio temporalmente)
            </div>
          </div>
        </div>
        

        <div className="rounded-lg bg-surface shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-secondary" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-secondary">Estado del Sistema</dt>
                  <dd className="text-lg font-semibold tracking-tight text-green-400">Operacional</dd>
                </dl>
              </div>
            </div>
            <div className="mt-6 text-sm text-secondary">
              (Aquí podrías mostrar el estado de la API o la base de datos)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}