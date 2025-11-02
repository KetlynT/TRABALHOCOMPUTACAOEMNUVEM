import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function TaskModal({ taskId, onClose, onSaved }) {
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    (async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`);
        setTask(res.data.task);
        setAttachments(res.data.attachments || []);
        setTitle(res.data.task.title);
        setDescription(res.data.task.description || "");
        setStatus(res.data.task.status || "todo");
      } catch (err) {
        console.error(err);
        alert("Erro carregando task");
      }
    })();
  }, [taskId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/tasks/${taskId}`, {
        id: taskId,
        title,
        description,
        status,
        boardId: task.boardId
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Escolha um arquivo");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post(`/files/upload/${taskId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // adicionar attachment localmente
      setAttachments(prev => [...prev, res.data]);
      setFile(null);
      alert("Upload realizado");
    } catch (err) {
      console.error(err);
      alert("Erro no upload");
    }
  };

  const handleDeleteAttachment = async (id) => {
    if (!confirm("Excluir anexo?")) return;
    try {
      await api.delete(`/files/${id}`);
      setAttachments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir");
    }
  };

  if (!task) return <div>Carregando...</div>;

  return (
    <div style={{position:"fixed", left:0, right:0, top:0, bottom:0, background:"rgba(0,0,0,0.4)", display:"flex", justifyContent:"center", alignItems:"center"}}>
      <div style={{width:700, background:"#fff", padding:20, borderRadius:8}}>
        <h3>Editar Task</h3>
        <div style={{display:"grid", gridTemplateColumns:"1fr 200px", gap:12}}>
          <div>
            <label>Título</label>
            <input style={{width:"100%"}} value={title} onChange={e=>setTitle(e.target.value)} />
            <label>Descrição</label>
            <textarea style={{width:"100%", minHeight:120}} value={description} onChange={e=>setDescription(e.target.value)} />
            <label>Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <div>
              <strong>Anexos</strong>
              <div>
                {attachments.length === 0 && <div style={{fontSize:13,color:"#666"}}>Nenhum anexo</div>}
                {attachments.map(a => (
                  <div key={a.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0"}}>
                    <a href={a.filePath} target="_blank" rel="noreferrer">{a.fileName}</a>
                    <button onClick={()=>handleDeleteAttachment(a.id)}>Excluir</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginTop:12}}>
              <input type="file" onChange={e => setFile(e.target.files[0])} />
              <div style={{marginTop:6}}>
                <button onClick={handleUpload}>Upload</button>
              </div>
            </div>

            <div style={{marginTop:16}}>
              <small style={{color:"#666"}}>Criado: {new Date(task.createdAt).toLocaleString()}</small>
            </div>
          </div>
        </div>

        <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:16}}>
          <button onClick={onClose}>Fechar</button>
          <button disabled={isSaving} onClick={handleSave}>{isSaving ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}
