const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const passport = require('passport');

// #region "Register"
const registerForm = async (req, res) => {
  res.render('pages/register')
}

const createUser = async (req, res) => {
  const { firstName, lastName } = req.body;
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : req.body.email;
  const password = typeof req.body.password === 'string' ? req.body.password.trim() : req.body.password;

  if (!email || !password) {
    return res.status(400).send('Fields marked with * is required');
  }

  const passwordHash = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

  const results = await pool.query(
    `INSERT INTO users (email, passwordHash, firstName, lastName, isActive)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING *`,
    [email, passwordHash, firstName, lastName, true]
  );

  if (results.rows[0] == null) {
    return res.status(409).render('pages/register', { error: `Email '${email}' already exists.` });
  } else { res.status(201).send(`User added with ID: ${results.rows[0].id}`) };
};
// #endregion

// #region "Login"
/** Renders the login form. */
const loginForm = async (req, res) => {
  res.render('pages/login')
}

/**
 * Authenticates submitted credentials and starts a session for a valid user.
 *
 * Invalid credentials re-render the login form with a 401 status. Authentication
 * and session errors are forwarded to the next Express error handler.
 */
const loginUser = async (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) { return next(err) }
    if (!user) { return res.status(401).render('pages/login', { error: `Credentials are invalid` }) }
    else {

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.sendStatus(200);
      })
    }
  })(req, res, next);
}
// #endregion

// #region "Logout"
/**
 * Deletes the current session from the persistent store and responds with 200.
 *
 * Database errors propagate from the request handler.
 */
const logoutUser = async (req, res, next) => {
  const sid = req.sessionID;
  await pool.query(
    `DELETE FROM session
      WHERE sid = $1`,
    [sid]
  );
  res.sendStatus(200);
}
// #endregion

module.exports = {
  registerForm,
  createUser,
  loginForm,
  loginUser,
  logoutUser
};
