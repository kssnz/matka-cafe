const asyncHandler = require('express-async-handler');
const FoodItem = require('../models/FoodItem');
const { isDbConnected } = require('../config/dbState');
const { getFallbackFood } = require('../utils/fallbackData');

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
const getFoodItems = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    return res.json(getFallbackFood());
  }

  try {
    const foodItems = await FoodItem.find({});
    res.json(foodItems.length > 0 ? foodItems : getFallbackFood());
  } catch (error) {
    console.warn('[API] Food query failed, using fallback:', error.message);
    res.json(getFallbackFood());
  }
});

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Public
const getFoodItemById = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findById(req.params.id);

  if (foodItem) {
    res.json(foodItem);
  } else {
    res.status(404);
    throw new Error('Food item not found');
  }
});

// @desc    Create a food item
// @route   POST /api/food
// @access  Private/Admin
const createFoodItem = asyncHandler(async (req, res) => {
  const { name, price, description, category, image } = req.body;

  const foodItem = new FoodItem({
    name,
    price: Number(price),
    description,
    category,
    image,
    isAvailable: true,
  });

  const createdFoodItem = await foodItem.save();
  res.status(201).json(createdFoodItem);
});

// @desc    Update a food item
// @route   PUT /api/food/:id
// @access  Private/Admin
const updateFoodItem = asyncHandler(async (req, res) => {
  const { name, price, description, category, image, isAvailable } = req.body;

  const foodItem = await FoodItem.findById(req.params.id);

  if (foodItem) {
    foodItem.name = name || foodItem.name;
    foodItem.price = price || foodItem.price;
    foodItem.description = description || foodItem.description;
    foodItem.category = category || foodItem.category;
    foodItem.image = image || foodItem.image;
    foodItem.isAvailable = isAvailable !== undefined ? isAvailable : foodItem.isAvailable;

    const updatedFoodItem = await foodItem.save();
    res.json(updatedFoodItem);
  } else {
    res.status(404);
    throw new Error('Food item not found');
  }
});

// @desc    Delete a food item
// @route   DELETE /api/food/:id
// @access  Private/Admin
const deleteFoodItem = asyncHandler(async (req, res) => {
  const foodItem = await FoodItem.findById(req.params.id);

  if (foodItem) {
    await foodItem.deleteOne();
    res.json({ message: 'Food item removed' });
  } else {
    res.status(404);
    throw new Error('Food item not found');
  }
});

module.exports = {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
