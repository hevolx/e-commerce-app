const { findOrdersByUser } = require('../services/orderService');

const getOrders = async (req, res) => {
  try {
    const orders = await findOrdersByUser(req.user.id);
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

module.exports = {
  getOrders
}
