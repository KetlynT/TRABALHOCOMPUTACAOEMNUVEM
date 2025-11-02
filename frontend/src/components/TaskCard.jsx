import React, { useState } from "react";
import TaskModal from "./TaskModal";

export default function TaskCard({ task, onUpdated }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={{background:"#fff", padding:8, borderRadius:6, marginBottom:8, boxShadow:"0 1px 2px rgba(0,0,0,0.06)", cursor:"pointer"}}
           onDoubleClick={() => setOpen(true)}>
        <strong>{task.title}</strong>
        <div style={{fontSize:12, color:"#666"}}>{task.description}</div>
        <div style={{fontSize:11, color:"#888"}}>Status: {task.status}</div>
      </div>
      {open && <TaskModal taskId={task.id} onClose={() => { setOpen(false); if(onUpdated) onUpdated(); }} onSaved={() => { if(onUpdated) onUpdated(); }} />}
    </>
  );
}
