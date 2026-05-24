const { MENU_CATEGORIES } = require('./menuData');
const DEFAULT_TYPES = MENU_CATEGORIES;

let categories = DEFAULT_TYPES.map((name, i) => ({
  _id: `mem-cat-${i + 1}`,
  name,
  sortOrder: i + 1,
}));

const getMemoryCategories = () => categories.map((c) => ({ ...c }));

const findMemoryCategory = (id) => categories.find((c) => c._id === id);

const addMemoryCategory = (name) => {
  const trimmed = String(name).trim();
  if (!trimmed) return { status: 400, message: 'Type name is required' };
  if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    return { status: 400, message: 'This type already exists' };
  }
  const category = {
    _id: `mem-cat-${Date.now()}`,
    name: trimmed,
    sortOrder: categories.length + 1,
  };
  categories.push(category);
  return { status: 201, category: { ...category } };
};

const updateMemoryCategory = (id, name) => {
  const trimmed = String(name).trim();
  if (!trimmed) return { status: 400, message: 'Type name is required' };

  const category = findMemoryCategory(id);
  if (!category) return { status: 404, message: 'Type not found' };

  if (categories.some((c) => c._id !== id && c.name.toLowerCase() === trimmed.toLowerCase())) {
    return { status: 400, message: 'This type name is already in use' };
  }

  category.name = trimmed;
  return { status: 200, category: { ...category } };
};

const deleteMemoryCategory = (id) => {
  const category = findMemoryCategory(id);
  if (!category) return { status: 404, message: 'Type not found' };

  if (categories.length <= 1) {
    return { status: 400, message: 'You must keep at least one menu type' };
  }

  categories = categories.filter((c) => c._id !== id);
  return { status: 200, message: 'Type removed' };
};

const ensureMemoryCategories = () => {
  if (categories.length === 0) {
    categories = DEFAULT_TYPES.map((name, i) => ({
      _id: `mem-cat-${i + 1}`,
      name,
      sortOrder: i + 1,
    }));
  }
};

module.exports = {
  getMemoryCategories,
  addMemoryCategory,
  updateMemoryCategory,
  deleteMemoryCategory,
  ensureMemoryCategories,
  DEFAULT_TYPES,
};
