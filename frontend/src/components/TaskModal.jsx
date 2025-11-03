import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function TaskModal({ task, onClose, onTaskUpdate }) {
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [editableTitle, setEditableTitle] = useState(task.title);
  const [editableDesc, setEditableDesc] = useState('');
  const [editableDueDate, setEditableDueDate] = useState('');

  useEffect(() => {
    if (task) {
      fetchTaskDetails();
      fetchComments();
    }
  }, [task]);

  const fetchTaskDetails = async () => {
    try {
      const res = await api.get(`/tasks/${task.id}`);
      setDetails(res.data);
      setEditableTitle(res.data.title);
      setEditableDesc(res.data.description || '');
      setEditableDueDate(res.data.dueDate ? res.data.dueDate.split('T')[0] : '');
    } catch (err) {
      console.error("Erro ao buscar detalhes da tarefa", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tasks/${task.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Erro ao buscar comentários", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${task.id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments(); 
    } catch (err) {
      console.error("Erro ao adicionar comentário", err);
    }
  };

  const handleDetailsSave = async () => {
    try {
      const updatedTask = {
        title: editableTitle,
        description: editableDesc,
        dueDate: editableDueDate || null
      };
      const res = await api.put(`/tasks/${task.id}`, updatedTask);
      onTaskUpdate(res.data); 
      onClose();
    } catch (err) {
      console.error("Erro ao salvar detalhes", err);
    }
  };

  if (!task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <>
            <input 
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              style={{ fontSize: '1.5em', fontWeight: 'bold', border: 'none', padding: 0 }}
            />
            
            <div>
              <label>Descrição</label>
              <textarea
                value={editableDesc}
                onChange={(e) => setEditableDesc(e.target.value)}
                placeholder="Adicione uma descrição..."
                rows={4}
              />
            </div>

            <div>
              <label>Data de Entrega</label>
              <input
                type="date"
                value={editableDueDate}
                onChange={(e) => setEditableDueDate(e.target.value)}
              />
            </div>
            
            <button onClick={handleDetailsSave} style={{ marginTop: '10px' }}>Salvar Alterações</button>

            <hr style={{ margin: '20px 0' }} />

            <h3>Comentários</h3>
            <div className="comment-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment">
                  <strong>{comment.authorName}</strong>
                  <p>{comment.content}</p>
                  <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                rows={3}
                style={{ marginTop: '10px' }}
              />
              <button type="submit">Enviar Comentário</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default TaskModal;