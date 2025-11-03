import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. CHAMA O REGISTRO E ESPERA A RESPOSTA
            await register(fullName, email, password);
            
            // 2. SE DEU CERTO (não deu erro), REDIRECIONA
            navigate('/login', { state: { message: 'Registro bem-sucedido! Faça o login.' } });

        } catch (err) {
            // 3. SE DEU ERRO, MOSTRA A MENSAGEM
            console.error("Registration failed:", err);
            
            let errorMsg = 'Falha no registro. Tente novamente.';
            
            if (err.response?.data && Array.isArray(err.response.data)) {
                // Erros de validação do ASP.NET Identity (ex: senha fraca)
                errorMsg = err.response.data.map(e => e.description || e.code).join(' ');
            } else if (err.response?.data?.message) {
                // Outras mensagens de erro
                errorMsg = err.response.data.message;
            }

            // Traduções (opcional, mas bom)
            if (errorMsg.includes('Passwords must have at least one non-alphanumeric')) {
                errorMsg = 'A senha deve ter pelo menos um caractere especial (ex: !@#$).';
            } else if (errorMsg.includes('Passwords must have at least one uppercase')) {
                errorMsg = 'A senha deve ter pelo menos uma letra maiúscula.';
            } else if (errorMsg.includes('is already taken')) {
                errorMsg = 'Este email ou nome de usuário já está em uso.';
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                    Criar Nova Conta
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        {error}
                    </div>
                )}
                
                <form className="space-y-6" onSubmit={handleSubmit}>
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
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Endereço de Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Registrando...' : 'Registrar'}
                        </button>
                    </div>
                </form>
                
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;