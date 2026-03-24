const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.db'));

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    name TEXT,
    last_name TEXT,
    password TEXT,
    role TEXT DEFAULT 'guest'
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drive_id TEXT UNIQUE,
    filename TEXT,
    category TEXT, -- 'Entrada', 'Vals', 'Carioca'
    uploader_id INTEGER,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'hidden'
    FOREIGN KEY (uploader_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER,
    user_id INTEGER,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    UNIQUE(photo_id, user_id),
    FOREIGN KEY (photo_id) REFERENCES photos(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log('Database initialized successfully.');

module.exports = db;
