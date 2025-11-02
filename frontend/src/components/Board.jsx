import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../services/api";

export default function Board({ project, refreshProject }) {
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const destBoardId = result.destination.droppableId;
    const destIndex = result.destination.index;

    // enviar para backend
    try {
      await api.post("/tasks/reorder", {
        taskId,
        destinationBoardId: destBoardId,
        destinationIndex: destIndex
      });
      await refreshProject(); // re-fetch projeto (implementar)
    } catch (err) {
      console.error(err);
      alert("Erro ao mover task");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{display:"flex", gap:10}}>
        {project.boards.map(board => (
          <Droppable droppableId={board.id} key={board.id}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                   style={{minWidth:250, background:"#f5f5f5", padding:10, borderRadius:6, minHeight:200}}>
                <h4>{board.name}</h4>
                {board.tasks && board.tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div style={{background:"#fff", padding:8, borderRadius:6, marginBottom:8}}>
                          <strong>{task.title}</strong>
                          <div style={{fontSize:12, color:"#666"}}>{task.description}</div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
