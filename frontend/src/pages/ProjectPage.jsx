import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import api from '../services/api';
import BoardColumn from '../components/Board';
import TaskModal from '../components/TaskModal';

function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProject = useCallback(() => {
    setLoading(true);
    api.get(`/projects/${id}`)
      .then(response => {
        setProject(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar projeto", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleCreateTask = async (e, boardId) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const response = await api.post('/tasks', {
        title: newTaskTitle,
        boardId: boardId
      });
      
      const newTask = response.data;
      setProject(prevProject => {
          const updatedBoards = prevProject.boards.map(board => {
              if (board.id === boardId) {
                  return { ...board, tasks: [...board.tasks, newTask] };
              }
              return board;
          });
          return { ...prevProject, boards: updatedBoards };
      });
      
      setNewTaskTitle('');
    } catch (err) {
      console.error("Erro ao criar tarefa", err);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceBoard = project.boards.find(b => b.id === source.droppableId);
    const destBoard = project.boards.find(b => b.id === destination.droppableId);
    const task = sourceBoard.tasks.find(t => t.id === draggableId);

    if (!sourceBoard || !destBoard || !task) return;

    const newSourceTasks = Array.from(sourceBoard.tasks);
    newSourceTasks.splice(source.index, 1);

    const newDestTasks = (source.droppableId === destination.droppableId)
      ? newSourceTasks
      : Array.from(destBoard.tasks);
      
    newDestTasks.splice(destination.index, 0, task);

    setProject(prevProject => {
      const newBoards = prevProject.boards.map(board => {
        if (board.id === source.droppableId) {
          return { ...board, tasks: newSourceTasks };
        }
        if (board.id === destination.droppableId) {
          return { ...board, tasks: newDestTasks };
        }
        return board;
      });
      return { ...prevProject, boards: newBoards };
    });

    api.post('/tasks/reorder', {
      taskId: draggableId,
      sourceBoardId: source.droppableId,
      destinationBoardId: destination.droppableId,
      destinationIndex: destination.index
    }).catch(err => {
      console.error("Erro ao reordenar", err);
      fetchProject();
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  
  const handleTaskUpdate = (updatedTask) => {
    setProject(prevProject => {
        const newBoards = prevProject.boards.map(board => {
            const newTasks = board.tasks.map(task => 
                task.id === updatedTask.id ? { ...task, ...updatedTask } : task
            );
            return { ...board, tasks: newTasks };
        });
        return { ...prevProject, boards: newBoards };
    });
  };

  if (loading) return <div>Carregando projeto...</div>;
  if (!project) return <div>Projeto não encontrado.</div>;

  return (
    <div className="project-page" style={{ width: '100%', textAlign: 'left' }}>
      <div className="page-header">
        <Link to="/">&larr; Voltar para o Dashboard</Link>
        <Link to={`/project/${id}/activity`} className="activity-link">Ver Atividades</Link>
      </div>

      <h1>{project.name}</h1>
      <p>{project.description}</p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-boards">
          {project.boards.map(board => (
            <div key={board.id} style={{ flexShrink: 0 }}>
              <BoardColumn 
                board={board} 
                onTaskClick={handleTaskClick} 
              />
              <form onSubmit={(e) => handleCreateTask(e, board.id)} style={{ padding: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Nova tarefa..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
                <button type="submit" style={{ marginTop: '4px' }}>Adicionar</button>
              </form>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {isModalOpen && (
        <TaskModal 
          task={selectedTask} 
          onClose={handleCloseModal}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}

export default ProjectPage;