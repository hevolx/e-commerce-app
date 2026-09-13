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
  if (results.rows[0] == null) {
    return res.sendStatus(404);
  } else { res.status(200).json({ id: results.rows[0].id, name: results.rows[0].name }) }
}

const createProduct = async (req, res) => {
  const isAdmin = req.user.isadmin;
  const { name, price, description } = req.body;

  if (isAdmin == true) {
    const results = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [name, price, description]
    );

    if (results.rows[0] == null) {
      return res.sendStatus(409);
    } else { res.status(201).json({ id: results.rows[0].id, name: results.rows[0].name }) };
  }
}

module.exports = {
  getProducts,
  getSpecificProduct,
  createProduct
};