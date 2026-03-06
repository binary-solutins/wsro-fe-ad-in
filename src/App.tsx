import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { authAtom } from './store/auth';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import CompetitionList from './components/CompetitionList';
import CertificateManagement from './components/CertificateManagement';
import AdminLayout from './components/layout/AdminLayout';
import { Settings } from './components/Setting';
import RegistrationList from './components/RegistrationList';
import EventList from './components/Events/EventList';
import InquiryList from './components/Inquery';

import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useAtom(authAtom);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !auth.isAuthenticated) {
      // Hydrate state from stored token if page was refreshed
      setAuth({
        token,
        user: null, // Depending on if we store user string locally; we can just restore token
        isAuthenticated: true,
      });
    }
  }, [auth.isAuthenticated, setAuth]);

  // Give effect a moment to assert before kicking to login
  if (!auth?.isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public route: Login page should be accessible without authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes: Everything inside AdminLayout is protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="competitions" element={<CompetitionList />} />
            <Route path="events" element={<EventList />} />
            <Route path="registrations" element={<RegistrationList />} />
            <Route path="certificates" element={<CertificateManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="inquery" element={<InquiryList />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </>
  );
}

export default App;