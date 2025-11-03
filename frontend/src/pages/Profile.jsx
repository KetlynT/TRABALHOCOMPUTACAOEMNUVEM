import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('A nova senha e a confirmação não correspondem.');
            return;
        }

        try {
            const res = await api.changePassword(passwordData);
            setMessage(res.data.message || 'Senha alterada com sucesso!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(' ') 
                : (err.response?.data?.message || 'Erro ao alterar a senha.');
            setError(errorMsg);
        }
    };

    const handleDeleteAccount = async () => {
        setMessage('');
        setError('');
        
        try {
            const res = await api.checkSoleAdmin();
            if (res.data.isSoleAdmin) {
                setDeleteMessage(
                    'Você tem certeza absoluta que deseja excluir? Você é o único administrador em um ou mais projetos. Excluir sua conta irá inutilizar esses projetos, pois ninguém mais poderá gerenciá-los ou excluí-los.'
                );
            } else {
                setDeleteMessage(
                    'Você tem certeza que deseja excluir sua conta? Esta ação é irreversível. Seus dados de acesso serão removidos, mas suas atividades nos projetos serão mantidas no histórico.'
                );
            }
            setIsConfirmModalOpen(true);
        } catch (err) {
            setError('Erro ao verificar status de administrador. Tente novamente.');
        }
    };
    
    const confirmDeleteAccount = async () => {
        try {
            await api.deleteAccount();
            setIsConfirmModalOpen(false);
            logout();
            navigate('/login', { state: { message: 'Conta excluída com sucesso.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao excluir a conta.');
            setIsConfirmModalOpen(false);
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDeleteAccount}
                title="Excluir Conta Permanentemente"
                message={deleteMessage}
                confirmText="Excluir Permanentemente"
            />

            <div className="container mx-auto p-6 max-w-2xl">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                    Perfil e Configurações
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Olá, {user?.fullName || 'Usuário'}
                </p>

                {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        Alterar Senha
                    </h2>
                    <form onSubmit={handleSubmitPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="oldPassword">
                                Senha Atual
                            </label>
                            <input
                                type="password"
                                name="oldPassword"
                                id="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="newPassword">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Salvar Alterações
                        </button>
                    </form>
                </div>

                <div className="bg-red-50 dark:bg-gray-800 border border-red-400 dark:border-red-700 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-red-900 dark:text-red-200">
                        Zona de Perigo
                    </h2>
                    <p className="text-red-700 dark:text-red-300 mb-4">
                        A exclusão da sua conta é permanente e não pode ser revertida. Seus dados de acesso serão removidos.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Excluir Minha Conta Permanentemente
                    </button>
                </div>
            </div>
        </>
    );
}

export default Profile;