import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ActivityLogPage() {
    const { projectId } = useParams();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const res = await api.getProjectActivity(projectId);
                setActivities(res.data);
            } catch (err) {
                setError('Falha ao carregar atividades.');
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [projectId]);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'medium'
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Histórico de Atividades do Projeto
            </h1>
            
            <div className="mb-6">
                <Link 
                    to={`/project/${projectId}`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    &larr; Voltar para o Quadro
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                {loading && <p className="text-gray-700 dark:text-gray-300">Carregando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!loading && !error && (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activities.length > 0 ? (
                            activities.map(activity => (
                                <li key={activity.id} className="py-4">
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {activity.description}
                                    </p>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {activity.userName || '[Usuário excluído]'}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mx-2">&bull;</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatTimestamp(activity.timestamp)}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">
                                Nenhuma atividade registrada para este projeto.
                            </p>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ActivityLogPage;