import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.getProfile()
                .then(res => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await api.login(credentials);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const register = async (userData) => {
        const res = await api.register(userData);
        
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const refreshUser = async () => {
        try {
            const res = await api.getProfile();
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (error) {
            console.error("Failed to refresh user", error);
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};