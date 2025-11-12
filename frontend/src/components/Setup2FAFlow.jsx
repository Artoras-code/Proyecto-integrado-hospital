import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';


export default function Setup2FAFlow({ username, onSetupComplete, qrCodeData }) {

  
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 


  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/cuentas/api/auth/2fa/verify-setup/', {
        username,
        otp_token: otpToken,
      });
      

      onSetupComplete(response.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Error de verificación.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-center text-primary">Configurar Autenticación (2FA)</h3>
      <p className="text-sm text-center text-secondary">
        Escanea el código QR con tu app de autenticación y luego ingresa el código de 6 dígitos.
      </p>


      <div className="flex justify-center p-4 bg-white rounded-lg">
        {!qrCodeData && <p className="text-gray-800">Generando código QR...</p>}
        {qrCodeData && (
          <img src={qrCodeData} alt="Código QR para 2FA" className="w-48 h-48" />
        )}

      </div>
      <form className="space-y-6" onSubmit={handleVerifySetup}>
        {error && (
          <div className="p-3 text-sm text-center text-red-300 bg-red-800 border border-red-500 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <label 
            htmlFor="otp_token_setup" 
            className="block text-sm font-medium text-primary"
          >
            Código de 6 dígitos
          </label>
          <input
            id="otp_token_setup"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength="6"
            required
            className="w-full px-3 py-2 mt-1 text-center tracking-widest border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-accent-mint focus:border-accent-mint"
            value={otpToken}
            onChange={(e) => setOtpToken(e.target.value)}
            disabled={isLoading || !qrCodeData}
          />
        </div>
        <div>
          <button 
            type="submit" 
            className="w-full px-4 py-2 font-medium text-white bg-accent-mint rounded-md hover:bg-accent-mint-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-mint focus:ring-offset-background disabled:opacity-50"
            disabled={isLoading || !qrCodeData}
          >
            {isLoading ? 'Verificando...' : 'Verificar y Activar Cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
}