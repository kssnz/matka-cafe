/** Full Matka Cafe menu — drinks & food from printed menu */
const MENU_CATEGORIES = [
  'Tea Selection',
  'Cold Drinks',
  'Hot Drinks',
  'Smoking & Hookah',
  'Juice, Lassi & Shakes',
  "Chef's Special",
  'Energy Drinks',
  'Momo Specials',
  'Chowmein & Thukpa',
  'Pakoda & Snacks',
  'Chilli Items',
  'Special Value Food',
  'Pizza Corner',
  'Burgers & Sandwiches',
  'Quick Noodles',
];

const menuItems = [
  // Tea Selection
  { name: 'Tea', price: 25, category: 'Tea Selection', description: 'Classic hot tea.' },
  { name: 'Masala Tea', price: 30, category: 'Tea Selection', description: 'Spiced masala tea.' },
  { name: 'Matka Tea (Signature)', price: 40, category: 'Tea Selection', description: 'Signature tea served in a traditional clay matka pot.' },
  { name: 'Lemon Tea', price: 20, category: 'Tea Selection', description: 'Refreshing lemon tea.' },
  { name: 'Black Ginger Tea', price: 30, category: 'Tea Selection', description: 'Bold black tea with ginger.' },
  { name: 'Special Tea', price: 60, category: 'Tea Selection', description: 'House special blend tea.' },

  // Cold Drinks
  { name: 'Sprite', price: 65, category: 'Cold Drinks', description: 'Chilled Sprite.' },
  { name: 'Lemon Sprite', price: 100, category: 'Cold Drinks', description: 'Sprite with fresh lemon.' },
  { name: 'Coca-Cola', price: 65, category: 'Cold Drinks', description: 'Chilled Coca-Cola.' },
  { name: 'Fanta', price: 65, category: 'Cold Drinks', description: 'Chilled Fanta.' },

  // Hot Drinks
  { name: 'Hot Lemon with Honey', price: 100, category: 'Hot Drinks', description: 'Warm lemon drink with honey.' },
  { name: 'Hot Chocolate', price: 180, category: 'Hot Drinks', description: 'Rich hot chocolate.' },

  // Smoking & Hookah
  { name: 'Shekhar Ice', price: 20, category: 'Smoking & Hookah', description: 'Shekhar Ice cigarette.' },
  { name: 'Surya', price: 25, category: 'Smoking & Hookah', description: 'Surya cigarette.' },
  { name: 'Fusion', price: 25, category: 'Smoking & Hookah', description: 'Fusion cigarette.' },
  { name: 'Hookah (Standard)', price: 300, category: 'Smoking & Hookah', description: 'Hookah — standard flavour.' },
  { name: 'Hookah (Premium)', price: 395, category: 'Smoking & Hookah', description: 'Hookah — premium flavour.' },
  { name: 'Hookah (Deluxe)', price: 445, category: 'Smoking & Hookah', description: 'Hookah — deluxe flavour.' },

  // Juice, Lassi & Shakes
  { name: 'Plain Lassi', price: 120, category: 'Juice, Lassi & Shakes', description: 'Traditional plain lassi.' },
  { name: 'Sweet Lassi', price: 120, category: 'Juice, Lassi & Shakes', description: 'Sweetened yogurt lassi.' },
  { name: 'Banana Lassi', price: 150, category: 'Juice, Lassi & Shakes', description: 'Banana blended lassi.' },
  { name: 'Cold Lassi', price: 150, category: 'Juice, Lassi & Shakes', description: 'Chilled refreshing lassi.' },
  { name: 'Chocolate Lassi', price: 180, category: 'Juice, Lassi & Shakes', description: 'Chocolate flavoured lassi.' },
  { name: 'Milk Shake', price: 200, category: 'Juice, Lassi & Shakes', description: 'Classic milk shake.' },
  { name: 'Chocolate Shake', price: 220, category: 'Juice, Lassi & Shakes', description: 'Chocolate milk shake.' },
  { name: 'Banana Shake', price: 250, category: 'Juice, Lassi & Shakes', description: 'Banana milk shake.' },

  // Chef's Special
  { name: 'Dry Fruit Lassi LP', price: 200, category: "Chef's Special", description: "Chef's special dry fruit lassi." },

  // Energy Drinks
  { name: 'Xtream', price: 150, category: 'Energy Drinks', description: 'Xtream energy drink.' },
  { name: 'Red Bull', price: 145, category: 'Energy Drinks', description: 'Red Bull energy drink.' },

  // Momo Specials
  { name: 'Veg Momo', price: 80, category: 'Momo Specials', description: 'Steamed vegetable momo.' },
  { name: 'Fry Momo', price: 100, category: 'Momo Specials', description: 'Crispy fried momo.' },
  { name: 'Jhol Momo', price: 150, category: 'Momo Specials', description: 'Momo in spicy jhol soup.' },
  { name: 'Chilly Momo', price: 180, category: 'Momo Specials', description: 'Momo tossed in chilly sauce.' },
  { name: 'Sadeko Momo', price: 200, category: 'Momo Specials', description: 'Momo with Nepali sadeko spices.' },
  { name: 'Paneer Momo', price: 220, category: 'Momo Specials', description: 'Steamed paneer momo.' },
  { name: 'Steam Jhol Momo', price: 250, category: 'Momo Specials', description: 'Steamed momo in jhol soup.' },
  { name: 'Chilly Paneer Momo', price: 300, category: 'Momo Specials', description: 'Paneer momo in chilly sauce.' },

  // Chowmein & Thukpa
  { name: 'Veg Chowmein', price: 90, category: 'Chowmein & Thukpa', description: 'Stir-fried veg noodles.' },
  { name: 'Veg Thukpa', price: 100, category: 'Chowmein & Thukpa', description: 'Vegetable noodle soup.' },
  { name: 'Sukha Thukpa', price: 100, category: 'Chowmein & Thukpa', description: 'Dry-style thukpa noodles.' },
  { name: 'Paneer Chowmein', price: 130, category: 'Chowmein & Thukpa', description: 'Chowmein with paneer.' },
  { name: 'Mix Chowmein', price: 150, category: 'Chowmein & Thukpa', description: 'Mixed veg and paneer chowmein.' },
  { name: 'Mushroom Chowmein', price: 170, category: 'Chowmein & Thukpa', description: 'Chowmein with mushrooms.' },

  // Pakoda & Snacks
  { name: 'Veg Pakoda', price: 120, category: 'Pakoda & Snacks', description: 'Crispy vegetable pakoda.' },
  { name: 'Onion Pakoda', price: 120, category: 'Pakoda & Snacks', description: 'Crispy onion pakoda.' },
  { name: 'Mix Pakoda', price: 150, category: 'Pakoda & Snacks', description: 'Mixed vegetable pakoda.' },
  { name: 'Paneer Pakoda', price: 200, category: 'Pakoda & Snacks', description: 'Paneer fritters.' },
  { name: 'Wai Wai Sadheko', price: 100, category: 'Pakoda & Snacks', description: 'Spiced Wai Wai noodle snack.' },
  { name: 'Chatpate', price: 100, category: 'Pakoda & Snacks', description: 'Tangy Nepali chatpate snack.' },

  // Chilli Items
  { name: 'Mushroom Chilli', price: 285, category: 'Chilli Items', description: 'Mushroom in Indo-Chinese chilli sauce.' },
  { name: 'Paneer Chilli', price: 300, category: 'Chilli Items', description: 'Paneer in Indo-Chinese chilli sauce.' },

  // Special Value Food
  { name: 'Veg 99', price: 250, category: 'Special Value Food', description: 'Special value veg platter for two.' },

  // Pizza Corner
  { name: 'Veg Pizza', price: 400, category: 'Pizza Corner', description: 'Vegetable pizza on fresh crust.' },
  { name: 'Paneer Pizza', price: 450, category: 'Pizza Corner', description: 'Paneer pizza on fresh crust.' },

  // Burgers & Sandwiches
  { name: 'Veg Burger', price: 120, category: 'Burgers & Sandwiches', description: 'Vegetable burger.' },
  { name: 'Paneer Burger', price: 150, category: 'Burgers & Sandwiches', description: 'Paneer burger.' },
  { name: 'Veg Sandwich', price: 200, category: 'Burgers & Sandwiches', description: 'Grilled veg sandwich.' },
  { name: 'Paneer Sandwich', price: 250, category: 'Burgers & Sandwiches', description: 'Grilled paneer sandwich.' },

  // Quick Noodles
  { name: 'Plain Noodles', price: 60, category: 'Quick Noodles', description: 'Simple plain noodles.' },
  { name: 'Half Fry Sadeko', price: 80, category: 'Quick Noodles', description: 'Half-fried noodles with sadeko spices.' },
  { name: 'Current Noodles', price: 100, category: 'Quick Noodles', description: 'Spiced current-style noodles.' },
];

const getMenuItemsForDb = () =>
  menuItems.map((item) => ({
    ...item,
    image: '',
    isAvailable: true,
  }));

module.exports = {
  MENU_CATEGORIES,
  menuItems,
  getMenuItemsForDb,
};
