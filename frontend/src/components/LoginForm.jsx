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
        {/* 1. REFACTOR: text-gray-300 -> text-secondary */}
        <label 
          htmlFor="username" 
          className="block text-sm font-medium text-secondary"
        >
          Usuario
        </label>
        {/* 2. REFACTOR: Colores del input */}
        <input
          id="username"
          type="text"
          required
          className="w-full px-3 py-2 mt-1 border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        {/* 3. REFACTOR: text-gray-300 -> text-secondary */}
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-secondary"
        >
          Contraseña
        </label>
        {/* 4. REFACTOR: Colores del input */}
        <input
          id="password"
          type="password"
          required
          className="w-full px-3 py-2 mt-1 border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <button 
          type="submit" 
          // 5. REFACTOR: ring-offset-gray-900 -> ring-offset-background
          className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-background disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;