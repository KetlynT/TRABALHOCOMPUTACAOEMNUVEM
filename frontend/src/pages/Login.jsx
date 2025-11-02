import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handle(e){
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch(err) {
      alert("Erro ao logar. Use qualquer email e senha 'password' no dev.");
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={handle}>
        <div>
          <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
