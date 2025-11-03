import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Board from '../components/Board';
import { DragDropContext } from 'react-beautiful-dnd';
import ConfirmModal from '../components/ConfirmModal';

function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchProject = async () => {
        try {
            setLoading(true);
            const res = await api.getProjectDetails(projectId);
            setProject(res.data);
            setError('');
        } catch (err) {
            setError('Falha ao carregar projeto.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceBoard = project.boards.find(b => b.id.toString() === source.droppableId);
        const destBoard = project.boards.find(b => b.id.toString() === destination.droppableId);
        const task = sourceBoard.tasks.find(t => t.id.toString() === draggableId);

        const optimisticProject = { ...project };
        const sourceTasks = [...sourceBoard.tasks];
        sourceTasks.splice(source.index, 1);
        optimisticProject.boards.find(b => b.id.toString() === source.droppableId).tasks = sourceTasks;

        const destTasks = source.droppableId === destination.droppableId 
            ? sourceTasks 
            : [...destBoard.tasks];
        destTasks.splice(destination.index, 0, task);
        optimisticProject.boards.find(b => b.id.toString() === destination.droppableId).tasks = destTasks;
        
        setProject(optimisticProject);

        try {
            await api.reorderTasks({
                taskId: task.id,
                sourceBoardId: source.droppableId,
                destinationBoardId: destination.droppableId,
                sourceIndex: source.index,
                destinationIndex: destination.index
            });
            fetchProject();
        } catch (error) {
            setError('Falha ao mover tarefa.');
            fetchProject();
        }
    };

    const handleGenerateCode = async () => {
        try {
            const res = await api.generateInviteCode(projectId);
            setProject(prev => ({ ...prev, inviteCode: res.data.inviteCode }));
        } catch (err) {
            setError('Falha ao gerar código de convite.');
        }
    };

    const confirmDeleteProject = async () => {
        try {
            await api.deleteProject(projectId);
            setIsDeleteModalOpen(false);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao excluir projeto.');
            setIsDeleteModalOpen(false);
        }
    };

    const handlePromote = async (userId) => {
        try {
            await api.promoteMember(projectId, userId);
            fetchProject();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao promover membro.');
        }
    };

    const handleDemote = async (userId) => {
        try {
            await api.demoteMember(projectId, userId);
            fetchProject();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao rebaixar membro.');
        }
    };

    if (loading) {
        return <div className="container mx-auto p-6 text-center text-gray-700 dark:text-gray-300">Carregando...</div>;
    }
    if (error) {
        return <div className="container mx-auto p-6 text-center text-red-500">{error}</div>;
    }
    if (!project) {
        return <div className="container mx-auto p-6 text-center text-gray-700 dark:text-gray-300">Projeto não encontrado.</div>;
    }

    return (
        <>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteProject}
                title="Excluir Projeto"
                message={`Você tem certeza que deseja excluir o projeto '${project.name}'? Esta ação é irreversível e todas as tarefas e quadros associados serão perdidos.`}
                confirmText="Excluir Projeto"
            />
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {project.name}
                        </h1>
                        <div className="flex items-center mt-2">
                            <p className="text-gray-600 dark:text-gray-400">
                                Código de Convite: 
                                <span className="font-semibold text-gray-800 dark:text-gray-200 ml-2 py-1 px-3 bg-gray-200 dark:bg-gray-700 rounded-md">
                                    {project.inviteCode || 'N/A'}
                                </span>
                            </p>
                            {project.isAdmin && (
                                <button
                                    onClick={handleGenerateCode}
                                    className="ml-3 py-1 px-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100 rounded-md text-sm hover:bg-indigo-200 dark:hover:bg-indigo-600"
                                >
                                    {project.inviteCode ? 'Gerar Novo' : 'Gerar Código'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link 
                            to={`/project/${projectId}/activity`}
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Histórico de Atividades
                        </Link>
                        <button
                            onClick={() => {
                                if (project.isAdmin) {
                                    setIsDeleteModalOpen(true);
                                } else {
                                    setError(`Apenas administradores podem excluir o projeto.`);
                                }
                            }}
                            className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
                                project.isAdmin
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-red-400 opacity-50 cursor-not-allowed'
                            }`}
                        >
                            Excluir Projeto
                        </button>
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex space-x-4 overflow-x-auto pb-4 mb-8">
                        {project.boards.map(board => (
                            <Board 
                                key={board.id} 
                                board={board} 
                                onTaskAdded={fetchProject} 
                                isAdmin={project.isAdmin}
                            />
                        ))}
                    </div>
                </DragDropContext>

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        Membros do Projeto
                    </h2>
                    <div className="space-y-3">
                        {project.members.map(member => (
                            <div key={member.userId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{member.fullName}</span>
                                    {member.userId === project.creatorId && (
                                        <span className="ml-2 text-xs py-0.5 px-2 bg-blue-200 text-blue-800 rounded-full">Criador</span>
                                    )}
                                    {member.isAdmin && (
                                        <span className="ml-2 text-xs py-0.5 px-2 bg-green-200 text-green-800 rounded-full">Admin</span>
                                    )}
                                </div>
                                {project.isAdmin && member.userId !== project.creatorId && (
                                    <div className="flex gap-2">
                                        {!member.isAdmin ? (
                                            <button
                                                onClick={() => handlePromote(member.userId)}
                                                className="py-1 px-3 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                                            >
                                                Promover
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDemote(member.userId)}
                                                className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600"
                                            >
                                                Rebaixar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProjectPage;