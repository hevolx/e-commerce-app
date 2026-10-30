const express = require('express');
const path = require('path');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dbPool = require('./db/pool');

require('./auth/localStrategy');
require('./middleware/isAuthenticated');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');


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

// Expose the logged-in user to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
// #endregion

// #region "API DOCS"
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'E-commerce API', version: '1.0.0' }
  },
  apis: [path.join(__dirname, 'routes/*.js')]
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// #endregion

// #region "ROUTES"
app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', cartRoutes);
app.use('/', checkoutRoutes);
app.use('/', orderRoutes);
// #endregion

// #region "ERROR HANDLING"
app.use((req, res) => {
  res.status(404).render('pages/notFound');
});
// #endregion

module.exports = { app, sessionStore };
