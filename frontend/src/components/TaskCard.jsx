import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import TaskModal from './TaskModal';

function TaskCard({ task, index, onTaskDeleted, isAdmin }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <Draggable draggableId={task.id.toString()} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : 'hover:shadow-md'
                        }`}
                        onClick={openModal}
                    >
                        <p className="text-sm text-gray-900 dark:text-gray-100">{task.title}</p>
                    </div>
                )}
            </Draggable>

            <TaskModal
                isOpen={isModalOpen}
                onClose={closeModal}
                task={task}
                onTaskDeleted={onTaskDeleted}
                isAdmin={isAdmin}
            />
        </>
    );
}

export default TaskCard;