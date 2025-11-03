import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ActivityLogPage() {
  const { id } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${id}/activity`)
      .then(response => {
        setActivities(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar atividades", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Carregando atividades...</div>;

  return (
    <div style={{ textAlign: 'left', width: '100%' }}>
      <Link to={`/project/${id}`}>&larr; Voltar para o Projeto</Link>
      <h1>Histórico de Atividades</h1>
      
      {activities.length === 0 ? (
        <p>Nenhuma atividade registrada para este projeto.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {activities.map(activity => (
            <li key={activity.id} style={{ marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
              <p>{activity.description}</p>
              <small style={{ color: '#aaa' }}>
                Por: {activity.userName} em {new Date(activity.timestamp).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActivityLogPage;