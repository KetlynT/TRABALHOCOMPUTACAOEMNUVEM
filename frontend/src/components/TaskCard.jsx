import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

function TaskCard({ task, index, onClick }) {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="task-card"
          onClick={() => onClick(task)}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? '#e6f7ff' : '#ffffff',
          }}
        >
          {task.title}
        </div>
      )}
    </Draggable>
  );
}

export default TaskCard;