require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const db = require('./db');
require('./auth'); // Import passport strategy
const { register, login, verifyToken } = require('./localAuth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fiesta-delfi-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(verifyToken); // Fallback to JWT if no Passport session
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(fileUpload());

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);

app.post('/auth/register', register);
app.post('/auth/login', login);

app.get('/auth/user', (req, res) => {
  // Check if user is from JWT (verifyToken) or Passport (google)
  res.json({ user: req.user || null });
});

app.post('/auth/logout', (req, res, next) => {
  res.clearCookie('auth_token');
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

const { uploadFileToDrive } = require('./drive');

// Photo Routes
app.post('/api/upload', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Debes iniciar sesión para subir fotos.' });
  }

  if (!req.files || !req.files.photo) {
    return res.status(400).json({ error: 'No se envió ninguna foto.' });
  }

  const { category } = req.body;
  const photo = req.files.photo;
  const fileName = `${Date.now()}-${photo.name}`;
  const uploadPath = path.join(__dirname, 'uploads', fileName);

  try {
    await photo.mv(uploadPath);
    
    db.prepare('INSERT INTO photos (drive_id, filename, category, uploader_id, status) VALUES (?, ?, ?, ?, ?)')
      .run(fileName, photo.name, category, req.user.id, 'approved');

    res.json({ success: true, fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la foto localmente.' });
  }
});

app.get('/api/photos', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const photos = db.prepare(`
    SELECT p.*, u.name as uploader_name, 
    (SELECT AVG(score) FROM ratings WHERE photo_id = p.id) as avg_score,
    (SELECT COUNT(*) FROM comments WHERE photo_id = p.id) as comment_count
    FROM photos p 
    JOIN users u ON p.uploader_id = u.id
    WHERE p.status = 'approved'
    ORDER BY p.upload_date DESC
  `).all();
  
  const formattedPhotos = photos.map(p => ({
    ...p,
    url: `${protocol}://${host}/uploads/${p.drive_id}`
  }));
  
  res.json(formattedPhotos);
});

// Comment Routes
app.get('/api/photos/:id/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.name as user_name 
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.photo_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);
  res.json(comments);
});

app.post('/api/photos/:id/comments', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  const { content } = req.body;
  const photoId = req.params.id;

  try {
    db.prepare('INSERT INTO comments (photo_id, user_id, content) VALUES (?, ?, ?)')
      .run(photoId, req.user.id, content);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

app.delete('/api/comments/:id', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  try {
    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

app.post('/api/photos/:id/rate', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  const { score } = req.body;
  const photoId = req.params.id;

  try {
    db.prepare(`
      INSERT INTO ratings (photo_id, user_id, score) 
      VALUES (?, ?, ?)
      ON CONFLICT(photo_id, user_id) DO UPDATE SET score = excluded.score
    `).run(photoId, req.user.id, score);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error rating photo' });
  }
});

const { sendNotification } = require('./notifications');

// Admin Routes
app.get('/api/admin/photos', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    // For MVP, if there's no admin yet, we'll allow the first user or just check a flag
    // return res.status(403).json({ error: 'Access denied' });
  }
  const photos = db.prepare(`
    SELECT p.*, u.name as uploader_name 
    FROM photos p 
    JOIN users u ON p.uploader_id = u.id
    ORDER BY p.upload_date DESC
  `).all();
  res.json(photos);
});

app.patch('/api/admin/photos/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    db.prepare('UPDATE photos SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Notifications / Challenges
app.post('/api/notifications/challenge', async (req, res) => {
  const { message } = req.body;
  try {
    await sendNotification(message, 'Desafío Fotográfico! 📸');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

app.get('/api/photos/view/:driveId', async (req, res) => {
  const { driveId } = req.params;
  const { google } = require('googleapis');
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  // We need an admin or valid token here. For MVP purposes, since it's a private party, 
  // we could use a service account or the uploader's token if we stored it long-term.
  // Alternatively, we can make the file public during upload and use the shortcut.
  // For simplicity here, we'll try to fetch using the drive instance.
  
  const drive = google.drive({ version: 'v3', auth: process.env.GOOGLE_API_KEY || oauth2Client });
  
  try {
    const response = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'stream' }
    );
    response.data
      .on('error', err => {
        res.status(500).send('Error streaming image');
      })
      .pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching image from Drive' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
