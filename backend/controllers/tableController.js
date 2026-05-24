const asyncHandler = require('express-async-handler');
const Table = require('../models/Table');
const { isDbConnected } = require('../config/dbState');
const { getFallbackTables } = require('../utils/fallbackData');
const {
  getMemoryTables,
  occupyMemoryTable,
  verifyMemoryTablePin,
  releaseMemoryTable,
} = require('../utils/memoryStore');

const parseTableNumber = (value) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
};

const validateOccupyBody = (body) => {
  const tableNumber = parseTableNumber(body.tableNumber);
  const customerName = String(body.customerName ?? '').trim();
  const orderPin = String(body.orderPin ?? '').trim();

  if (tableNumber == null) {
    return { error: 'tableNumber is required and must be a valid number (1–5)' };
  }
  if (!customerName) {
    return { error: 'customerName is required' };
  }
  if (!/^\d{4}$/.test(orderPin)) {
    return { error: 'orderPin must be exactly 4 digits' };
  }

  return { tableNumber, customerName, orderPin };
};

const getTables = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    return res.json(getMemoryTables());
  }

  try {
    const tables = await Table.find({}).sort({ tableNumber: 1 });
    res.json(tables.length > 0 ? tables : getFallbackTables());
  } catch (error) {
    console.warn('[API] Tables query failed, using memory store:', error.message);
    res.json(getMemoryTables());
  }
});

const occupyTable = asyncHandler(async (req, res) => {
  console.log('[POST /api/tables/occupy] body:', req.body);

  const validation = validateOccupyBody(req.body);
  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  const { tableNumber, customerName, orderPin } = validation;

  if (!isDbConnected()) {
    const result = occupyMemoryTable(tableNumber, customerName, orderPin);
    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.json({ success: true, ...result.table });
  }

  const table = await Table.findOne({ tableNumber });

  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }

  if (table.isOccupied) {
    if (table.orderPin === orderPin && table.occupiedBy === customerName) {
      return res.json({
        success: true,
        _id: table._id,
        tableNumber: table.tableNumber,
        isOccupied: table.isOccupied,
        occupiedBy: table.occupiedBy,
        orderPin: table.orderPin,
        resumed: true,
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Table is already occupied by another guest. Use Re-enter with your PIN.',
    });
  }

  table.isOccupied = true;
  table.occupiedBy = customerName;
  table.orderPin = orderPin;
  const updatedTable = await table.save();
  res.json({ success: true, ...updatedTable.toObject() });
});

const releaseTable = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const result = releaseMemoryTable(req.params.id);
    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.json({ success: true, ...result.table });
  }

  const table = await Table.findById(req.params.id);

  if (table) {
    table.isOccupied = false;
    table.occupiedBy = null;
    table.orderPin = null;
    table.currentOrderId = null;
    const updatedTable = await table.save();
    res.json({ success: true, ...updatedTable.toObject() });
  } else {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }
});

const verifyTablePin = asyncHandler(async (req, res) => {
  console.log('[POST /api/tables/verify-pin] body:', req.body);

  const tableNumber = parseTableNumber(req.body.tableNumber);
  const orderPin = String(req.body.orderPin ?? '').trim();

  if (tableNumber == null) {
    return res.status(400).json({ success: false, message: 'tableNumber is required' });
  }
  if (!/^\d{4}$/.test(orderPin)) {
    return res.status(400).json({ success: false, message: 'orderPin must be exactly 4 digits' });
  }

  if (!isDbConnected()) {
    const result = verifyMemoryTablePin(tableNumber, orderPin);
    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.json({ success: true, ...result.data });
  }

  const table = await Table.findOne({ tableNumber, isOccupied: true });

  if (table) {
    if (table.orderPin === orderPin) {
      res.json({
        success: true,
        customerName: table.occupiedBy,
        tableNumber: table.tableNumber,
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid PIN for this table' });
    }
  } else {
    return res.status(404).json({
      success: false,
      message: 'Table is not currently occupied or does not exist',
    });
  }
});

module.exports = {
  getTables,
  occupyTable,
  releaseTable,
  verifyTablePin,
};
