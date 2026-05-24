const Table = require('../models/Table');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const { DEFAULT_TYPES } = require('./categoryStore');

const ensureCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    const fromFood = await FoodItem.distinct('category');
    const names =
      fromFood.filter(Boolean).length > 0 ? fromFood.filter(Boolean) : DEFAULT_TYPES;
    const docs = names.map((name, i) => ({ name, sortOrder: i + 1 }));
    await Category.insertMany(docs);
    console.log('Initialized menu types (categories)');
  }
};

const ensureTables = async () => {
  const count = await Table.countDocuments();
  if (count === 0) {
    const tables = [1, 2, 3, 4, 5].map((num) => ({
      tableNumber: num,
      isOccupied: false,
    }));
    await Table.insertMany(tables);
    console.log('Initialized 5 cafe tables');
  }
};

module.exports = { ensureTables, ensureCategories };
