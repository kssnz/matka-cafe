const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const asyncHandler = require('express-async-handler');
const { isDbConnected } = require('../config/dbState');

const protect = asyncHandler(async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    res.status(500);
    throw new Error('Server misconfigured: JWT_SECRET is missing');
  }

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isDbConnected()) {
      req.admin = { _id: decoded.id };
      return next();
    }

    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin) {
      res.status(401);
      throw new Error('Not authorized');
    }

    next();
  } catch (error) {
    console.error('[Auth]', error.message);
    res.status(401);
    throw new Error('Not authorized');
  }
});

module.exports = { protect };
