import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Camera, Upload as UploadIcon } from 'lucide-react';
import './Upload.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Upload = () => {
  const { isDemo } = useContext(AuthContext);
  const [category, setCategory] = useState('Entrada');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('category', category);

    try {
      await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      alert('Foto subida con éxito!');
      setPreview(null);
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al subir la foto');
    }
  };

  return (
    <div className="upload-page">
      <h1>Subir Foto</h1>
      <p>Comparte un momento especial de la fiesta!</p>

      <div className="upload-card card">
        {!preview ? (
          <label className="file-label">
            <Camera size={48} />
            <span>Tocar para elegir foto</span>
            <input type="file" accept="image/*" onChange={handleFileChange} hidden />
          </label>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="Vista previa" />
            <button className="change-btn" onClick={() => { setPreview(null); setFile(null); }}>Cambiar foto</button>
          </div>
        )}

        <div className="input-group">
          <label>HASHTAG</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="#Entrada">Entrada</option>
            <option value="#Vals">Vals</option>
            <option value="#Carioca">Carioca</option>
            <option value="#Torta">Torta</option>
            <option value="#Sorpresa">Sorpresa</option>
            <option value="#Amigos">Amigos</option>
            <option value="#Familia">Familia</option>
            <option value="#Selfie">Selfie</option>
          </select>
        </div>

        <button className="btn" disabled={!preview} onClick={handleUpload}>
          <UploadIcon size={20} />
          Enviar Foto
        </button>
      </div>
    </div>
  );
};

export default Upload;
