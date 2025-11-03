import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import api from '../services/api';

function Board({ board, onTaskAdded, isAdmin }) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            await api.createTask({
                title: newTaskTitle,
                boardId: board.id,
            });
            setNewTaskTitle('');
            setIsAddingTask(false);
            onTaskAdded();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md w-72 flex-shrink-0">
            <h3 className="text-lg font-semibold p-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                {board.name}
            </h3>
            <Droppable droppableId={board.id.toString()}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="p-4 space-y-3 min-h-[100px]"
                    >
                        {board.tasks.map((task, index) => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                index={index} 
                                onTaskDeleted={onTaskAdded}
                                isAdmin={isAdmin}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                {isAddingTask ? (
                    <form onSubmit={handleAddTask}>
                        <textarea
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Digite o título da tarefa..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div className="flex items-center justify-end space-x-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingTask(false)}
                                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                            >
                                Adicionar
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAddingTask(true)}
                        className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                        + Adicionar uma tarefa
                    </button>
                )}
            </div>
        </div>
    );
}

export default Board;