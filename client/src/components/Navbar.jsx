import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Camera, Image, User, Settings, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isDemo } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-item">
        <Image size={24} />
        <span>Galería</span>
      </Link>
      <Link to="/upload" className="nav-item">
        <div className="upload-btn">
          <Camera size={28} color="white" />
        </div>
      </Link>
      {user && user.role === 'admin' && (
        <Link to="/admin" className="nav-item">
          <Settings size={24} />
          <span>Admin</span>
        </Link>
      )}
      <button onClick={logout} className="nav-item logout-btn" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LogOut size={24} />
        <span>Salir</span>
      </button>
    </nav>
  );
};

export default Navbar;
