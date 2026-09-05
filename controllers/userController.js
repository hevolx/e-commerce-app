const pool = require('../db/pool.js');

const createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const results = await pool.query(
      'INSERT INTO users (email, passwordHash, firstName, lastName, isActive) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, password, firstName, lastName, true]
    );
    res.status(201).send(`User added with ID: ${results.rows[0].id}`);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser
};
