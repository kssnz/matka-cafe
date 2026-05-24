import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  User,
  Lock,
  MapPin,
  Clock,
  Bell,
  CheckCircle,
  LayoutDashboard,
  Trash2,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Preparing: 'bg-sky-100 text-sky-800 border-sky-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-orange-100 text-orange-800 border-orange-200',
};

const FILTERS = ['All', 'Pending', 'Preparing', 'Delivered', 'Cancelled'];

const ManageOrders = () => {
  const { admin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const authConfig = useCallback(
    () => ({
      headers: { Authorization: `Bearer ${admin?.token}` },
    }),
    [admin?.token]
  );

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!admin?.token) {
        setLoading(false);
        return;
      }

      if (!silent) setRefreshing(true);
      try {
        const { data } = await api.get('/api/orders', authConfig());
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!silent) {
          const msg =
            error.response?.status === 401
              ? 'Session expired. Please log in again.'
              : error.response?.data?.message ||
                error.message ||
                'Failed to fetch orders';
          toast.error(msg);
        }
      } finally {
        setLoading(false);
        if (!silent) setRefreshing(false);
      }
    },
    [admin?.token, authConfig]
  );

  useEffect(() => {
    if (!admin?.token) return;
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, [admin?.token, fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status }, authConfig());
      toast.success('Order status updated');
      fetchOrders(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const markAsSeen = async (id) => {
    try {
      await api.put(`/api/orders/${id}/seen`, {}, authConfig());
      toast.success('Marked as seen');
      fetchOrders(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as seen');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order permanently? This cannot be undone.')) return;

    try {
      await api.delete(`/api/orders/${id}`, authConfig());
      toast.success('Order deleted');
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const isPastOrder = (status) => status === 'Delivered' || status === 'Cancelled';

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'Cancelled');
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      preparing: orders.filter((o) => o.status === 'Preparing').length,
      sales: active.reduce((acc, o) => acc + o.totalPrice, 0),
      newCount: orders.filter((o) =>
        Array.isArray(o.orderItems) && o.orderItems.some((i) => i.isNewItem)
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  if (loading) return <Loader />;

  const navLink = (to, label, active) => (
    <Link
      to={to}
      className={`block p-3 rounded-xl text-sm font-bold transition ${
        active
          ? 'bg-white text-primary shadow-md'
          : 'text-white/90 hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F0E8]">
      <aside className="w-full lg:w-64 bg-primary text-white p-6 shrink-0">
        <h2 className="text-xl font-black mb-8 flex items-center tracking-tight">
          <LayoutDashboard className="mr-2 text-accent" size={22} /> Admin Panel
        </h2>
        <nav className="space-y-2">
          {navLink('/admin', 'Dashboard', false)}
          {navLink('/admin/food', 'Food & Beverages', false)}
          {navLink('/admin/orders', 'Manage Orders', true)}
          {navLink('/admin/content', 'Site Content', false)}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8 min-w-0 max-w-6xl mx-auto w-full">
        <header className="mb-8">
          <p className="text-accent font-black text-[10px] uppercase tracking-[0.25em] mb-2">
            Kitchen & floor
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                Manage Orders
              </h1>
              <p className="text-gray-500 text-sm mt-1 max-w-md">
                Update status, mark new items seen, and remove delivered or cancelled orders.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchOrders()}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 shadow-sm hover:shadow-md transition disabled:opacity-60"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              All orders
            </span>
            <p className="text-2xl font-black text-primary mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              Pending
            </span>
            <p className="text-2xl font-black text-amber-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm">
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">
              Preparing
            </span>
            <p className="text-2xl font-black text-sky-700 mt-1">{stats.preparing}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-primary/10 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Active sales
            </span>
            <p className="text-2xl font-black text-accent mt-1">Rs. {stats.sales}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Filter size={16} className="text-gray-400" />
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                statusFilter === f
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-primary/30'
              }`}
            >
              {f}
              {f !== 'All' && (
                <span className="ml-1.5 opacity-70">
                  ({orders.filter((o) => o.status === f).length})
                </span>
              )}
            </button>
          ))}
          {stats.newCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-full">
              <Bell size={14} /> {stats.newCount} with new items
            </span>
          )}
        </div>

        <div className="space-y-5">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const hasNewItems =
                Array.isArray(order.orderItems) &&
                order.orderItems.some((item) => item.isNewItem);
              const statusClass = STATUS_STYLES[order.status] || STATUS_STYLES.Pending;

              return (
                <article
                  key={order._id}
                  className={`bg-white rounded-[1.75rem] shadow-sm overflow-hidden transition-all ${
                    hasNewItems
                      ? 'ring-2 ring-accent/40 border-2 border-accent/30'
                      : 'border border-gray-100'
                  }`}
                >
                  <div className="px-5 py-4 md:px-6 md:py-5 bg-gradient-to-r from-gray-50/80 to-white border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className={`shrink-0 p-3 rounded-2xl relative ${
                          hasNewItems ? 'bg-accent text-white' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <ShoppingBag size={22} />
                        {hasNewItems && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-lg text-primary">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </h3>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${statusClass}`}
                          >
                            {order.status}
                          </span>
                          {hasNewItems && (
                            <span className="text-[10px] font-black uppercase text-accent flex items-center gap-1">
                              <Bell size={12} /> New items
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {hasNewItems && (
                        <button
                          type="button"
                          onClick={() => markAsSeen(order._id)}
                          className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-700 transition"
                        >
                          <CheckCircle size={14} /> Mark seen
                        </button>
                      )}
                      <label className="sr-only" htmlFor={`status-${order._id}`}>
                        Update status
                      </label>
                      <select
                        id={`status-${order._id}`}
                        className="appearance-none bg-white border-2 border-gray-200 text-primary text-xs font-black uppercase tracking-wide rounded-xl pl-4 pr-8 py-2.5 outline-none focus:border-primary cursor-pointer min-w-[140px]"
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      {isPastOrder(order.status) && (
                        <button
                          type="button"
                          onClick={() => deleteOrder(order._id)}
                          className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <section className="md:col-span-4 bg-[#FDF5E6] rounded-2xl p-5 space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Customer
                      </h4>
                      <div className="space-y-3 text-sm">
                        <p className="flex items-center gap-3 text-primary font-bold">
                          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400">
                            <User size={16} />
                          </span>
                          {order.customerName}
                        </p>
                        <p className="flex items-center gap-3 text-gray-600">
                          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400">
                            <Lock size={16} />
                          </span>
                          PIN{' '}
                          <span className="font-black text-primary tracking-widest">
                            {order.orderPin}
                          </span>
                        </p>
                        <p className="flex items-center gap-3 text-gray-600">
                          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400">
                            <MapPin size={16} />
                          </span>
                          Table{' '}
                          <span className="font-black text-accent text-base">
                            {order.tableNumber}
                          </span>
                        </p>
                      </div>
                    </section>

                    <section className="md:col-span-8 flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Items ordered
                        </h4>
                        <span className="text-[9px] font-bold text-gray-300 uppercase">
                          Latest first
                        </span>
                      </div>
                      <ul className="flex-1 space-y-2 rounded-2xl bg-gray-50/80 p-4 border border-gray-100">
                        {[...(order.orderItems || [])].reverse().map((item, idx) => (
                          <li
                            key={idx}
                            className={`flex justify-between items-center gap-4 py-2.5 px-3 rounded-xl ${
                              item.isNewItem
                                ? 'bg-white border border-accent/20 shadow-sm'
                                : ''
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-primary text-sm truncate">
                                {item.qty}× {item.name}
                                {item.isNewItem && (
                                  <span className="ml-2 text-[9px] bg-accent text-white px-1.5 py-0.5 rounded uppercase">
                                    New
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(item.orderedAt || order.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </p>
                            </div>
                            <span className="font-black text-primary text-sm shrink-0 tabular-nums">
                              Rs. {item.price * item.qty}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-200">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Order total
                        </span>
                        <span className="text-2xl font-black text-accent tabular-nums">
                          Rs. {order.totalPrice}
                        </span>
                      </div>
                    </section>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
              <ShoppingBag size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-bold">
                {statusFilter === 'All'
                  ? 'No orders yet.'
                  : `No ${statusFilter.toLowerCase()} orders.`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageOrders;
