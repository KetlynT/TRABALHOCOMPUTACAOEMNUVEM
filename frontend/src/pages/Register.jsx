import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(fullName, username, email, password);
      navigate('/login');
    } catch (err) {
      setError('Falha ao registrar. Tente novamente.');
    }
  };

  return (
    <div className="auth-page">
      <div>
        <h2>Registrar</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nome Completo</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label>Usuário</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Registrar</button>
        </form>
        <p>Já tem uma conta? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;