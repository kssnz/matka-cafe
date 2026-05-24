const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const { isDbConnected } = require('../config/dbState');
const {
  getMemoryCategories,
  addMemoryCategory,
  updateMemoryCategory,
  deleteMemoryCategory,
} = require('../utils/categoryStore');

const getCategories = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    return res.json(getMemoryCategories());
  }

  const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 });
  res.json(categories.map((c) => ({ _id: c._id, name: c.name, sortOrder: c.sortOrder })));
});

const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name ?? '').trim();
  if (!name) {
    return res.status(400).json({ success: false, message: 'Type name is required' });
  }

  if (!isDbConnected()) {
    const result = addMemoryCategory(name);
    if (result.status !== 201) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(201).json(result.category);
  }

  const exists = await Category.findOne({ name });
  if (exists) {
    return res.status(400).json({ success: false, message: 'This type already exists' });
  }

  const sortOrder = (await Category.countDocuments()) + 1;
  const category = await Category.create({ name, sortOrder });
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name ?? '').trim();
  if (!name) {
    return res.status(400).json({ success: false, message: 'Type name is required' });
  }

  if (!isDbConnected()) {
    const result = updateMemoryCategory(req.params.id, name);
    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.json(result.category);
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Type not found' });
  }

  const oldName = category.name;
  const duplicate = await Category.findOne({ name, _id: { $ne: category._id } });
  if (duplicate) {
    return res.status(400).json({ success: false, message: 'This type name is already in use' });
  }

  category.name = name;
  await category.save();
  await FoodItem.updateMany({ category: oldName }, { category: name });

  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const result = deleteMemoryCategory(req.params.id);
    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.json({ success: true, message: result.message });
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Type not found' });
  }

  const itemsUsing = await FoodItem.countDocuments({ category: category.name });
  if (itemsUsing > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete "${category.name}" — ${itemsUsing} menu item(s) still use it. Reassign them first.`,
    });
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Type removed' });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
