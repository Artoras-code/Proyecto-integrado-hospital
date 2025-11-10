import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

// Recibe el 'username' y la función 'onSetupComplete' desde LoginPage
export default function Setup2FAFlow({ username, onSetupComplete }) {
  const [qrCodeData, setQrCodeData] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Empieza cargando

  // Paso 1: Al cargar, llamar a la API para generar el QR
  useEffect(() => {
    const generateQR = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.post('/cuentas/api/auth/2fa/generate/', { username });
        setQrCodeData(response.data.qr_code_data);
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo generar el código QR.');
      } finally {
        setIsLoading(false);
      }
    };
    generateQR();
  }, [username]); // Se ejecuta cada vez que el 'username' cambie

  // Paso 2: Manejador para verificar el código ingresado
  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Llamar al nuevo endpoint de verificación
      const response = await apiClient.post('/cuentas/api/auth/2fa/verify-setup/', {
        username,
        otp_token: otpToken,
      });
      
      // ¡Éxito! Devolver los datos del usuario (tokens, etc.) a LoginPage
      onSetupComplete(response.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Error de verificación.');
      setIsLoading(false);
    }
    // No ponemos setIsLoading(false) en caso de éxito, porque la página va a navegar
  };

  return (
    <div className="space-y-6">
      {/* 1. REFACTOR: text-white -> text-primary */}
      <h3 className="text-lg font-medium text-center text-primary">Configurar Autenticación (2FA)</h3>
      {/* 2. REFACTOR: text-gray-400 -> text-secondary */}
      <p className="text-sm text-center text-secondary">
        Escanea el código QR con tu app de autenticación (ej. Google Authenticator) y luego ingresa el código de 6 dígitos.
      </p>

      {/* Contenedor del QR Code (IMPORTANTE: Mantenemos bg-white para que el QR sea legible) */}
      <div className="flex justify-center p-4 bg-white rounded-lg">
        {isLoading && !qrCodeData && <p className="text-gray-800">Generando código QR...</p>}
        {error && !qrCodeData && <p className="text-red-600">{error}</p>}
        {qrCodeData && (
          <img src={qrCodeData} alt="Código QR para 2FA" className="w-48 h-48" />
        )}
      </div>

      {/* Formulario de Verificación */}
      <form className="space-y-6" onSubmit={handleVerifySetup}>
        {error && qrCodeData && ( // Mostrar error de verificación
          <div className="p-3 text-sm text-center text-red-300 bg-red-800 border border-red-500 rounded-lg">
            {error}
          </div>
        )}
        <div>
          {/* 3. REFACTOR: text-gray-300 -> text-secondary */}
          <label 
            htmlFor="otp_token_setup" 
            className="block text-sm font-medium text-secondary"
          >
            Código de 6 dígitos
          </label>
          {/* 4. REFACTOR: Colores del input */}
          <input
            id="otp_token_setup"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength="6"
            required
            className="w-full px-3 py-2 mt-1 text-center tracking-widest border border-border bg-surface text-primary rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={otpToken}
            onChange={(e) => setOtpToken(e.target.value)}
            disabled={isLoading || !qrCodeData}
          />
        </div>
        <div>
          <button 
            type="submit" 
            // 5. REFACTOR: ring-offset-gray-900 -> ring-offset-background
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-background disabled:opacity-50"
            disabled={isLoading || !qrCodeData}
          >
            {isLoading ? 'Verificando...' : 'Verificar y Activar Cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
}