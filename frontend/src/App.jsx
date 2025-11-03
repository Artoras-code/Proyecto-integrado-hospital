import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones de Páginas y Componentes
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Importaciones de Layout y Páginas del Admin
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard'; 
import UserManagementPage from './pages/UserManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import ConfigPage from './pages/ConfigPage';

// Importaciones de Layout y páginas del Supervisor
import SupervisorLayout from './components/SupervisorLayout';
import SupervisorDashboard from './pages/SupervisorDashboard';
import GestionRegistrosPage from './pages/GestionRegistrosPage';
import ReportesPage from './pages/ReportesPages.jsx'; // (Corregido de tu paso anterior)
import ParametersPage from './pages/ParametersPage';

// --- 1. Importar el Layout y páginas del Clínico ---
import ClinicoLayout from './components/ClinicoLayout';
import MisRegistrosPage from './pages/MisRegistrosPage';
import RegistroFormPage from './pages/RegistroFormPage'; // ¡Reutilizamos este formulario!

/**
 * Componente (ACTUALIZADO) para redirigir al usuario a su dashboard
 * correcto después de iniciar sesión.
 */
function DashboardRedirector() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.rol) {
    // Si falta información, lo mejor es volver a loguear.
    return <Navigate to="/login" replace />;
  }
  
  if (user.rol === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // --- Redirección para Supervisor ---
  if (user.rol === 'supervisor') {
    return <Navigate to="/supervisor/dashboard" replace />;
  }
  
  // --- 2. Redirección para Doctor y Enfermero ---
  if (user.rol === 'doctor' || user.rol === 'enfermero') {
    return <Navigate to="/clinico/mis-registros" replace />;
  }
  
  // Fallback por si el rol no es ninguno
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Ruta de Login (Pública) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Rutas de ADMIN (Protegidas) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="config" element={<ConfigPage />} />
        </Route>

        {/* 3. Rutas de SUPERVISOR (Protegidas) */}
        <Route 
          path="/supervisor" 
          element={
            <ProtectedRoute>
              <SupervisorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SupervisorDashboard />} />
          <Route path="registros" element={<GestionRegistrosPage />} />
          <Route path="nuevo-registro" element={<RegistroFormPage />} /> {/* Reutiliza el formulario */}
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="parameters" element={<ParametersPage />} /> {/* Movida aquí */}
        </Route>

        {/* 4. Rutas de CLÍNICO (Protegidas) */}
        <Route 
          path="/clinico" 
          element={
            <ProtectedRoute>
              <ClinicoLayout />
            </ProtectedRoute>
          }
        >
          {/* La página de inicio del clínico es "Mis Registros" */}
          <Route path="mis-registros" element={<MisRegistrosPage />} />
          <Route path="nuevo-registro" element={<RegistroFormPage />} /> {/* Reutiliza el formulario */}
        </Route>


        {/* 5. Redirección de la raíz ("/") */}
        {/* Esta es la ruta que se usa después de iniciar sesión */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardRedirector />
            </ProtectedRoute>
          } 
        />
        
        {/* 6. Ruta "Catch-all" */}
        {/* Si no se encuentra ninguna ruta, redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;