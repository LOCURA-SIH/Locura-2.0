import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { BatteryCriticalModal } from './components/BatteryCriticalModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { SosPage } from './pages/SosPage';
import { MedicalProfilePage } from './pages/MedicalProfilePage';
import { TrustedContactsPage } from './pages/TrustedContactsPage';
import { HelpersPage } from './pages/HelpersPage';
import { HelperDashboardPage } from './pages/HelperDashboardPage';
import { HelperSosPage } from './pages/HelperSosPage';
import { SafeRoutePage } from './pages/SafeRoutePage';
import { IncidentsPage } from './pages/IncidentsPage';
import { EmergencyServicesPage } from './pages/EmergencyServicesPage';
import { SosHistoryPage } from './pages/SosHistoryPage';
import { EmergencyMedicalAccessPage } from './pages/EmergencyMedicalAccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { authService } from './services/authService';
import { UserProfile } from './types';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.subscribe((u) => setUser(u));
    return () => unsub();
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#F4F7F8] text-slate-800 flex flex-col selection:bg-rose-500 selection:text-white">
      {!isAuthPage && user && <Navbar />}
      <OfflineBanner />
      <BatteryCriticalModal />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />

          {/* Protected Main Routes */}
          <Route
            path="/dashboard"
            element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/sos"
            element={user ? <SosPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/medical-profile"
            element={user ? <MedicalProfilePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/trusted-contacts"
            element={user ? <TrustedContactsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/helpers"
            element={user ? <HelpersPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/helper-dashboard"
            element={user ? <HelperDashboardPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/helper-sos"
            element={user ? <HelperSosPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/safe-route"
            element={user ? <SafeRoutePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/incidents"
            element={user ? <IncidentsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/emergency-services"
            element={user ? <EmergencyServicesPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/sos-history"
            element={user ? <SosHistoryPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/emergency-medical-access"
            element={user ? <EmergencyMedicalAccessPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </main>

      {!isAuthPage && user && <BottomNav />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
