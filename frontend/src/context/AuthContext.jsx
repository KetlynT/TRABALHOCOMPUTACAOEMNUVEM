import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        const userId = localStorage.getItem('userId');

        if (token && userName && userId) {
            setUser({ name: userName, id: userId });
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const res = await api.login(credentials);
            const { token, userName, userId } = res.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('userName', userName);
            localStorage.setItem('userId', userId);
            
            setUser({ name: userName, id: userId });
            
            navigate('/');
        } catch (error) {
            console.error('Falha no login:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);