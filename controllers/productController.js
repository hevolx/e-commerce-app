const pool = require('../db/pool');

const getProducts = async (req, res) => {
  const results = await pool.query(
    `SELECT *
      FROM products`
  );
  res.status(200).json(results.rows);
}

module.exports = {
  getProducts
};