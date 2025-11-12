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
          className="block text-sm font-medium text-primary"
        >
          Usuario
        </label>
        <input
          id="username"
          type="text"
          required
          // ¡CAMBIO! focus:ring/border-accent-mint
          className="w-full px-3 py-2 mt-1 border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-accent-mint focus:border-accent-mint"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-primary"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          // ¡CAMBIO! focus:ring/border-accent-mint
          className="w-full px-3 py-2 mt-1 border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-accent-mint focus:border-accent-mint"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        {/* ¡CAMBIO! Botón bg-accent-mint */}
        <button 
          type="submit" 
          className="w-full px-4 py-2 font-medium text-white bg-accent-mint rounded-md hover:bg-accent-mint-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-mint focus:ring-offset-background disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;