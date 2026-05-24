import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, Upload, LayoutDashboard, Tag, Check, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';
import { resolveImageUrl, handleImageError } from '../../utils/imageUtils';

const DEFAULT_CATEGORY = 'Beverage';

const ManageFood = () => {
  const { admin } = useAuth();
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: DEFAULT_CATEGORY,
    image: '',
  });
  const [uploading, setUploading] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingTypeName, setEditingTypeName] = useState('');

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${admin.token}` },
  });

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data);
      return data;
    } catch (error) {
      toast.error('Failed to load menu types');
      return [];
    }
  };

  const fetchFood = async () => {
    try {
      const { data } = await api.get('/api/food');
      setFoodItems(data);
    } catch (error) {
      toast.error('Failed to fetch food items');
    }
  };

  useEffect(() => {
    const load = async () => {
      const cats = await fetchCategories();
      await fetchFood();
      setLoading(false);
      if (cats.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: prev.category || cats[0].name,
        }));
      }
    };
    load();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${admin.token}`,
        },
      };
      const { data } = await api.post('/api/food/upload', uploadData, config);
      setFormData({ ...formData, image: data });
      setUploading(false);
    } catch (error) {
      toast.error('Image upload failed');
      setUploading(false);
    }
  };

  const resetForm = () => {
    const firstCat = categories[0]?.name || DEFAULT_CATEGORY;
    setFormData({
      name: '',
      price: '',
      description: '',
      category: firstCat,
      image: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await api.put(`/api/food/${editingItem._id}`, formData, authConfig());
        toast.success('Food item updated');
      } else {
        await api.post('/api/food', formData, authConfig());
        toast.success('Food item added');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchFood();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/food/${id}`, authConfig());
        toast.success('Food item deleted');
        fetchFood();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      image: item.image,
    });
    setShowModal(true);
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    const name = newTypeName.trim();
    if (!name) return;

    try {
      await api.post('/api/categories', { name }, authConfig());
      toast.success(`Type "${name}" added`);
      setNewTypeName('');
      await fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add type');
    }
  };

  const startEditType = (cat) => {
    setEditingTypeId(cat._id);
    setEditingTypeName(cat.name);
  };

  const cancelEditType = () => {
    setEditingTypeId(null);
    setEditingTypeName('');
  };

  const saveEditType = async (id) => {
    const name = editingTypeName.trim();
    if (!name) {
      toast.error('Type name cannot be empty');
      return;
    }

    try {
      await api.put(`/api/categories/${id}`, { name }, authConfig());
      toast.success('Type updated');
      cancelEditType();
      const cats = await fetchCategories();
      await fetchFood();
      setFormData((prev) => {
        const match = cats.find((c) => c._id === id);
        if (match && prev.category !== match.name) {
          const old = categories.find((c) => c._id === id);
          if (old && prev.category === old.name) {
            return { ...prev, category: match.name };
          }
        }
        return prev;
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update type');
    }
  };

  const handleDeleteType = async (cat) => {
    if (!window.confirm(`Delete type "${cat.name}"? Items using it must be reassigned first.`)) return;

    try {
      await api.delete(`/api/categories/${cat._id}`, authConfig());
      toast.success('Type deleted');
      await fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot delete type');
    }
  };

  const categoryNames = categories.map((c) => c.name);
  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F0E8]">
      <aside className="w-full lg:w-64 bg-primary text-white p-6 shrink-0">
        <h2 className="text-xl font-black mb-8 flex items-center tracking-tight">
          <LayoutDashboard className="mr-2 text-accent" size={22} /> Admin Panel
        </h2>
        <nav className="space-y-2">
          <Link to="/admin" className="block p-3 rounded-xl text-sm font-bold text-white/90 hover:bg-white/10">
            Dashboard
          </Link>
          <Link to="/admin/food" className="block p-3 rounded-xl text-sm font-bold bg-white text-primary shadow-md">
            Food & Beverages
          </Link>
          <Link to="/admin/orders" className="block p-3 rounded-xl text-sm font-bold text-white/90 hover:bg-white/10">
            Manage Orders
          </Link>
          <Link to="/admin/content" className="block p-3 rounded-xl text-sm font-bold text-white/90 hover:bg-white/10">
            Site Content
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8 min-w-0 max-w-6xl mx-auto w-full">
        <div className="sticky top-24 z-10 flex flex-wrap justify-between items-center gap-4 mb-6 bg-[#F5F0E8]/95 backdrop-blur py-3">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Food & Beverage Menu</h1>
            <p className="text-gray-500 text-sm mt-1">
              {foodItems.length} items · {categories.length} types
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-accent text-white px-6 py-3 rounded-xl flex items-center font-bold shadow-lg shadow-accent/25 hover:bg-accent/90 transition shrink-0"
          >
            <Plus size={22} className="mr-2" /> Add Food / Beverage
          </button>
        </div>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-black text-primary flex items-center gap-2">
              <Tag size={20} className="text-accent" /> Menu types
            </h2>
            <p className="text-xs text-gray-400">Edit names — items using a type update automatically</p>
          </div>

          <form onSubmit={handleAddType} className="flex flex-wrap gap-2 mb-5">
            <input
              type="text"
              placeholder="New type (e.g. Desserts)"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="flex-1 min-w-[180px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 flex items-center gap-1"
            >
              <Plus size={16} /> Add type
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center gap-2 bg-[#FDF5E6] border border-primary/10 rounded-xl px-3 py-2"
              >
                {editingTypeId === cat._id ? (
                  <>
                    <input
                      type="text"
                      value={editingTypeName}
                      onChange={(e) => setEditingTypeName(e.target.value)}
                      className="w-28 px-2 py-1 text-sm font-bold border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEditType(cat._id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditType}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-black text-primary">{cat.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      ({foodItems.filter((f) => f.category === cat.name).length})
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditType(cat)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit type"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteType(cat)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete type"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {foodItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 mb-6">
            <p className="text-gray-500 mb-4">No menu items yet.</p>
            <button
              type="button"
              onClick={openAddModal}
              className="bg-accent text-white px-6 py-3 rounded-xl font-bold inline-flex items-center"
            >
              <Plus size={20} className="mr-2" /> Add your first item
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {foodItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/80">
                  <td className="px-6 py-4">
                    <img src={resolveImageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded-xl object-cover" onError={handleImageError} />
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black uppercase tracking-wide bg-primary/10 text-primary px-3 py-1 rounded-lg">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-accent">Rs. {item.price}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="text-blue-500 hover:text-blue-700 mr-3 p-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black text-primary mb-6">
                {editingItem ? 'Edit Menu Item' : 'Add Food or Beverage'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Food Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (NPR)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categoryNames.length > 0 ? (
                      categoryNames.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    ) : (
                      <option value={DEFAULT_CATEGORY}>{DEFAULT_CATEGORY}</option>
                    )}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Food Image</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      name="image"
                      required
                      className="flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      placeholder="/uploads/image.jpg or image URL"
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                    <label className="bg-gray-100 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-200 transition flex items-center shrink-0 font-bold text-sm">
                      <Upload size={18} className="mr-2" /> {uploading ? '...' : 'Upload'}
                      <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="md:col-span-2 bg-primary text-white py-3 rounded-xl font-black text-lg hover:bg-primary/90 transition mt-2"
                >
                  {editingItem ? 'Update Item' : 'Add to Menu'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageFood;
