import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { loginWithGoogle, user, login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    const res = await login(username, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  if (user) {
    return null; // App.jsx will redirect
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="heart-icon">❤️</div>
        <h1>Fiesta de 15</h1>
        <h2>Delfi</h2>
      </header>

      <form className="login-card card" onSubmit={handleLocalLogin}>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <div className="input-group">
          <label>Usuario</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn" type="submit">Ingresar</button>
        
        <div className="divider">O continuar con</div>

        <button className="btn google-btn" type="button" onClick={loginWithGoogle}>
          <LogIn size={20} />
          Google
        </button>

        <p style={{ marginTop: '1.5rem' }}>
          No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
