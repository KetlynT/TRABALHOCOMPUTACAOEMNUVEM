import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects')
      .then(response => {
        setProjects(response.data);
      })
      .catch(err => console.error("Erro ao buscar projetos", err));
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName) return;
    
    try {
      const response = await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      setProjects([response.data, ...projects]);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      console.error("Erro ao criar projeto", err);
    }
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard (Projetos)</h1>
        <div>
          <span>Olá, {user?.fullName}!</span>
          <button onClick={logout} style={{ marginLeft: '10px' }}>Sair</button>
        </div>
      </header>
      
      <section style={{ textAlign: 'left', margin: '20px 0' }}>
        <h2>Criar Novo Projeto</h2>
        <form onSubmit={handleCreateProject}>
          <div style={{ marginBottom: '10px' }}>
            <input 
              type="text" 
              placeholder="Nome do novo projeto"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{ width: '300px', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea
              placeholder="Descrição do projeto (opcional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              style={{ width: '300px', padding: '8px', minHeight: '60px' }}
            />
          </div>
          <button type="submit">Criar</button>
        </form>
      </section>

      <section style={{ textAlign: 'left' }}>
        <h2>Meus Projetos</h2>
        {projects.length === 0 ? (
          <p>Você ainda não tem projetos.</p>
        ) : (
          <ul>
            {projects.map(project => (
              <li key={project.id} style={{ marginBottom: '10px' }}>
                <Link to={`/project/${project.id}`}>{project.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;