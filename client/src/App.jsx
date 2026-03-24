import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import Admin from './pages/Admin';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const { user, loading, isDemo } = useContext(AuthContext);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <Router>
      <div className="app-container">
        {(user || isDemo) && <Navbar />}
        <main className="content">
          <Routes>
            {!user && !isDemo ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Gallery />} />
                <Route path="/upload" element={<Upload />} />
                <Route 
                  path="/admin" 
                  element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/" />} 
                />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/register" element={<Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
