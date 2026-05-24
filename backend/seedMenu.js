const dotenv = require('dotenv');
const mongoose = require('mongoose');
const FoodItem = require('./models/FoodItem');
const Category = require('./models/Category');
const { MENU_CATEGORIES, getMenuItemsForDb } = require('./utils/menuData');

dotenv.config();

const seedMenu = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    await FoodItem.deleteMany();
    console.log('Cleared existing menu items');

    for (let i = 0; i < MENU_CATEGORIES.length; i++) {
      const name = MENU_CATEGORIES[i];
      await Category.findOneAndUpdate(
        { name },
        { name, sortOrder: i + 1 },
        { upsert: true, new: true }
      );
    }
    console.log(`Synced ${MENU_CATEGORIES.length} menu categories`);

    const items = getMenuItemsForDb();
    await FoodItem.insertMany(items);
    console.log(`Added ${items.length} menu items`);

    console.log('Menu seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedMenu();
