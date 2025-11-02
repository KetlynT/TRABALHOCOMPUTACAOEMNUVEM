import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
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

  const handleCreateTask = async (e, boardId) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    
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

  if (loading) return <div>Carregando projeto...</div>;
  if (!project) return <div>Projeto não encontrado.</div>;

  return (
    <div className="project-page">
      <Link to="/">&larr; Voltar para o Dashboard</Link>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      
      <div className="kanban-boards">
        {project.boards.map(board => (
          <div key={board.id} className="board">
            <h3>{board.name}</h3>
            
            {/* Lista de Tarefas */}
            {board.tasks.map(task => (
              <div key={task.id} className="task-card">
                {task.title}
              </div>
            ))}
            
            {/* Formulário para criar nova tarefa */}
            <form onSubmit={(e) => handleCreateTask(e, board.id)}>
              <input 
                type="text" 
                placeholder="Nova tarefa..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)} 
              />
              <button type="submit">+</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectPage;