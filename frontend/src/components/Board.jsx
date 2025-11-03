import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

function BoardColumn({ board, onTaskClick }) {
  return (
    <div className="board-column">
      <h3>{board.name}</h3>
      <Droppable droppableId={board.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="tasks-list"
            style={{
              backgroundColor: snapshot.isDraggingOver ? '#e0e0e0' : '#f4f5f7',
            }}
          >
            {board.tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                onClick={onTaskClick} 
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default BoardColumn;