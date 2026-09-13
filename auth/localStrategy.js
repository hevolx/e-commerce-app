const pool = require('../db/pool.js');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const results = await pool.query(
        `SELECT email, passwordhash, isactive
      FROM users
      WHERE email = $1`,
        [email]
      );

      // No account found or account inactive
      if (!results.rows[0] || !results.rows[0].isactive) return done(null, false)

      // Password does match against hash
      else if (await bcrypt.compare(password, results.rows[0].passwordhash)) {
        return done(null, results.rows[0]);
      }

      // Password does not match against hash
      else {
        return done(null, false)
      }

      // Database error
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
      `SELECT email, passwordhash, isactive, isadmin
      FROM users
      WHERE email = $1`,
      [email]
    );

    // No account found or account inactive
    if (!results.rows[0] || !results.rows[0].isactive) return done(null, false);
    else { done(null, results.rows[0]) }
  } catch (error) {
    done(error);
  }
});