import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import UserFormModal from '../components/UserFormModal'; // <-- Importamos el modal
import { PencilIcon, ShieldExclamationIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null); // null = Crear, objeto = Editar

  // 1. Cargar la lista de usuarios al iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Usamos el apiClient, que ya incluye el token de autenticación
      // --- CORREGIDO ---
      const response = await apiClient.get('/cuentas/api/users/');
      setUsers(response.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Abrir el modal
  const handleOpenModal = (user = null) => {
    setUserToEdit(user); // Si user es null, el modal sabe que es para "Crear"
    setIsModalOpen(true);
  };

  // 3. Cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  // 4. Guardar (Crear o Editar)
  const handleSaveUser = async (formData) => {
    try {
      let dataToSave = { ...formData };

      // Si estamos editando y la contraseña está vacía, no la enviamos
      if (formData.id && !formData.password) {
        delete dataToSave.password;
      }
      
      if (formData.id) {
        // --- EDITAR (PUT) ---
        // --- CORREGIDO ---
        await apiClient.put(`/cuentas/api/users/${formData.id}/`, dataToSave);
      } else {
        // --- CREAR (POST) ---
        // --- CORREGIDO ---
        await apiClient.post('/cuentas/api/users/', dataToSave);
      }
      
      handleCloseModal(); // Cerrar modal
      fetchUsers(); // Recargar la lista de usuarios
    } catch (err) {
      console.error('Error al guardar:', err.response?.data);
      alert('Error al guardar el usuario.');
    }
  };

  // 5. Resetear 2FA
  const handleReset2FA = async (userId, username) => {
    if (window.confirm(`¿Estás seguro de que quieres resetear el 2FA para ${username}? \nEl usuario deberá reconfigurarlo en su próximo inicio de sesión.`)) {
      try {
        // --- CORREGIDO ---
        await apiClient.post(`/cuentas/api/users/${userId}/reset_2fa/`);
        alert(`2FA reseteado para ${username}.`);
      } catch (err) {
        alert('Error al resetear 2FA.');
      }
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
        <button
          onClick={() => handleOpenModal(null)} // null = Crear
          className="flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-5 w-5" />
          Crear Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Usuario</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Nombre</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Rol</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">RUT</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Estado</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-900">
                  {loading && (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-400">Cargando usuarios...</td>
                    </tr>
                  )}
                  {error && (
                     <tr>
                      <td colSpan="6" className="py-4 text-center text-red-400">{error}</td>
                    </tr>
                  )}
                  {!loading && users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{user.username}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.first_name} {user.last_name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.rol}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.rut || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        {user.is_active ? (
                          <span className="inline-flex items-center rounded-md bg-green-900 px-2 py-1 text-xs font-medium text-green-200">Activo</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-900 px-2 py-1 text-xs font-medium text-red-200">Inactivo</span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        <button
                          onClick={() => handleReset2FA(user.id, user.username)}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Resetear 2FA"
                        >
                          <ShieldExclamationIcon className="h-5 w-5" />
                          <span className="sr-only">Resetear 2FA</span>
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)} // user = Editar
                          className="text-indigo-400 hover:text-indigo-300"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span className="sr-only">Editar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* El Modal (se mostrará u ocultará según el estado) */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />
    </div>
  );
}