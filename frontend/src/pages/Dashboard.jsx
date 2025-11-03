import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

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
      setError('');
    } catch (err) {
      console.error("Erro ao criar projeto", err);
      setError("Erro ao criar projeto.");
    }
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    
    try {
      const response = await api.post('/projects/join', { inviteCode: joinCode });
      setProjects([response.data, ...projects]);
      setJoinCode('');
      setError('');
    } catch (err) {
      console.error("Erro ao entrar no projeto", err);
      const errorMsg = err.response?.data?.Message || "Código inválido ou erro ao entrar.";
      setError(errorMsg);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        <section style={{ textAlign: 'left', margin: '20px 0', flex: 1 }}>
          <h2>Criar Novo Projeto</h2>
          <form onSubmit={handleCreateProject}>
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Nome do novo projeto"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Descrição do projeto (opcional)"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                style={{ width: '100%', padding: '8px', minHeight: '60px', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit">Criar</button>
          </form>
        </section>

        <section style={{ textAlign: 'left', margin: '20px 0', flex: 1 }}>
          <h2>Participar de um Projeto</h2>
          <form onSubmit={handleJoinProject}>
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Insira o código do convite"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit">Entrar</button>
          </form>
        </section>
      </div>

      <section style={{ textAlign: 'left', marginTop: '20px' }}>
        <h2>Meus Projetos</h2>
        {projects.length === 0 ? (
          <p>Você ainda não tem projetos.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {projects.map(project => (
              <li key={project.id} style={{ marginBottom: '10px', background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
                <Link to={`/project/${project.id}`} style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                  {project.name}
                </Link>
                {project.isOwner && <span style={{ marginLeft: '10px', background: '#007bff', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em' }}>Dono</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;