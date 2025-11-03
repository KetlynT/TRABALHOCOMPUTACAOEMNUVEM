import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.getProjects();
            setProjects(res.data);
            setError('');
        } catch (err) {
            setError('Falha ao carregar projetos.');
            if (err.response && err.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) {
            setError('O nome do projeto não pode estar vazio.');
            return;
        }
        try {
            const res = await api.createProject({ name: newProjectName });
            setNewProjectName('');
            setError('');
            navigate(`/project/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar projeto.');
        }
    };

    const handleJoinProject = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) {
            setError('O código de convite não pode estar vazio.');
            return;
        }
        try {
            const res = await api.joinProject(joinCode);
            setJoinCode('');
            setError('');
            navigate(`/project/${res.data.projectId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao entrar no projeto. Verifique o código.');
        }
    };

    return (
        <div className="container mx-auto p-6">

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Criar Novo Projeto</h2>
                    <form onSubmit={handleCreateProject}>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome do Projeto
                        </label>
                        <input
                            type="text"
                            id="projectName"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="submit"
                            className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Criar Projeto
                        </button>
                    </form>
                </div>
                
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Entrar em um Projeto</h2>
                    <form onSubmit={handleJoinProject}>
                        <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Código de Convite
                        </label>
                        <input
                            type="text"
                            id="joinCode"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="submit"
                            className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Seus Projetos</h2>
                {loading ? (
                    <p className="text-gray-700 dark:text-gray-300">Carregando projetos...</p>
                ) : (
                    <div className="space-y-4">
                        {projects.length > 0 ? (
                            projects.map(project => (
                                <Link
                                    key={project.id}
                                    to={`/project/${project.id}`}
                                    className="block p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md shadow-sm transition-colors"
                                >
                                    <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">{project.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Membros: {project.memberCount}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">
                                Você ainda não faz parte de nenhum projeto. Crie um ou entre com um código de convite.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;