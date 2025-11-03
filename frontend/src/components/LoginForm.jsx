import React, { useState } from 'react';

function LoginForm({ onSubmit, isLoading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 text-sm text-center text-red-300 bg-red-800 border border-red-500 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label 
          htmlFor="username" 
          className="block text-sm font-medium text-gray-300" // Texto más claro
        >
          Usuario
        </label>
        <input
          id="username"
          type="text"
          required
          className="w-full px-3 py-2 mt-1 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" // Estilos oscuros
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-gray-300" // Texto más claro
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          className="w-full px-3 py-2 mt-1 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" // Estilos oscuros
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <button 
          type="submit" 
          className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:opacity-50" // Botón de color
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;