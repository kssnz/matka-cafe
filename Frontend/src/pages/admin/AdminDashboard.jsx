import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin.token}` },
      };
      const [statsRes, ordersRes, tablesRes] = await Promise.all([
        api.get('/api/orders/stats', config),
        api.get('/api/orders', config),
        api.get('/api/tables')
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
      setTables(tablesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      setLoading(false);
    }
  };

  const handleReleaseTable = async (id) => {
    if (window.confirm('Are you sure you want to clear this table?')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${admin.token}` },
        };
        await api.post(`/api/tables/release/${id}`, {}, config);
        toast.success('Table cleared and released');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        toast.error('Failed to release table');
      }
    }
  };

  if (loading) return <Loader />;

  const statCards = [
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingBag size={24} />, color: 'bg-blue-500' },
    { title: 'Total Revenue', value: `Rs. ${stats?.totalRevenue || 0}`, icon: <DollarSign size={24} />, color: 'bg-green-500' },
    { title: 'Recent Orders', value: recentOrders.length, icon: <Clock size={24} />, color: 'bg-yellow-500' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-primary text-white p-6">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <LayoutDashboard className="mr-2" /> Admin Panel
        </h2>
        <nav className="space-y-4">
          <Link to="/admin" className="block p-3 rounded-lg bg-secondary text-primary font-bold">Dashboard</Link>
          <Link to="/admin/food" className="block p-3 rounded-lg hover:bg-secondary/20 transition">Food & Beverages</Link>
          <Link to="/admin/orders" className="block p-3 rounded-lg hover:bg-secondary/20 transition">Manage Orders</Link>
          <Link to="/admin/content" className="block p-3 rounded-lg hover:bg-secondary/20 transition">Site Content</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="flex items-center gap-3">
          <Link
            to="/admin/food"
            className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent/90 transition shadow-lg shadow-accent/20"
          >
            + Add Food / Beverage
          </Link>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-600">Admin Active</span>
          </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
              <div className={`${stat.color} p-4 rounded-xl text-white mr-6`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Table Status Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-2 h-8 bg-accent rounded-full mr-3"></div>
            Real-time Table Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {tables.map((table) => (
              <div key={table._id} className={`p-6 rounded-[2rem] border transition-all ${
                table.isOccupied 
                ? 'bg-white border-red-100 shadow-lg shadow-red-50' 
                : 'bg-white border-gray-100 shadow-sm'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-black text-primary">#{table.tableNumber}</span>
                  {table.isOccupied ? (
                    <XCircle className="text-red-500" size={20} />
                  ) : (
                    <CheckCircle2 className="text-green-500" size={20} />
                  )}
                </div>
                
                {table.isOccupied ? (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                    <p className="text-sm font-black text-primary truncate mb-1">{table.occupiedBy}</p>
                    <div className="flex items-center text-accent mb-4">
                      <Lock size={12} className="mr-1" />
                      <span className="text-xs font-black">PIN: {table.orderPin}</span>
                    </div>
                    <button 
                      onClick={() => handleReleaseTable(table._id)}
                      className="w-full py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all"
                    >
                      CLEAR TABLE
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-green-600">Available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary hover:underline text-sm font-bold">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4 font-bold">Rs. {order.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'Preparing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
