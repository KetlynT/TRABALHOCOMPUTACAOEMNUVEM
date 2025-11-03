import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As senhas não conferem.');
            return;
        }
        
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            await api.register({ fullName, email, password });
            setSuccess('Registro bem-sucedido! Você será redirecionado para o login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data && Array.isArray(err.response.data)) {
                const errorMessages = err.response.data.map(e => e.description).join(' ');
                setError(errorMessages);
            } else if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Falha ao registrar. Tente novamente.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
                    Criar Conta
                </h2>
                
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-md">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 text-sm text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-md">
                        {success}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label 
                            htmlFor="fullName" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Nome Completo
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label 
                            htmlFor="password" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label 
                            htmlFor="confirmPassword" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Confirmar Senha
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Registrar
                        </button>
                    </div>
                </form>

                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;