const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const { isDbConnected } = require('../config/dbState');

const OFFLINE_ADMIN_ID = 'offline-admin';
const OFFLINE_ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || 'my2056875@gmail.com';
const OFFLINE_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || 'Matka123';

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!process.env.JWT_SECRET) {
    res.status(500);
    throw new Error('Server misconfigured: JWT_SECRET is missing');
  }

  if (!isDbConnected()) {
    if (
      email === OFFLINE_ADMIN_EMAIL &&
      password === OFFLINE_ADMIN_PASSWORD
    ) {
      return res.json({
        _id: OFFLINE_ADMIN_ID,
        email: OFFLINE_ADMIN_EMAIL,
        token: generateToken(OFFLINE_ADMIN_ID),
      });
    }
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new admin (Optional for setup)
// @route   POST /api/auth/register
// @access  Public
const registerAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin already exists');
  }

  const admin = await Admin.create({
    email,
    password,
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  loginAdmin,
  registerAdmin,
};
