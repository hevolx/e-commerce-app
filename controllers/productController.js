const pool = require('../db/pool');

const retriveAllProducts = async (req, res) => {
  const query = `
    SELECT *
    FROM products`;

  const { rows } = await pool.query(query);
  res.status(200).json(rows);
}

const retriveProduct = async (req, res) => {
  const productId = req.params.id;
  const query = `
    SELECT *
    FROM products
    WHERE id = $1`;

  const { rows } = await pool.query(query, [productId]);
  if (rows[0] == null) {
    return res.sendStatus(404);
  } else { res.status(200).json({ id: rows[0].id, name: rows[0].name }) }
}

const createProduct = async (req, res) => {
  const isAdmin = req.user.isadmin;
  const { name, price, description } = req.body;
  const query = `
    INSERT INTO products (name, price, description)
    VALUES ($1, $2, $3)
    RETURNING *`;

  if (isAdmin == true) {
    const { rows } = await pool.query(query, [name, price, description]);

    if (rows[0] == null) {
      return res.sendStatus(409);
    } else { res.status(201).json({ id: rows[0].id, name: rows[0].name }) };
  } else {
    return res.sendStatus(403);
  }
}

const updateProduct = async (req, res) => {
  const isAdmin = req.user.isadmin;
  const { name, price, description } = req.body;
  const productId = req.params.id;
  const query = `
    UPDATE products
    SET name = $2, price = $3, description = $4
    WHERE id = $1
    RETURNING *`;

  if (isAdmin == true) {
    const { rows } = await pool.query(query, [productId, name, price, description]);

    if (rows[0] == null) {
      return res.sendStatus(404);
    } else { res.status(200).json({ id: rows[0].id, name: rows[0].name }) }
  } else {
    return res.sendStatus(403);
  }
}

module.exports = {
  retriveAllProducts,
  retriveProduct,
  createProduct,
  updateProduct
};