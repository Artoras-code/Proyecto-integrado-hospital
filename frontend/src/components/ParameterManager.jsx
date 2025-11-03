import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Un componente genérico para administrar (CRUD) una lista de parámetros.
 * @param {string} title - El título para mostrar (ej. "Tipos de Parto")
 * @param {string} apiUrl - El endpoint de la API (ej. "/dashboard/api/parametros/tipos-parto/")
 */
export default function ParameterManager({ title, apiUrl }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar los items al iniciar
  useEffect(() => {
    fetchItems();
  }, [apiUrl]); // Se recarga si la URL de la API cambia

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(apiUrl);
      setItems(response.data);
    } catch (err) {
      setError(`No se pudieron cargar ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo item
  const handleCreate = async () => {
    const nombre = window.prompt(`Nuevo nombre para ${title.slice(0, -1)}:`); // "Tipos de Parto" -> "Tipos de Parto"
    if (nombre) {
      try {
        await apiClient.post(apiUrl, { nombre: nombre, activo: true });
        fetchItems(); // Recargar la lista
      } catch (err) {
        alert('Error al crear el ítem. ¿Quizás ya existe?');
      }
    }
  };

  // Editar un item
  const handleEdit = async (item) => {
    const nombre = window.prompt('Nuevo nombre:', item.nombre);
    if (nombre && nombre !== item.nombre) {
      try {
        await apiClient.put(`${apiUrl}${item.id}/`, { ...item, nombre: nombre });
        fetchItems(); // Recargar la lista
      } catch (err) {
        alert('Error al actualizar el ítem.');
      }
    }
  };
  
  // Activar/Desactivar un item
  const handleToggleActive = async (item) => {
    try {
      await apiClient.patch(`${apiUrl}${item.id}/`, { activo: !item.activo });
      fetchItems(); // Recargar la lista
    } catch (err) {
      alert('Error al cambiar el estado.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-5 w-5" />
          Añadir Nuevo
        </button>
      </div>

      {/* Tabla de Parámetros */}
      <div className="mt-4 flow-root">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Nombre</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Estado</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900">
              {loading && (
                <tr><td colSpan="3" className="py-4 text-center text-gray-400">Cargando...</td></tr>
              )}
              {error && (
                <tr><td colSpan="3" className="py-4 text-center text-red-400">{error}</td></tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{item.nombre}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        item.activo 
                          ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                          : 'bg-red-900 text-red-200 hover:bg-red-800'
                      }`}
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-indigo-400 hover:text-indigo-300"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                      <span className="sr-only">Editar</span>
                    </button>
                    {/* El borrado (DELETE) se omite por seguridad, es mejor desactivar (PATCH) */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}