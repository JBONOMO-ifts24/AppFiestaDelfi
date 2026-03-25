import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Admin = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/photos`, { withCredentials: true });
      setPhotos(res.data);
    } catch (err) {
      console.error('Error fetching admin photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/api/admin/photos/${id}`, { status }, { withCredentials: true });
      fetchPhotos();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="admin-page">
      <h1>Panel de Moderación</h1>
      
      <div className="admin-list">
        {loading ? <p>Cargando fotos...</p> : 
          photos.map(photo => (
            <div key={photo.id} className="admin-card card">
              <div className="admin-info">
                <h3>Subida por: {photo.uploader_name}</h3>
                <p>Categoría: {photo.category}</p>
                <p className={`status ${photo.status}`}>Estado: {photo.status}</p>
              </div>
              <div className="admin-actions">
                <button 
                  className={`btn ${photo.status === 'approved' ? 'hide-btn' : 'approve-btn'}`}
                  onClick={() => updateStatus(photo.id, photo.status === 'approved' ? 'hidden' : 'approved')}
                >
                  {photo.status === 'approved' ? 'Ocultar' : 'Aprobar'}
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Admin;
