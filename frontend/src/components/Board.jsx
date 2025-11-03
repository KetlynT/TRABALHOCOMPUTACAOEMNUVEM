import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import api from '../services/api';

function Board({ board, onTaskAdded }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            await api.createTask({
                title: newTaskTitle,
                boardId: board.id
            });
            setNewTaskTitle('');
            onTaskAdded();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseTaskModal = () => {
        setSelectedTask(null);
        onTaskAdded();
    };

    return (
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 w-80 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {board.name} ({board.tasks.length})
            </h3>

            <Droppable droppableId={board.id.toString()}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-gray-300 dark:bg-gray-700' : ''} transition-colors rounded-md p-2`}
                    >
                        {board.tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => handleTaskClick(task)}
                                    >
                                        <TaskCard task={task} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            <form onSubmit={handleCreateTask} className="mt-4">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nova tarefa..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                />
                <button
                    type="submit"
                    className="w-full mt-2 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                    Adicionar Tarefa
                </button>
            </form>

            {selectedTask && (
                <TaskModal
                    isOpen={!!selectedTask}
                    onClose={handleCloseTaskModal}
                    task={selectedTask}
                />
            )}
        </div>
    );
}

export default Board;