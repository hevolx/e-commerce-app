const { findOrdersByUser, findOrderById, findOrderItems } = require('../services/orderService');

const getOrders = async (req, res) => {
  try {
    const orders = await findOrdersByUser(req.user.id);
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const getOrder = async (req, res) => {
  try {
    const order = await findOrderById(req.params.id);
    if (!order) {
      return res.sendStatus(404);
    }

    if (order.userid !== req.user.id) {
      return res.sendStatus(403);
    }

    res.status(200).json(order);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const renderOrderHistory = async (req, res) => {
  try {
    const orders = await findOrdersByUser(req.user.id);
    res.status(200).render('pages/orderHistory', { orders });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const renderOrderDetail = async (req, res) => {
  try {
    const order = await findOrderById(req.params.id);
    if (!order) {
      return res.sendStatus(404);
    }

    if (order.userid !== req.user.id) {
      return res.sendStatus(403);
    }

    const items = await findOrderItems(order.id);
    res.status(200).render('pages/orderDetail', { order, items });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

module.exports = {
  getOrders,
  getOrder,
  renderOrderHistory,
  renderOrderDetail
}
