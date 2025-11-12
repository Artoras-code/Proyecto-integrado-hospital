import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import LoginForm from '../components/LoginForm';
import Verify2FAForm from '../components/Verify2FAForm';
import Setup2FAFlow from '../components/Setup2FAFlow';

export default function LoginPage() {
  const [step, setStep] = useState('credentials'); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');


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
        try {
          const qrResponse = await apiClient.post('/cuentas/api/auth/2fa/generate/', { 
            username: credentials.username 
          });
          setQrCodeData(qrResponse.data.qr_code_data); 
          setStep('setup'); 
        } catch (qrErr) {
          setError(qrErr.response?.data?.error || 'No se pudo generar el código QR.');
        }
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const loginAndNavigate = (data) => {
    const { access, refresh, user } = data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/');
  };

  const handleVerifySubmit = async (tokenData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/cuentas/api/auth/verify/', {
        username: username,
        otp_token: tokenData.otp_token,
      });
      loginAndNavigate(response.data); 
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión.');
      setIsLoading(false);
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
          <Setup2FAFlow
            username={username}
            onSetupComplete={loginAndNavigate}
            qrCodeData={qrCodeData} 
          />

        );
      default:
        return null;
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      

      <div className="flex w-full max-w-6xl min-h-[700px] overflow-hidden rounded-2xl shadow-2xl">
        
        <div 
          className="hidden lg:flex w-1/2 relative p-12 flex-col justify-between text-white"
          style={{
            backgroundImage: `url('/imag_hospital.jpeg')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >

          <div className="absolute inset-0 bg-black opacity-60"></div> 


          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-3xl font-bold">Bienvenido</h2>
              <p className="mt-4 text-white/80 max-w-md">
                Sistema de Trazabilidad del Departamento de Obstetricia y Recién Nacidos.
              </p>
            </div>
            
            <div className="opacity-70">
              <p className="font-mono text-4xl font-bold">GESTIÓN HOSPITALARIA</p>
              <p className="text-2xl">Innovación y Cuidado</p>
              <div className="flex gap-2 mt-4">
                <span className="w-3 h-3 bg-white/50 rounded-full"></span>
                <span className="w-3 h-3 bg-white rounded-full"></span>
                <span className="w-3 h-3 bg-white/50 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>


        <div className="flex-1 flex items-center justify-center p-12 bg-white dark:bg-zinc-800">
          <div className="w-full max-w-md space-y-8">
            

            <div className="flex items-center justify-center mb-6">
              <img src="/logoFooter2.png" alt="Hospital Clínico Herminda Martín de Chillán" className="w-auto h-32" />
            </div>

            {step === 'credentials' && (
              <>
                <h2 className="text-3xl font-extrabold text-primary text-left">
                  Iniciar Sesión
                </h2>
              </>
            )}

            {renderStep()}
            
          </div>
        </div>
        
      </div>

    </div>
  );
}