import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div>
                    <Link 
                        to="/" 
                        className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400">
                        Meu Kanban
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-gray-700 dark:text-gray-300">
                                Olá, {user?.fullname}
                            </span>
                            <Link 
                                to="/profile" 
                                className="text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400">
                                Perfil
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link 
                            to="/login" 
                            className="text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;