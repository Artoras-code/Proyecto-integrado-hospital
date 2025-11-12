import React, { useState } from 'react';

function Verify2FAForm({ onSubmit, onBack, isLoading, error }) {
  const [otpToken, setOtpToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ otp_token: otpToken });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium text-center text-primary">Verificación en Dos Pasos</h3>
      <p className="text-sm text-center text-secondary">
        Ingresa el código de 6 dígitos de tu app de autenticación.
      </p>

      {error && (
        <div className="p-3 text-sm text-center text-red-300 bg-red-800 border border-red-500 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label 
          htmlFor="otp_token" 
          className="block text-sm font-medium text-primary"
        >
          Código 2FA
        </label>
        <input
          id="otp_token"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength="6"
          required
          // ¡CAMBIO! focus:ring/border-accent-mint
          className="w-full px-3 py-2 mt-1 text-center tracking-widest border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-accent-mint focus:border-accent-mint"
          value={otpToken}
          onChange={(e) => setOtpToken(e.target.value)}
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
          {isLoading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
      <div className="text-center">
        {/* ¡CAMBIO! Enlace text-accent-mint */}
        <button 
          type="button" 
          onClick={onBack}
          className="text-sm font-medium text-accent-mint hover:underline disabled:opacity-50"
          disabled={isLoading}
        >
          Volver
        </button>
      </div>
    </form>
  );
}

export default Verify2FAForm;