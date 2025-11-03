import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
    const { user } = useAuth();

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
                            <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                                Olá, {user?.name}
                            </span>
                            <ProfileDropdown />
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