import React, { useState, useEffect } from 'react';

// Opciones de Roles (de tu models.py)
const ROL_CHOICES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'enfermero', label: 'Enfermero' },
];

// Recibe:
// - isOpen: (true/false) para mostrar/ocultar
// - onClose: función para cerrar el modal
// - onSave: función para guardar los datos
// - userToEdit: (objeto de usuario) si estamos editando, o (null) si estamos creando
export default function UserFormModal({ isOpen, onClose, onSave, userToEdit }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  // Cuando el modal se abre para editar, llena el formulario con los datos del usuario
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
        password: '', // La contraseña siempre empieza vacía
      });
    } else {
      // Si es para crear, resetea el formulario
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        rol: 'enfermero', // Rol por defecto
        rut: '',
        password: '',
      });
    }
    setError(''); // Limpia errores al abrir
  }, [isOpen, userToEdit]); // Se ejecuta cada vez que el modal se abre

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación simple
    if (!formData.username || (!formData.password && !userToEdit)) {
      setError('El nombre de usuario y la contraseña son obligatorios al crear.');
      return;
    }
    
    // Llama a la función onSave (que está en UserManagementPage)
    onSave(formData);
  };

  if (!isOpen) return null;

  const isEditing = !!userToEdit;

  return (
    // Fondo oscuro semi-transparente (sin cambios)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      
      {/* 1. REFACTOR: Contenedor del Modal (bg-gray-800 -> bg-surface) */}
      <div className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-2xl">
        
        {/* 2. REFACTOR: Título (text-white -> text-primary) */}
        <h2 className="text-2xl font-bold text-primary">
          {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h2>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-md border border-red-500 bg-red-800 p-3 text-red-200">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              {/* 3. REFACTOR: Label (text-gray-300 -> text-secondary) */}
              <label htmlFor="username" className="text-sm font-medium text-secondary">Nombre de Usuario</label>
              {/* 4. REFACTOR: Input (border-gray-700 -> border-border, bg-gray-900 -> bg-background, text-white -> text-primary) */}
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username || ''}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-secondary">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="text-sm font-medium text-secondary">Nombre</label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="text-sm font-medium text-secondary">Apellido</label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
             <div>
              <label htmlFor="rut" className="text-sm font-medium text-secondary">RUT</label>
              <input
                type="text"
                name="rut"
                id="rut"
                value={formData.rut || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="rol" className="text-sm font-medium text-secondary">Rol</label>
              <select
                name="rol"
                id="rol"
                value={formData.rol || 'enfermero'}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {ROL_CHOICES.map(rol => (
                  <option key={rol.value} value={rol.value}>{rol.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-medium text-secondary">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password || ''}
              onChange={handleChange}
              placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Requerido'}
              className="mt-1 block w-full rounded-md border-border bg-background text-primary shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 flex justify-end space-x-4">
            {/* 5. REFACTOR: Botón Cancelar */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-secondary hover:bg-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}