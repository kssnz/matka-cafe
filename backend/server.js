const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { ensureTables, ensureCategories } = require('./utils/initDb');
const { ensureMemoryCategories } = require('./utils/categoryStore');
const { isDbConnected } = require('./config/dbState');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

// Fail fast instead of 10s "buffering timed out" when MongoDB is offline
mongoose.set('bufferCommands', false);

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Matka Cafe API is running', port: PORT });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    port: PORT,
    db: isDbConnected(),
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

const connectDatabase = async () => {
  try {
    await connectDB();
    await ensureCategories();
    await ensureTables();
    console.log('[DB] Database ready — live data enabled');
  } catch (error) {
    ensureMemoryCategories();
    console.warn('[DB] Not connected — serving fallback menu/tables until MongoDB is available');
    console.warn(`[DB] ${error.message}`);
  }
};

app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log(`  Matka Cafe API: http://localhost:${PORT}`);
  console.log(`  Health:         http://localhost:${PORT}/api/health`);
  console.log(`  Food:           http://localhost:${PORT}/api/food`);
  console.log(`  Tables:         http://localhost:${PORT}/api/tables`);
  console.log('========================================');
  connectDatabase();
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
