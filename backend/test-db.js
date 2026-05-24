const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const testConn = async () => {
  try {
    console.log('Testing connection to:', process.env.MONGO_URI.split('@')[1]); // Log host only for safety
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connected to MongoDB');
    
    const adminCount = await Admin.countDocuments();
    console.log('Admin users in database:', adminCount);
    
    if (adminCount === 0) {
      console.log('CRITICAL: No admin user found. You MUST run "npm run seed" successfully.');
    } else {
      const admin = await Admin.findOne({ email: 'my2056875@gmail.com' });
      if (admin) {
        console.log('SUCCESS: Admin user "my2056875@gmail.com" exists.');
      } else {
        console.log('ERROR: Admin user with specified email not found.');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('CONNECTION ERROR:', err.message);
    if (err.message.includes('timeout')) {
      console.log('REASON: Connection timed out. Your IP is likely NOT whitelisted in MongoDB Atlas.');
    }
    process.exit(1);
  }
};

testConn();
