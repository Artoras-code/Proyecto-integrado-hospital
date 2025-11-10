import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import LoginForm from '../components/LoginForm';
import Verify2FAForm from '../components/Verify2FAForm';
import Setup2FAFlow from '../components/Setup2FAFlow'; // <-- Importar el componente

export default function LoginPage() {
  const [step, setStep] = useState('credentials'); // 'credentials', 'token', o 'setup'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (credentials) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/cuentas/api/auth/login/', {
        username: credentials.username,
        password: credentials.password,
      });

      setUsername(credentials.username); 
      
      if (response.data.step === '2fa_required') {
        setStep('token');
      } else if (response.data.step === '2fa_setup_required') {
        setStep('setup'); // <-- Esto ya lo teníamos, está perfecto
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar los tokens y navegar
  const loginAndNavigate = (data) => {
    const { access, refresh, user } = data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/'); // <-- Redirige a la raíz (el DashboardRedirector se encargará)
  };

  // handleVerifySubmit (Login normal)
  const handleVerifySubmit = async (tokenData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/cuentas/api/auth/verify/', {
        username: username,
        otp_token: tokenData.otp_token,
      });
      // Usar la nueva función
      loginAndNavigate(response.data); 
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión.');
      setIsLoading(false); // Solo si hay error
    }
  };

  const handleBack = () => {
    setStep('credentials');
    setError('');
  };

  const renderStep = () => {
    switch(step) {
      case 'credentials':
        return (
          <LoginForm 
            onSubmit={handleLoginSubmit} 
            isLoading={isLoading}
            error={error}
          />
        );
      case 'token':
        return (
          <Verify2FAForm 
            onSubmit={handleVerifySubmit} 
            onBack={handleBack}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'setup':
        return (
          // Renderizar el nuevo componente de flujo
          <Setup2FAFlow
            username={username}
            onSetupComplete={loginAndNavigate} // Le pasamos la función de login
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* * 1. REFACTORIZAR COLORES
        * 'bg-gray-900' -> 'bg-background'
        * 'text-white' -> 'text-primary'
        */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background text-primary">
        <div className="w-full max-w-md space-y-8">
          
          <div className="flex items-center justify-center mb-10">
            <span className="text-3xl font-bold text-indigo-400">Sistema Hospitalario</span>
          </div>

          {step === 'credentials' && (
            <>
              {/* 2. REFACTORIZAR: 'text-white' -> 'text-primary' */}
              <h2 className="text-3xl font-extrabold text-primary">
                Iniciar Sesión
              </h2>
              {/* 3. REFACTORIZAR: 'text-gray-400' -> 'text-secondary' */}
              <p className="mt-2 text-sm text-secondary">
                Departamento de Obstetricia
              </p>
            </>
          )}

          {renderStep()}
          
        </div>
      </div>

      {/* Sección Derecha - Imagen de Fondo (Sin cambios) */}
      <div 
        className="hidden lg:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/imag_hospital.jpeg')" }}
      >
      </div>
    </div>
  );
}