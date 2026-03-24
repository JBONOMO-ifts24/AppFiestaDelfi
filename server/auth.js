require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    // Check if user exists in DB
    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);
    
    if (!user) {
      // Create new user
      const info = db.prepare('INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?)')
        .run(profile.id, profile.emails[0].value, profile.displayName, 'guest');
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    }

    // Attach token to user object (will be serialized into session)
    user.accessToken = accessToken;
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  done(null, user);
});
