import React, { useState, useEffect } from 'react';
import { useParams, Link }from 'react-router-dom';
import api from '../services/api';
import Board from '../components/Board';
import { DragDropContext } from 'react-beautiful-dnd';

function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {project.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Código de Convite: 
                        <span className="font-semibold text-gray-800 dark:text-gray-200 ml-2 py-1 px-3 bg-gray-200 dark:bg-gray-700 rounded-md">
                            {project.inviteCode}
                        </span>
                    </p>
                </div>
                <Link 
                    to={`/project/${projectId}/activity`}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Histórico de Atividades
                </Link>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {project.boards.map(board => (
                        <Board key={board.id} board={board} onTaskAdded={fetchProject} />
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

export default ProjectPage;