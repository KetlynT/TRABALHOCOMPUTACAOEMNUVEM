import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicLayout = () => {
    const { user } = useAuth();
    
    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen">
            <Outlet />
        </div>
    );
};

export default PublicLayout;