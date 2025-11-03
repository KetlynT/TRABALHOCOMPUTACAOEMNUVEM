import React from 'react';

function TaskCard({ task }) {
    return (
        <div className="bg-white dark:bg-gray-700 rounded-md shadow-md p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {task.title}
            </p>
        </div>
    );
}

export default TaskCard;