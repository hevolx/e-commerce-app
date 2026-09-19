const pool = require('../db/pool');

const createCart = async (req, res) => {
  const userid = req.user.id;
  const query = `
  INSERT INTO carts (userId)
  VALUES ($1)
  RETURNING *`;

  const { rows } = await pool.query(query, [userid]);

  if (rows[0] == null) {
    return res.sendStatus(409);
  } else { res.status(201).json({ id: rows[0].id, userid: rows[0].userId }) };
}

module.exports = {
  createCart
};