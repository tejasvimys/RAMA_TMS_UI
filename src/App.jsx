import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Pages/Dashboard';
import AddDonor from './Pages/AddDonor';
import DonorList from './Pages/DonorList';
import Donation from './Pages/Donation';
import AnnualImportPage from './Pages/AnnualImportPage';
import QuickDonationPage from './Pages/QuickDonationPage';
import DonationListPage from './Pages/DonationListPage';

import LoginPage from './Pages/LoginPage';
import AdminUsersPage from './Pages/AdminUsersPage';
import apiClient from './ApiClient/apiClient';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [auth, setAuth] = useState(() => {
  const token = localStorage.getItem('appToken');
  const email = localStorage.getItem('userEmail');
  const name = localStorage.getItem('userName');
  const role = localStorage.getItem('userRole');

  if (token && email && role) {
    // set header here too, since this runs before first render
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return { token, email, name, role };
  }

  return { token: null, email: null, name: null, role: null };
});


  function handleLogin(user) {
    // Called by LoginPage when /api/auth/exchange succeeds
    setAuth(user);
    localStorage.setItem('appToken', user.token);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name ?? '');
    localStorage.setItem('userRole', user.role ?? '');
    apiClient.defaults.headers.common.Authorization = `Bearer ${user.token}`;
  }

  function handleLogout() {
    setAuth({ token: null, email: null, name: null, role: null });
    localStorage.removeItem('appToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    delete apiClient.defaults.headers.common.Authorization;
  }

  // If not authenticated, show login page full-screen
  if (!auth.token) {
    return <LoginPage onLogin={handleLogin} />;
  }
  

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
     <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        auth={auth}
        onLogout={handleLogout}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: sidebarOpen ? 240 : 70,
          transition: 'margin-left 0.25s ease',
        }}
      >
        <Header auth={auth} onLogout={handleLogout} />
        <main
          style={{
            flex: 1,
            padding: '2rem',
            backgroundColor: 'var(--color-beige)',
            overflowY: 'auto',
            fontFamily: 'var(--font-body)',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/donors/add" element={<AddDonor />} />
            <Route path="/donors/manage" element={<DonorList />} />
            <Route path="/donations/new" element={<Donation />} />
            <Route path="/donations/import" element={<AnnualImportPage />} />
            <Route path="/donations/quick" element={<QuickDonationPage />} />
            <Route path="/donations/list" element={<DonationListPage />} />

            {auth.role === 'Admin' && (
              <Route path="/admin/users" element={<AdminUsersPage />} />
            )}
            {/* add more routes later */}
          </Routes>
        </main>
      </div>
    </div>  
  );
}

export default App;