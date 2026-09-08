const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');


// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ info: 'Node.js, Express, and Postgres API' });
});

module.exports = app;
