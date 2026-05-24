import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Save, Layout, Info, PhoneCall, Upload, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const ManageContent = () => {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState({
    hero: { title: '', subtitle: '', description: '', image: '' },
    about: { title: '', description: '' },
    contact: { title: '', details: { address: '', phone: '', email: '' } },
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [hero, about, contact] = await Promise.all([
          axios.get('/api/content/hero'),
          axios.get('/api/content/about'),
          axios.get('/api/content/contact'),
        ]);
        setSections({
          hero: hero.data,
          about: about.data,
          contact: contact.data,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching content', error);
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleUpdate = async (section, data) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin.token}` },
      };
      await axios.post('/api/content', { section, ...data }, config);
      toast.success(`${section.toUpperCase()} updated successfully`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleUpload = async (e, section) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${admin.token}`,
        },
      };
      const { data } = await axios.post('/api/food/upload', uploadData, config);
      setSections({
        ...sections,
        [section]: { ...sections[section], image: data }
      });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-primary text-white p-6">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <LayoutDashboard className="mr-2" /> Admin Panel
        </h2>
        <nav className="space-y-4">
          <Link to="/admin" className="block p-3 rounded-lg hover:bg-secondary/20 transition">Dashboard</Link>
          <Link to="/admin/food" className="block p-3 rounded-lg hover:bg-secondary/20 transition">Food & Beverages</Link>
          <Link to="/admin/orders" className="block p-3 rounded-lg hover:bg-secondary/20 transition">Manage Orders</Link>
          <Link to="/admin/content" className="block p-3 rounded-lg bg-secondary text-primary font-bold">Site Content</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Site Content Management</h1>

      <div className="space-y-12 max-w-4xl">
        {/* Hero Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Layout className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Hero Section</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={sections.hero.title}
                onChange={(e) => setSections({...sections, hero: {...sections.hero, title: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={sections.hero.subtitle}
                onChange={(e) => setSections({...sections, hero: {...sections.hero, subtitle: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={sections.hero.description}
                onChange={(e) => setSections({...sections, hero: {...sections.hero, description: e.target.value}})}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg outline-none bg-gray-50"
                  value={sections.hero.image}
                  readOnly
                />
                <label className="bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition flex items-center">
                  <Upload size={18} className="mr-2" /> Upload
                  <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'hero')} />
                </label>
              </div>
            </div>
            <button
              onClick={() => handleUpdate('hero', sections.hero)}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center"
            >
              <Save size={18} className="mr-2" /> Save Hero Section
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="bg-secondary/20 p-2 rounded-lg text-primary">
              <Info size={24} />
            </div>
            <h2 className="text-xl font-bold">About Section</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={sections.about.title}
                onChange={(e) => setSections({...sections, about: {...sections.about, title: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows="5"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={sections.about.description}
                onChange={(e) => setSections({...sections, about: {...sections.about, description: e.target.value}})}
              ></textarea>
            </div>
            <button
              onClick={() => handleUpdate('about', sections.about)}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center"
            >
              <Save size={18} className="mr-2" /> Save About Section
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ManageContent;
