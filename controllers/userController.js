const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const passport = require('passport');

// #region "Register"
const renderRegisterForm = async (req, res) => {
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
  const query = `
    INSERT INTO users (email, passwordHash, firstName, lastName, isActive)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO NOTHING
    RETURNING *`;

  const { rows } = await pool.query(query, [email, passwordHash, firstName, lastName, true]);

  if (rows[0] == null) {
    return res.status(409).render('pages/register', { error: `Email '${email}' already exists.` });
  } else { res.status(201).send(`User added with ID: ${rows[0].id}`) };
};
// #endregion

// #region "Login"
/** Renders the login form. */
const renderLoginForm = async (req, res) => {
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
  const query = `
    DELETE FROM session
    WHERE sid = $1`;

  await pool.query(query, [sid]);
  res.sendStatus(200);
}
// #endregion

const retriveAllUsers = async (req, res) => {
  const query = `
    SELECT *
    FROM users`;

  const { rows } = await pool.query(query);
  res.status(200).json(rows);
}

const retriveUser = async (req, res) => {
  const requestedId = req.params.id;
  const isOwnProfile = requestedId == req.user.id;
  const isAdmin = req.user.isadmin;

  if (!isOwnProfile && !isAdmin) {
    return res.sendStatus(403);
  }

  const query = `
    SELECT *
    FROM users
    WHERE id = $1`;
  const { rows } = await pool.query(query, [requestedId]);

  if (rows[0] == null) {
    return res.sendStatus(404);
  }
  res.status(200).json({ id: rows[0].id, email: rows[0].email });
}

const updateUser = async (req, res) => {
  const requestedId = req.params.id;
  const userId = req.user.id;
  const isOwnProfile = requestedId == userId;
  const { firstName } = req.body;

  if (!isOwnProfile) {
    return res.sendStatus(403);
  }
  const query = `
    UPDATE users
    SET firstName = $2
    WHERE id = $1
    RETURNING *`;

  const { rows } = await pool.query(query, [userId, firstName]);

  if (rows[0] == null) {
    return res.sendStatus(404);
  } else { res.status(200).json({ id: rows[0].id, firstName: rows[0].firstname }) }
}

const renderAccount = async (req, res) => {
  if (req.user != null) {
    res.status(200).render('pages/account', { user: req.user });
  } else {
    res.redirect("/login");
  }
}

const updateAccount = async (req, res) => {
  const userId = req.user.id;
  const { firstname } = req.body;
  const query = `
    UPDATE users
    SET firstName = $2
    WHERE id = $1
    RETURNING *`;

  const { rows } = await pool.query(query, [userId, firstname]);

  if (rows[0] == null) {
    return res.sendStatus(404);
  }
  res.status(302).redirect("/account");
}

module.exports = {
  renderRegisterForm,
  createUser,
  renderLoginForm,
  loginUser,
  logoutUser,
  retriveAllUsers,
  retriveUser,
  updateUser,
  renderAccount,
  updateAccount
};