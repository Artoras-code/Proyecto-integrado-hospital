import React, { useState, useEffect } from 'react';

// Opciones de Roles
const ROL_CHOICES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'enfermero', label: 'Enfermero' },
];

export default function UserFormModal({ isOpen, onClose, onSave, userToEdit }) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    rol: 'enfermero',
    rut: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  // Efecto para cargar datos al editar o resetear al crear
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        id: userToEdit.id,
        username: userToEdit.username,
        email: userToEdit.email,
        first_name: userToEdit.first_name,
        last_name: userToEdit.last_name,
        rol: userToEdit.rol,
        rut: userToEdit.rut || '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        rol: 'enfermero',
        rut: '',
        password: '',
        confirmPassword: '',
      });
    }
    setError('');
  }, [isOpen, userToEdit]);

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 1. Validación básica
    if (!formData.username) {
      setError('El nombre de usuario es obligatorio.');
      return;
    }

    // 2. Validación de Contraseñas
    if (!userToEdit || formData.password) {
      if (!formData.password && !userToEdit) {
         setError('La contraseña es obligatoria para nuevos usuarios.');
         return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden. Por favor, verifícalas.');
        return;
      }
      if (formData.password && formData.password.length < 5) {
         setError('La contraseña debe tener al menos 5 caracteres para ser segura.');
         return;
      }
    }
    
    // Preparar datos para enviar (quitando confirmPassword)
    const dataToSend = { ...formData };
    delete dataToSend.confirmPassword;

    // Si la contraseña está vacía en edición, no la enviamos
    if (!dataToSend.password) {
        delete dataToSend.password;
    }
    
    onSave(dataToSend);
  };

  if (!isOpen) return null;

  const isEditing = !!userToEdit;

  // Clases de estilo reutilizables para los inputs
  const inputClasses = "mt-2 block w-full rounded-lg border-gray-600 bg-gray-900/50 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-200 ease-in-out hover:border-gray-500";
  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    // Overlay con fondo oscuro y desenfoque más pronunciado
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-opacity">
      
      {/* Contenedor del Modal: bordes más redondeados, sombra más suave, borde sutil */}
      <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-8 shadow-2xl transition-all">
        
        {/* Encabezado */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isEditing 
              ? 'Modifique los datos personales o credenciales del usuario seleccionado.' 
              : 'Complete el formulario para registrar un nuevo miembro del personal en el sistema.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensaje de Error */}
          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-900/30 p-4 text-sm text-red-200 animate-pulse">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Sección: Datos Principales */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="username" className={labelClasses}>Nombre de Usuario *</label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username || ''}
                onChange={handleChange}
                required
                placeholder="ej. jperezt"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="ej. contacto@hospital.cl"
                className={inputClasses}
              />
            </div>
          </div>
          
          {/* Sección: Datos Personales */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="first_name" className={labelClasses}>Nombre</label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="last_name" className={labelClasses}>Apellido</label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
          </div>
          
          {/* Sección: Identificación y Rol */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div>
              <label htmlFor="rut" className={labelClasses}>RUT</label>
              <input
                type="text"
                name="rut"
                id="rut"
                value={formData.rut || ''}
                onChange={handleChange}
                placeholder="12.345.678-9"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="rol" className={labelClasses}>Rol en el Sistema</label>
              <select
                name="rol"
                id="rol"
                value={formData.rol || 'enfermero'}
                onChange={handleChange}
                className={inputClasses}
              >
                {ROL_CHOICES.map(rol => (
                  <option key={rol.value} value={rol.value}>{rol.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Sección: Seguridad (Agrupada visualmente) */}
          <div className="rounded-xl border border-gray-700 bg-gray-900/30 p-5">
            <h3 className="text-lg font-medium text-white mb-4">Seguridad y Acceso</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="password" className={labelClasses}>
                  Contraseña {isEditing && <span className="text-gray-500 font-normal">(Opcional si no desea cambiarla)</span>}
                  {!isEditing && <span className="text-indigo-400 font-normal"> * Requerida</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  placeholder={isEditing ? '••••••••' : 'Ingrese contraseña segura'}
                  className={inputClasses}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelClasses}>
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword || ''}
                  onChange={handleChange}
                  placeholder="Repita la contraseña anterior"
                  disabled={!formData.password} 
                  className={`${inputClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-lg border border-gray-600 bg-transparent px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}