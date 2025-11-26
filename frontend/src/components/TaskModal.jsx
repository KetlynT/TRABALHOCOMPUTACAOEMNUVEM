import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';

function TaskModal({ isOpen, onClose, task, onTaskDeleted, isAdmin }) {
    const [details, setDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [taskTitle, setTaskTitle] = useState(task.title);
    const [taskDescription, setTaskDescription] = useState(task.description || '');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [modalError, setModalError] = useState('');

    const fetchTaskDetails = async () => {
        if (!task) return;
        setLoading(true);
        setModalError('');
        try {
            const res = await api.getProjectDetails(task.projectId);
            const board = res.data.boards.find(b => b.id === task.boardId);
            const taskDetails = board?.tasks.find(t => t.id === task.id);
            setDetails(taskDetails || task);
            setTaskTitle(taskDetails?.title || task.title);
            setTaskDescription(taskDetails?.description || task.description || '');
        } catch (error) {
            console.error('Failed to fetch task details:', error);
            setModalError('Falha ao carregar detalhes da tarefa.');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        if (!task) return;
        try {
            const res = await api.getTaskComments(task.id);
            setComments(res.data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTaskDetails();
            fetchComments();
        }
    }, [isOpen, task]);

    const handleUpdateTask = async (field, value) => {
        if (field === 'title' && !value.trim()) {
            setTaskTitle(details.title);
            return;
        }
        
        try {
            await api.updateTask(task.id, { [field]: value });
            if (field === 'title') setTaskTitle(value);
            if (field === 'description') setTaskDescription(value);
            
            onTaskDeleted();
        } catch (error) {
            console.error('Failed to update task:', error);
            setModalError('Falha ao atualizar tarefa.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.addCommentToTask(task.id, { content: newComment });
            setNewComment('');
            fetchComments();
            onTaskDeleted();
        } catch (error) {
            console.error('Failed to add comment:', error);
            setModalError('Falha ao adicionar comentário.');
        }
    };

    const handleDeleteClick = () => {
        setModalError('');
        if (isAdmin) {
            setIsDeleteConfirmOpen(true);
        } else {
            setModalError(`Apenas administradores podem excluir esta tarefa.`);
        }
    };

    const confirmDeleteTask = async () => {
        try {
            await api.deleteTask(task.id);
            setIsDeleteConfirmOpen(false);
            onTaskDeleted();
            onClose();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Erro ao excluir tarefa.');
            setIsDeleteConfirmOpen(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'medium'
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                onClick={onClose}
            >
                <div 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {loading ? (
                        <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
                    ) : (
                        <>
                            {modalError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{modalError}</div>}
                            
                            <input
                                type="text"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                onBlur={(e) => handleUpdateTask('title', e.target.value)}
                                className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 mb-4"
                            />

                            <textarea
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                onBlur={(e) => handleUpdateTask('description', e.target.value)}
                                placeholder="Adicionar descrição..."
                                className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm mb-6"
                            />

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Comentários</h3>
                                <form onSubmit={handleCommentSubmit} className="mb-4">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Escrever um comentário..."
                                        className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm mb-2"
                                    />
                                    <button
                                        type="submit"
                                        className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                    >
                                        Salvar Comentário
                                    </button>
                                </form>
                                <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {comments.length > 0 ? (
                                        comments.map(comment => (
                                            <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                                    {comment.authorName || comment.userName || 'Usuário'}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatTimestamp(comment.createdAt)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">Nenhum comentário ainda.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleDeleteClick}
                                    className={`py-2 px-4 text-white rounded-md text-sm ${
                                        isAdmin
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-red-400 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Excluir Tarefa
                                </button>
                                <button
                                    onClick={onClose}
                                    className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                                >
                                    Fechar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDeleteTask}
                title="Excluir Tarefa"
                message={`Você tem certeza que deseja excluir a tarefa '${taskTitle}'?`}
                confirmText="Excluir"
            />
        </>
    );
}

export default TaskModal;