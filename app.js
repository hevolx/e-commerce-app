const express = require('express');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const dbPool = require('./db/pool');

require('./auth/localStrategy');
require('./middleware/isAuthenticated');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');


// #region "GENERAL SETUP"
// Access .env files thru config
const config = require('./db/config');

// Create Express application
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// Middleware that allows Express to parse through JSON and x-www-form-urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// #endregion

// #region "SESSION SETUP"
const sessionStore = new pgSession({ pool: dbPool })

/**
 * secret: This is a random string that will be used to "authenticate" the session.
*
* resave: when set to true, this will force the session to save even if nothing changed. If you don't set this,
* the app will still run but you will get a warning in the terminal
*
* saveUninitialized: Similar to resave, when set true, this forces the session to be saved even if it is uninitialized
*/
app.use(
  session({
    store: sessionStore,
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

app.use(require('./middleware/passportSession'));
// #endregion

// #region "ROUTES"
app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', cartRoutes);
// #endregion

module.exports = { app, sessionStore };
