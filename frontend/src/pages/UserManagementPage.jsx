import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import UserFormModal from '../components/UserFormModal'; 
import { PencilIcon, ShieldExclamationIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null); 

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- ¡LÓGICA RESTAURADA! ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/cuentas/api/users/');
      setUsers(response.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  // --- ¡LÓGICA RESTAURADA! ---
  const handleOpenModal = (user = null) => {
    setUserToEdit(user); 
    setIsModalOpen(true);
  };

  // --- ¡LÓGICA RESTAURADA! ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  // --- ¡LÓGICA RESTAURADA! ---
  const handleSaveUser = async (formData) => {
    try {
      let dataToSave = { ...formData };

      if (formData.id && !formData.password) {
        delete dataToSave.password;
      }
      
      if (formData.id) {
        await apiClient.put(`/cuentas/api/users/${formData.id}/`, dataToSave);
      } else {
        await apiClient.post('/cuentas/api/users/', dataToSave);
      }
      
      handleCloseModal(); 
      fetchUsers(); 
    } catch (err) {
      console.error('Error al guardar:', err.response?.data);
      alert('Error al guardar el usuario.');
    }
  };

  // --- ¡LÓGICA RESTAURADA! ---
  const handleReset2FA = async (userId, username) => {
    if (window.confirm(`¿Estás seguro de que quieres resetear el 2FA para ${username}? \nEl usuario deberá reconfigurarlo en su próximo inicio de sesión.`)) {
      try {
        await apiClient.post(`/cuentas/api/users/${userId}/reset_2fa/`);
        alert(`2FA reseteado para ${username}.`);
      } catch (err) {
        alert('Error al resetear 2FA.');
      }
    }
  };


  return (
    // Contenedor principal de la tarjeta flotante
    <div className="bg-surface rounded-lg shadow-md p-6">
      
      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-secondary">Crea, edita y gestiona los usuarios del sistema.</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-x-2 rounded-lg bg-accent-mint px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-mint-hover"
        >
          <PlusIcon className="h-5 w-5" />
          Crear Nuevo Usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">Usuario</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Nombre</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Rol</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">RUT</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Estado</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {loading && (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-secondary">Cargando usuarios...</td>
                    </tr>
                  )}
                  {error && (
                     <tr>
                      <td colSpan="6" className="py-4 text-center text-red-400">{error}</td>
                    </tr>
                  )}
                  {!loading && users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-6">{user.username}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{user.first_name} {user.last_name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{user.rol}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">{user.rut || 'N/A'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                        {user.is_active ? (
                          <span className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-200">Activo</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-100 dark:bg-red-900 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-200">Inactivo</span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        <button
                          onClick={() => handleReset2FA(user.id, user.username)}
                          className="text-yellow-500 hover:text-yellow-400"
                          title="Resetear 2FA"
                        >
                          <ShieldExclamationIcon className="h-5 w-5" />
                          <span className="sr-only">Resetear 2FA</span>
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-accent-mint hover:text-accent-mint-hover"
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

      {/* El Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />
    </div>
  );
}