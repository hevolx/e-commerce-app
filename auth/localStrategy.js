const pool = require('../db/pool.js');
const bcrypt = require('bcrypt');

const verifyCredentials = async (email, password, done) => {
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
};

module.exports = {
  verifyCredentials
}