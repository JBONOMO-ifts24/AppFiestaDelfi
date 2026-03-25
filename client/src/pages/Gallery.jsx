import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Gallery.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Gallery = () => {
  const { isDemo, user } = useContext(AuthContext);
  const [filter, setFilter] = useState('Todos');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const categories = ['Todos', 'Entrada', 'Vals', 'Carioca'];

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/photos`);
      setPhotos(res.data);
    } catch (err) {
      console.error('Error fetching photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemo) {
      setPhotos([
        { id: 1, drive_id: 'mock1', category: 'Entrada', uploader_name: 'Delfi', avg_score: 5, comment_count: 2 },
        { id: 2, drive_id: 'mock2', category: 'Vals', uploader_name: 'Pablo', avg_score: 4, comment_count: 0 },
        { id: 3, drive_id: 'mock3', category: 'Carioca', uploader_name: 'Santi', avg_score: 4.5, comment_count: 5 },
      ]);
      setLoading(false);
      return;
    }
    fetchPhotos();
  }, []);

  const fetchComments = async (photoId) => {
    try {
      const res = await axios.get(`${API_URL}/api/photos/${photoId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments');
    }
  };

  const handleRate = async (photoId, score) => {
    try {
      await axios.post(`${API_URL}/api/photos/${photoId}/rate`, { score }, { withCredentials: true });
      fetchPhotos(); // Refresh to show new average
    } catch (err) {
      alert('Debes iniciar sesión para calificar!');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API_URL}/api/photos/${selectedPhoto.id}/comments`, { content: newComment }, { withCredentials: true });
      setNewComment('');
      fetchComments(selectedPhoto.id);
      fetchPhotos(); // Update comment count in grid
    } catch (err) {
      alert('Error al comentar');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Borrar comentario?')) return;
    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`, { withCredentials: true });
      fetchComments(selectedPhoto.id);
      fetchPhotos();
    } catch (err) {
      alert('Error al borrar');
    }
  };

  const openPhoto = (photo) => {
    setSelectedPhoto(photo);
    if (!isDemo) fetchComments(photo.id);
    else setComments([{ id: 1, user_name: 'Invitado', content: '¡Qué buena foto!', created_at: new Date().toISOString() }]);
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
            <div key={photo.id} className="photo-card" onClick={() => openPhoto(photo)}>
              <img 
                src={photo.url || (photo.drive_id && photo.drive_id.startsWith('mock') 
                  ? `https://picsum.photos/seed/${photo.id}/400` 
                  : 'https://via.placeholder.com/400?text=No+Image')} 
                alt="Evento" 
                loading="lazy" 
              />
              <div className="photo-info">
                <span className="category-tag">{photo.category}</span>
                <div className="stats-row">
                  <span className="stat-item">⭐ {Number(photo.avg_score || 0).toFixed(1)}</span>
                  <span className="stat-item">💬 {photo.comment_count || 0}</span>
                </div>
              </div>
              <p className="uploader">Por: {photo.uploader_name}</p>
            </div>
          ))
        }
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedPhoto(null)}>×</button>
            <div className="modal-body">
              <img src={selectedPhoto.url || `https://picsum.photos/seed/${selectedPhoto.id}/800`} alt="Grande" />
              
              <div className="modal-details">
                <div className="rating-section">
                  <h3>¿Qué te parece esta foto?</h3>
                  <div className="rating-stars">
                    {[1,2,3,4,5].map(s => (
                      <span 
                        key={s} 
                        className="star-large" 
                        onClick={() => handleRate(selectedPhoto.id, s)}
                      >
                        {s <= (selectedPhoto.avg_score || 0) ? '★' : '☆'}
                      </span>
                    ))}
                    <span className="avg-label">({Number(selectedPhoto.avg_score || 0).toFixed(1)})</span>
                  </div>
                </div>

                <div className="comments-section">
                  <h3>Comentarios</h3>
                  <div className="comments-list">
                    {comments.length === 0 ? <p className="no-comments">Nadie ha comentado aún. ¡Sé el primero!</p> : 
                      comments.map(c => (
                        <div key={c.id} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-user">@{c.user_name}</span>
                            {(user && (user.id === c.user_id || user.role === 'admin')) && (
                              <button className="delete-comment" onClick={() => handleDeleteComment(c.id)}>Eliminar</button>
                            )}
                          </div>
                          <p className="comment-body">{c.content}</p>
                        </div>
                      ))
                    }
                  </div>
                  
                  {user && (
                    <form className="comment-form" onSubmit={handleAddComment}>
                      <input 
                        type="text" 
                        placeholder="Escribe un comentario..." 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                      />
                      <button type="submit" disabled={!newComment.trim()}>Enviar</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
