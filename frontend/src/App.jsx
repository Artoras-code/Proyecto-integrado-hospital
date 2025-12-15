import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones de Páginas y Componentes Generales
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Importaciones de Layout y Páginas del Admin
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard'; 
import UserManagementPage from './pages/UserManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import ConfigPage from './pages/ConfigPage';

// Importaciones de Layout y Páginas del Supervisor
import SupervisorLayout from './components/SupervisorLayout';
import SupervisorDashboard from './pages/SupervisorDashboard';
import GestionRegistrosPage from './pages/GestionRegistrosPage';
import ReportesPage from './pages/ReportesPages.jsx';
import ParametersPage from './pages/ParametersPage';
import NotificacionesPage from './pages/NotificacionesPage';
import DefuncionesPage from './pages/DefuncionesPage';
import HistorialAltasPage from './pages/HistorialAltasPage';

// Importaciones de Layout y Páginas del Clínico
import ClinicoLayout from './components/ClinicoLayout';
import MisRegistrosPage from './pages/MisRegistrosPage';
import RegistroFormPage from './pages/RegistroFormPage';
import EquiposPage from './pages/EquiposPage';
import GestionPacientesPage from './pages/GestionPacientesPage'; 


function DashboardRedirector() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.rol) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.rol === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.rol === 'supervisor') {
    return <Navigate to="/supervisor/dashboard" replace />;
  }
  
  if (user.rol === 'doctor' || user.rol === 'enfermero') {
    return <Navigate to="/clinico/mis-registros" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="config" element={<ConfigPage />} />
        </Route>

        <Route 
          path="/supervisor" 
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <SupervisorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SupervisorDashboard />} />
          <Route path="registros" element={<GestionRegistrosPage />} />
          <Route path="nuevo-registro" element={<RegistroFormPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="parameters" element={<ParametersPage />} />
          <Route path="defunciones" element={<DefuncionesPage />} />
          <Route path="altas" element={<HistorialAltasPage />} />
        </Route>

        <Route 
          path="/clinico" 
          element={
            <ProtectedRoute allowedRoles={['doctor', 'enfermero']}>
              <ClinicoLayout />
            </ProtectedRoute>
          }
        >
          <Route path="mis-registros" element={<MisRegistrosPage />} />
          <Route path="nuevo-registro" element={<RegistroFormPage />} />
          <Route path="equipos" element={<EquiposPage />} />
          <Route path="pacientes" element={<GestionPacientesPage />} />
          <Route path="defunciones" element={<DefuncionesPage />} />
        </Route>


        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardRedirector />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;