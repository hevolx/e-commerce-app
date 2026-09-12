const pool = require('../db/pool.js');
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

  try {
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
    }
    res.status(201).send(`User added with ID: ${results.rows[0].id}`);
  } catch (error) {
    throw error;
  }
};
// #endregion

// #region "Login"
const loginForm = async (req, res) => {
  res.render('pages/login')
}

const loginUser = async (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) { return next(err) }
    if (!user) { return res.status(401).render('pages/login', { error: `Credentials are invalid` }) }
    else {
      req.logIn(user, () => {
        res.sendStatus(200)
      })
    }
  })(req, res, next);
}
// #endregion

// #region "Logout"
const logoutUser = async (req, res, next) => {
  const sid = req.sessionID;
  try {
    await pool.query(
      `DELETE FROM session
      WHERE sid = $1`,
      [sid]
    );
    res.sendStatus(200);
  } catch (error) {
    throw error;
  }
}
// #endregion

module.exports = {
  registerForm,
  createUser,
  loginForm,
  loginUser,
  logoutUser
};
