import React, { useState } from 'react';

function Verify2FAForm({ onSubmit, onBack, isLoading, error }) {
  const [otpToken, setOtpToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ otp_token: otpToken });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* 1. REFACTOR: text-white -> text-primary */}
      <h3 className="text-lg font-medium text-center text-primary">Verificación en Dos Pasos</h3>
      {/* 2. REFACTOR: text-gray-400 -> text-secondary */}
      <p className="text-sm text-center text-secondary">
        Ingresa el código de 6 dígitos de tu app de autenticación.
      </p>

      {error && (
        <div className="p-3 text-sm text-center text-red-300 bg-red-800 border border-red-500 rounded-lg">
          {error}
        </div>
      )}

      <div>
        {/* 3. REFACTOR: text-gray-300 -> text-secondary */}
        <label 
          htmlFor="otp_token" 
          className="block text-sm font-medium text-secondary"
        >
          Código 2FA
        </label>
        {/* 4. REFACTOR: Colores del input */}
        <input
          id="otp_token"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength="6"
          required
          className="w-full px-3 py-2 mt-1 text-center tracking-widest border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={otpToken}
          onChange={(e) => setOtpToken(e.target.value)}
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
          {isLoading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
      <div className="text-center">
        <button 
          type="button" 
          onClick={onBack}
          className="text-sm font-medium text-indigo-400 hover:underline disabled:opacity-50"
          disabled={isLoading}
        >
          Volver
        </button>
      </div>
    </form>
  );
}

export default Verify2FAForm;