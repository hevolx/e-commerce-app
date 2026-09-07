const pool = require('../db/pool.js');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

const createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (email == null || password == undefined) {
    return res.status(400).send('Fields marked with * is required');
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const results = await pool.query(
      'INSERT INTO users (email, passwordHash, firstName, lastName, isActive) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, passwordHash, firstName, lastName, true]
    );
    res.status(201).send(`User added with ID: ${results.rows[0].id}`);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser
};
