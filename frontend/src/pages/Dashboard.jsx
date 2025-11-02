import React, { useEffect, useState } from "react";
import api from "../services/api";
import Board from "../components/Board";

export default function Dashboard(){
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
      if (res.data.length && !selected) setSelected(res.data[0]);
      if (selected) {
        // refresh selected
        const sel = res.data.find(p => p.id === selected.id);
        if (sel) setSelected(sel);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(()=>{ fetchProjects(); }, []);

  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      <div style={{display:"flex", gap:20}}>
        <div style={{width:200}}>
          <h3>Projetos</h3>
          {projects.map(p => <div key={p.id} style={{cursor:"pointer"}} onClick={()=>setSelected(p)}>{p.name}</div>)}
        </div>
        <div style={{flex:1}}>
          {selected ? <Board project={selected} refreshProject={fetchProjects} /> : <div>Selecione um projeto</div>}
        </div>
      </div>
    </div>
  );
}
