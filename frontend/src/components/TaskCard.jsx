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
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4 cursor-pointer hover:shadow-lg"
                        onClick={openModal}
                    >
                        <p className="text-gray-900 dark:text-gray-100">{task.title}</p>
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