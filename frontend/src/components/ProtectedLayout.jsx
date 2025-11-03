import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

function ProtectedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet /> {/* Aqui é onde Dashboard, ProjectPage, etc., serão renderizados */}
      </main>
      <Footer />
    </div>
  );
}

export default ProtectedLayout;