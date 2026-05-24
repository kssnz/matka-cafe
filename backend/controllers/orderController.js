const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const { isDbConnected } = require('../config/dbState');
const {
  addMemoryOrder,
  getMemoryOrders,
  findMemoryOrderById,
  updateMemoryOrderItemQty,
  cancelMemoryOrder,
  updateMemoryOrderStatus,
  deleteMemoryOrder,
  getMemoryStats,
} = require('../utils/memoryStore');

const addOrderItems = asyncHandler(async (req, res) => {
  const { customerName, orderPin, tableNumber, orderItems, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (!isDbConnected()) {
    const result = addMemoryOrder({
      customerName,
      orderPin,
      tableNumber,
      orderItems,
      totalPrice,
    });
    return res.status(result.status).json(result.order);
  }

  let order = await Order.findOne({
    tableNumber,
    orderPin,
    status: { $in: ['Pending', 'Preparing'] },
  });

  if (order) {
    const newItems = orderItems.map((item) => ({
      ...item,
      orderedAt: new Date(),
      isNewItem: true,
    }));

    order.orderItems.push(...newItems);
    order.totalPrice += totalPrice;
    const updatedOrder = await order.save();
    res.status(201).json(updatedOrder);
  } else {
    const newOrder = new Order({
      customerName,
      orderPin,
      tableNumber,
      orderItems: orderItems.map((item) => ({ ...item, isNewItem: false })),
      totalPrice,
    });

    const createdOrder = await newOrder.save();
    res.status(201).json(createdOrder);
  }
});

const markOrderItemsSeen = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const order = findMemoryOrderById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.orderItems.forEach((item) => {
      item.isNewItem = false;
    });
    return res.json({ message: 'Items marked as seen' });
  }

  const order = await Order.findById(req.params.id);
  if (order) {
    order.orderItems.forEach((item) => {
      item.isNewItem = false;
    });
    order.markModified('orderItems');
    await order.save();
    res.json({ message: 'Items marked as seen' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { table, pin } = req.query;

  if (!isDbConnected()) {
    const orders = getMemoryOrders({ tableNumber: table, orderPin: pin });
    return res.json(orders);
  }

  const orders = await Order.find({ tableNumber: table, orderPin: pin }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const order = findMemoryOrderById(req.params.id);
    if (order) return res.json(order);
    res.status(404);
    throw new Error('Order not found');
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!isDbConnected()) {
    const result = updateMemoryOrderStatus(req.params.id, status);
    if (result.status !== 200) {
      res.status(result.status);
      throw new Error(result.message);
    }
    return res.json(result.order);
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    if (status) {
      order.status = status;
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const getOrders = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    return res.json(getMemoryOrders());
  }

  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
});

const getStats = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    return res.json(getMemoryStats());
  }

  const totalOrders = await Order.countDocuments();
  const orders = await Order.find({});
  const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);

  res.json({
    totalOrders,
    totalRevenue,
  });
});

const updateOrderItemQty = asyncHandler(async (req, res) => {
  const { itemId, qty } = req.body;

  if (!isDbConnected()) {
    const result = updateMemoryOrderItemQty(req.params.id, itemId, qty);
    if (result.status !== 200) {
      res.status(result.status);
      throw new Error(result.message);
    }
    return res.json(result.order);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'Pending') {
    res.status(400);
    throw new Error('Order is already being prepared and cannot be modified');
  }

  const item = order.orderItems.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in order');
  }

  item.qty = qty;
  order.totalPrice = order.orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

const cancelOrder = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const result = cancelMemoryOrder(req.params.id);
    if (result.status !== 200) {
      res.status(result.status);
      throw new Error(result.message);
    }
    return res.json(result.order);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'Pending') {
    res.status(400);
    throw new Error('Order is already being prepared and cannot be cancelled');
  }

  order.status = 'Cancelled';
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

const deleteOrder = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const result = deleteMemoryOrder(req.params.id);
    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.json({ success: true, message: result.message });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  await order.deleteOne();
  res.json({ success: true, message: 'Order removed' });
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  getOrders,
  getStats,
  markOrderItemsSeen,
  getMyOrders,
  updateOrderItemQty,
  cancelOrder,
  deleteOrder,
};
