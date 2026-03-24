import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Gallery.css';

const Gallery = () => {
  const { isDemo, user } = useContext(AuthContext);
  const [filter, setFilter] = useState('Todos');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ['Todos', 'Entrada', 'Vals', 'Carioca'];

  useEffect(() => {
    if (isDemo) {
      setPhotos([
        { id: 1, drive_id: 'mock1', category: 'Entrada', uploader_name: 'Delfi', avg_score: 5 },
        { id: 2, drive_id: 'mock2', category: 'Vals', uploader_name: 'Pablo', avg_score: 4 },
        { id: 3, drive_id: 'mock3', category: 'Carioca', uploader_name: 'Santi', avg_score: 4.5 },
      ]);
      setLoading(false);
      return;
    }
    const fetchPhotos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/photos');
        setPhotos(res.data);
      } catch (err) {
        console.error('Error fetching photos');
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const handleRate = async (photoId, score) => {
    try {
      await axios.post(`http://localhost:5000/api/photos/${photoId}/rate`, { score }, { withCredentials: true });
      // Refresh score locally or re-fetch
    } catch (err) {
      alert('Debes iniciar sesión para calificar!');
    }
  };

  return (
    <div className="gallery-page">
      <header className="gallery-header">
        <h1>Momentos de Delfi</h1>
        <div className="filter-bar">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>
      
      <div className="photo-grid">
        {loading ? <p>Cargando momentos...</p> : 
          photos.filter(p => filter === 'Todos' || p.category === filter).map(photo => (
            <div key={photo.id} className="photo-card">
              <img 
                src={photo.url || (photo.drive_id && photo.drive_id.startsWith('mock') 
                  ? `https://picsum.photos/seed/${photo.id}/400` 
                  : 'https://via.placeholder.com/400?text=No+Image')} 
                alt="Evento" 
                loading="lazy" 
              />
              <div className="photo-info">
                <span className="category-tag">{photo.category}</span>
                <div className="rating-controls">
                  {[1,2,3,4,5].map(s => (
                    <span 
                      key={s} 
                      className="star" 
                      onClick={() => handleRate(photo.id, s)}
                    >
                      {s <= (photo.avg_score || 0) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <p className="uploader">Por: {photo.uploader_name}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Gallery;
