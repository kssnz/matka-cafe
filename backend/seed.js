const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const FoodItem = require('./models/FoodItem');
const Content = require('./models/Content');
const Table = require('./models/Table');
const Category = require('./models/Category');
const { MENU_CATEGORIES, getMenuItemsForDb } = require('./utils/menuData');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected! Starting seed...');

    // Clear existing data
    await Admin.deleteMany();
    await FoodItem.deleteMany();
    await Content.deleteMany();
    await Table.deleteMany();
    await Category.deleteMany();

    // Create Admin
    await Admin.create({
      email: 'my2056875@gmail.com',
      password: 'Matka123',
    });

    console.log('Admin user created');

    // Create Tables
    const tables = [1, 2, 3, 4, 5].map(num => ({ tableNumber: num, isOccupied: false }));
    await Table.insertMany(tables);
    console.log('Tables initialized');

    await Category.insertMany(
      MENU_CATEGORIES.map((name, i) => ({ name, sortOrder: i + 1 }))
    );
    console.log('Menu types initialized');

    const menuFood = getMenuItemsForDb();
    await FoodItem.insertMany(menuFood);
    console.log(`${menuFood.length} menu items created`);

    // Create Sample Content
    const sampleContent = [
      {
        section: 'hero',
        title: 'Matka House',
        subtitle: '100% Pure Vegetarian Cafe',
        description: 'Experience the traditional Matka tea and delicious veg delicacies in Inaruwa.',
        image: '',
      },
      {
        section: 'about',
        title: 'Our Story',
        description: 'Matka House is Inaruwa\'s premier 100% pure vegetarian destination, dedicated to preserving traditional Nepali flavors.',
      },
      {
        section: 'contact',
        title: 'Contact Us',
        details: {
          address: 'Inaruwa-3, Sunsari, Nepal',
          phone: '9814372647',
          email: 'MatkaHouse@gmail.com',
        },
      },
    ];

    await Content.insertMany(sampleContent);
    console.log('Sample content created');

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
