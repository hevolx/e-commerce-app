const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const dbPool = require('./db/pool');
const config = require('./db/config');

const sessionStore = new pgSession({ pool: dbPool })

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(session({
  store: sessionStore,
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ info: 'Node.js, Express, and Postgres API' });
});

module.exports = { app, sessionStore };
