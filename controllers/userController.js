const pool = require('../db/pool.js');
const bcrypt = require('bcrypt');

const registerForm = async (req, res) => {
  res.render('pages/register')
}

const createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (email == null || password == undefined) {
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
      res.status(409).send(`Email '${email}' already exist`);
    }
    res.status(201).send(`User added with ID: ${results.rows[0].id}`);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  registerForm
};
