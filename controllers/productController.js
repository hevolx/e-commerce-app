const pool = require('../db/pool');

const getProducts = async (req, res) => {
  const results = await pool.query(
    `SELECT *
      FROM products`
  );
  res.status(200).json(results.rows);
}

const getSpecificProduct = async (req, res) => {
  const productId = req.params.id;
  const results = await pool.query(
    `SELECT *
    FROM products
    WHERE id = $1`,
    [productId]
  );
  res.status(200).json({ id: results.rows[0].id, name: results.rows[0].name });
}

module.exports = {
  getProducts,
  getSpecificProduct
};