import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css'; // Reusing styles

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(formData);
    if (res.success) {
      alert('Registro exitoso! Ya puedes ingresar.');
      navigate('/login');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="login-page">
      <h1>Crear Cuenta</h1>
      <form className="login-card card" onSubmit={handleSubmit}>
        {error && <p className="status hidden">{error}</p>}
        <div className="input-group">
          <label>Nombre</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div className="input-group">
          <label>Apellido</label>
          <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        </div>
        <div className="input-group">
          <label>Usuario</label>
          <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
        </div>
        <div className="input-group">
          <label>Email (Opcional)</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="input-group">
          <label>Contraseña</label>
          <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        </div>
        <button className="btn" type="submit">Registrarse</button>
        <p style={{ marginTop: '1rem' }}>Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link></p>
      </form>
    </div>
  );
};

export default Register;
