const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const SECRETO = process.env.JWT_SECRET || 'mi-secreto-ultra-seguro';

const register = async (req, res) => {
  const { name, last_name, username, password, email } = req.body;
  
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (name, last_name, username, password, email, role) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, last_name, username, hashedPassword, email, 'guest');
    
    res.json({ success: true, userId: info.lastInsertRowid });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El usuario o email ya existe.' });
    }
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !user.password) {
    return res.status(400).json({ error: 'Usuario no encontrado.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRETO, { expiresIn: '24h' });
  
  // Set cookie with token
  res.cookie('auth_token', token, { 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false // Only true in production with HTTPS
  });
  res.json({ success: true, user: { id: user.id, name: user.name, username: user.username, role: user.role } });
};

const verifyToken = (req, res, next) => {
  const token = req.cookies?.auth_token;
  if (req.user || !token) {
    return next(); // Continue if already authenticated (Passport) or no token
  }

  try {
    const decoded = jwt.verify(token, SECRETO);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('auth_token');
    next();
  }
};

module.exports = { register, login, verifyToken };
