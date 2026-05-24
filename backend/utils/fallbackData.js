const { menuItems } = require('./menuData');

const fallbackFood = menuItems.map((item, index) => ({
  _id: `fallback-${index + 1}`,
  name: item.name,
  price: item.price,
  description: item.description,
  category: item.category,
  image: '',
  isAvailable: true,
}));

const fallbackTables = [1, 2, 3, 4, 5].map((num) => ({
  _id: `fallback-table-${num}`,
  tableNumber: num,
  isOccupied: false,
}));

const getFallbackFood = () => fallbackFood;
const getFallbackTables = () => fallbackTables;

module.exports = { getFallbackFood, getFallbackTables };
