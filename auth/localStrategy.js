const pool = require('../db/pool.js');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const results = await pool.query(
        `SELECT email, passwordhash
      FROM users
      WHERE email = $1`,
        [email]
      );

      // Inget konto
      if (!results.rows[0]) return done(null, false)

      // Rätt lösenord
      else if (await bcrypt.compare(password, results.rows[0].passwordhash)) {
        return done(null, results.rows[0]);
      }

      // Fel lösenord
      else {
        return done(null, false)
      }

      // Databasfel
    } catch (error) {
      return done(error, false)
    }
  }));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.email);
})
passport.deserializeUser(async (email, done) => {
  try {
    const results = await pool.query(
      `SELECT email, passwordhash
      FROM users
      WHERE email = $1`,
      [email]
    );
    done(null, results.rows[0]);
  } catch (error) {
    done(error);
  }
});