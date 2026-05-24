const { getFallbackTables } = require('./fallbackData');

let tables = getFallbackTables().map((t) => ({ ...t }));
let orders = [];
let orderSeq = 1;
let itemSeq = 1;

const nextOrderId = () => `mem-order-${orderSeq++}`;
const nextItemId = () => `mem-item-${itemSeq++}`;

const getMemoryTables = () => tables.map((t) => ({ ...t }));

const findMemoryTableByNumber = (tableNumber) =>
  tables.find((t) => t.tableNumber === Number(tableNumber));

const findMemoryTableById = (id) => tables.find((t) => t._id === id);

const occupyMemoryTable = (tableNumber, customerName, orderPin) => {
  const table = findMemoryTableByNumber(tableNumber);
  if (!table) return { status: 404, message: 'Table not found' };

  const pin = String(orderPin);
  const name = String(customerName).trim();

  if (table.isOccupied) {
    if (table.orderPin === pin && table.occupiedBy === name) {
      return { status: 200, table: { ...table }, resumed: true };
    }
    return {
      status: 400,
      message: 'Table is already occupied by another guest. Use Re-enter with your PIN.',
    };
  }

  table.isOccupied = true;
  table.occupiedBy = name;
  table.orderPin = pin;
  return { status: 200, table: { ...table } };
};

const verifyMemoryTablePin = (tableNumber, orderPin) => {
  const table = findMemoryTableByNumber(tableNumber);
  if (!table?.isOccupied) {
    return { status: 404, message: 'Table is not currently occupied or does not exist' };
  }
  if (table.orderPin !== orderPin) {
    return { status: 401, message: 'Invalid PIN for this table' };
  }
  return {
    status: 200,
    data: {
      success: true,
      customerName: table.occupiedBy,
      tableNumber: table.tableNumber,
    },
  };
};

const releaseMemoryTable = (id) => {
  const table = findMemoryTableById(id);
  if (!table) return { status: 404, message: 'Table not found' };

  table.isOccupied = false;
  table.occupiedBy = null;
  table.orderPin = null;
  table.currentOrderId = null;
  return { status: 200, table: { ...table } };
};

const addMemoryOrder = (body) => {
  const { customerName, orderPin, tableNumber, orderItems, totalPrice } = body;

  let order = orders.find(
    (o) =>
      o.tableNumber === Number(tableNumber) &&
      o.orderPin === orderPin &&
      ['Pending', 'Preparing'].includes(o.status)
  );

  const mappedItems = orderItems.map((item) => ({
    _id: nextItemId(),
    name: item.name,
    qty: item.qty,
    image: item.image,
    price: item.price,
    foodItem: item.foodItem,
    orderedAt: new Date(),
    isNewItem: !!order,
  }));

  if (order) {
    order.orderItems.push(...mappedItems);
    order.totalPrice += totalPrice;
    return { status: 201, order: { ...order } };
  }

  order = {
    _id: nextOrderId(),
    customerName,
    orderPin,
    tableNumber: Number(tableNumber),
    orderItems: mappedItems.map((item) => ({ ...item, isNewItem: false })),
    totalPrice,
    status: 'Pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  orders.unshift(order);
  return { status: 201, order: { ...order } };
};

const getMemoryOrders = (filter = {}) => {
  let result = [...orders];
  if (filter.tableNumber != null) {
    result = result.filter((o) => o.tableNumber === Number(filter.tableNumber));
  }
  if (filter.orderPin) {
    result = result.filter((o) => o.orderPin === filter.orderPin);
  }
  return result;
};

const findMemoryOrderById = (id) => orders.find((o) => o._id === id);

const updateMemoryOrderItemQty = (orderId, itemId, qty) => {
  const order = findMemoryOrderById(orderId);
  if (!order) return { status: 404, message: 'Order not found' };
  if (order.status !== 'Pending') {
    return { status: 400, message: 'Order is already being prepared and cannot be modified' };
  }

  const item = order.orderItems.find((i) => i._id === itemId);
  if (!item) return { status: 404, message: 'Item not found in order' };

  item.qty = qty;
  order.totalPrice = order.orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  order.updatedAt = new Date();
  return { status: 200, order: { ...order } };
};

const cancelMemoryOrder = (orderId) => {
  const order = findMemoryOrderById(orderId);
  if (!order) return { status: 404, message: 'Order not found' };
  if (order.status !== 'Pending') {
    return { status: 400, message: 'Order is already being prepared and cannot be cancelled' };
  }
  order.status = 'Cancelled';
  order.updatedAt = new Date();
  return { status: 200, order: { ...order } };
};

const updateMemoryOrderStatus = (orderId, status) => {
  const order = findMemoryOrderById(orderId);
  if (!order) return { status: 404, message: 'Order not found' };
  if (status) order.status = status;
  order.updatedAt = new Date();
  return { status: 200, order: { ...order } };
};

const deleteMemoryOrder = (orderId) => {
  const index = orders.findIndex((o) => o._id === orderId);
  if (index === -1) return { status: 404, message: 'Order not found' };
  orders.splice(index, 1);
  return { status: 200, message: 'Order removed' };
};

const getMemoryStats = () => ({
  totalOrders: orders.length,
  totalRevenue: orders.reduce((acc, o) => acc + o.totalPrice, 0),
});

module.exports = {
  getMemoryTables,
  occupyMemoryTable,
  verifyMemoryTablePin,
  releaseMemoryTable,
  addMemoryOrder,
  getMemoryOrders,
  findMemoryOrderById,
  updateMemoryOrderItemQty,
  cancelMemoryOrder,
  updateMemoryOrderStatus,
  deleteMemoryOrder,
  getMemoryStats,
};
