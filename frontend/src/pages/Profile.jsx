import React from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h1>Meu Perfil</h1>
      <div style={{ padding: '20px', background: '#f4f5f7', color: '#172b4d', borderRadius: '8px' }}>
        <p>
          <strong>Nome Completo:</strong> {user.fullName}
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>
    </div>
  );
}

export default Profile;