const mongoose = require('mongoose');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const uris = [
    process.env.MONGO_URI,
    process.env.MONGO_URI_LOCAL,
    'mongodb://127.0.0.1:27017/matka-cafe',
  ].filter(Boolean);

  if (uris.length === 0) {
    throw new Error('MONGO_URI is missing. Add it to backend/.env');
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const uri of uris) {
      try {
        if (mongoose.connection.readyState === 1) {
          return mongoose.connection;
        }

        console.log(`[DB] Connection attempt ${attempt}/${maxAttempts}...`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`[DB] Connected: ${conn.connection.host}`);
        return conn;
      } catch (error) {
        const label = uri.includes('@') ? uri.split('@')[1] : uri;
        console.warn(`[DB] Failed (${label}): ${error.message}`);
      }
    }

    if (attempt < maxAttempts) {
      await sleep(2000);
    }
  }

  throw new Error(
    'Could not connect to MongoDB. Check MONGO_URI, Atlas IP whitelist, or run local MongoDB on port 27017.'
  );
};

module.exports = connectDB;
