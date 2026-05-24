import { useState, useEffect } from 'react';
import api from '../api';
import FoodCard from '../components/FoodCard';
import Loader from '../components/Loader';
import BackButton from '../components/BackButton';
import { Search, UtensilsCrossed, ShoppingBag, Trash2, CreditCard, User, Lock, MapPin, ChevronLeft, History, CheckCircle2, Clock, AlertCircle, Plus, Minus, XCircle, Edit3, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const Menu = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [tableNumber, setTableNumber] = useState(null);
  const [tables, setTables] = useState([
    { _id: 't1', tableNumber: 1, isOccupied: false },
    { _id: 't2', tableNumber: 2, isOccupied: false },
    { _id: 't3', tableNumber: 3, isOccupied: false },
    { _id: 't4', tableNumber: 4, isOccupied: false },
    { _id: 't5', tableNumber: 5, isOccupied: false }
  ]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', orderPin: '' });
  const [step, setStep] = useState(1); // 1: Table Select, 2: Menu
  const [reentering, setReentering] = useState(false); // To toggle between "New Order" and "Re-enter"
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'orders'
  const [myOrders, setMyOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const { cartItems, removeFromCart, updateQty, itemsPrice, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setApiError(null);
      try {
        const [foodRes, tablesRes] = await Promise.allSettled([
          api.get('/api/food'),
          api.get('/api/tables'),
        ]);

        if (foodRes.status === 'fulfilled') {
          setFoodItems(foodRes.value.data);
        } else {
          const msg = foodRes.reason?.message || foodRes.reason?.response?.data?.message;
          setApiError(msg || 'Failed to load menu items');
          console.error('Error fetching food', foodRes.reason);
        }

        if (tablesRes.status === 'fulfilled' && tablesRes.value.data?.length > 0) {
          setTables(tablesRes.value.data);
        } else if (tablesRes.status === 'rejected') {
          console.error('Error fetching tables', tablesRes.reason);
        }
      } catch (error) {
        setApiError(error.message || 'Failed to load data');
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTab === 'orders' && tableNumber && customerInfo.orderPin) {
      fetchMyOrders();
      // Poll every 5 seconds for status updates (Preparing, Delivered etc)
      interval = setInterval(fetchMyOrders, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, tableNumber, customerInfo.orderPin]);

  const fetchMyOrders = async () => {
    try {
      const { data } = await api.get(`/api/orders/myorders?table=${tableNumber}&pin=${customerInfo.orderPin}`);
      
      // If we are editing an order, we want to be careful about overwriting local state
      // But since we fetch from DB and status is what matters most, we update.
      setMyOrders(data);
    } catch (error) {
      console.error('Error fetching my orders', error);
    }
  };

  const updateItemQty = async (orderId, itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      await api.put(`/api/orders/${orderId}/items`, { itemId, qty: newQty });
      fetchMyOrders();
      toast.success('Quantity updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      fetchMyOrders();
      toast.success('Order cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleTableSelect = async (table) => {
    if (table.isOccupied) {
      setReentering(true);
      setTableNumber(table.tableNumber);
      return;
    }
    setReentering(false);
    setTableNumber(table.tableNumber);
  };

  const handleReenter = async () => {
    if (!customerInfo.orderPin) {
      toast.error('Please enter your 4-digit PIN');
      return;
    }

    const pin = String(customerInfo.orderPin).trim();
    if (!/^\d{4}$/.test(pin)) {
      toast.error('Pin must be exactly 4 digits');
      return;
    }

    try {
      const { data } = await api.post('/api/tables/verify-pin', {
        tableNumber: Number(tableNumber),
        orderPin: pin,
      });
      setCustomerInfo({ ...customerInfo, name: data.customerName });
      setStep(2);
      toast.success(`Welcome back, ${data.customerName}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid PIN');
    }
  };

  const proceedToMenu = async () => {
    if (tableNumber == null) {
      toast.error('Please select a table first');
      return;
    }

    const selectedTable = tables.find((t) => t.tableNumber === tableNumber);
    if (selectedTable?.isOccupied) {
      toast.error('This table is taken. Tap it again and use Re-enter with your PIN.');
      setReentering(true);
      return;
    }

    const name = customerInfo.name.trim();
    const pin = String(customerInfo.orderPin).trim();

    if (!name || !pin) {
      toast.error('Please enter your name and a 4-digit pin');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      toast.error('Pin must be exactly 4 digits');
      return;
    }

    const payload = {
      tableNumber: Number(tableNumber),
      customerName: name,
      orderPin: pin,
    };

    try {
      await api.post('/api/tables/occupy', payload);
      setCustomerInfo({ name, orderPin: pin });
      setStep(2);
      toast.success(`Table ${tableNumber} is ready — enjoy your order!`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to select table';
      toast.error(msg);
    }
  };

  const categories = ['All', ...new Set(foodItems.map((item) => item.category))];

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Add something to your tray first!');
      return;
    }

    setOrderLoading(true);
    try {
      const orderData = {
        customerName: customerInfo.name,
        orderPin: customerInfo.orderPin,
        tableNumber: tableNumber,
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          foodItem: item._id
        })),
        totalPrice: itemsPrice,
      };

      await api.post('/api/orders', orderData);
      toast.success('Order placed successfully! 🥟', {
        duration: 4000,
        style: { background: '#5D2E17', color: '#fff', borderRadius: '1rem' }
      });
      clearCart();
      fetchMyOrders(); // Refresh order history
      setActiveTab('orders'); // Switch to orders tab to show progress
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return <Loader />;

  const ApiErrorBanner = apiError ? (
    <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold text-center">
      {apiError} — run <code className="bg-red-100 px-1 rounded">npm run backend</code> from project root
    </div>
  ) : null;

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] pt-32 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full glass p-10 rounded-[3rem] shadow-2xl border-white/50 text-center">
          {ApiErrorBanner}
          <div className="bg-accent/10 p-4 rounded-3xl text-accent inline-block mb-6">
            <MapPin size={32} />
          </div>
          <h2 className="text-4xl font-black text-primary mb-2 tracking-tighter">
            {reentering ? 'RE-ENTER TABLE' : 'SELECT YOUR TABLE'}
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-10">
            {reentering 
              ? `Enter your 4-digit PIN for Table ${tableNumber} to add more items` 
              : 'Choose an available table to start ordering'}
          </p>

          {/* Customer Info */}
          <div className="space-y-4 mb-10">
            {!reentering && (
              <input 
                type="text"
                placeholder="Your Name"
                className="w-full px-6 py-4 bg-cream/50 rounded-2xl text-sm font-bold outline-none focus:ring-1 focus:ring-accent/30 text-center"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
            )}
            <div className="relative">
              {reentering && <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={18} />}
              <input 
                type="tel"
                maxLength="4"
                placeholder="4-Digit Order Pin"
                className={`w-full px-6 py-4 bg-cream/50 rounded-2xl text-sm font-bold outline-none focus:ring-1 focus:ring-accent/30 text-center ${reentering ? 'border-2 border-accent/20' : ''}`}
                value={customerInfo.orderPin}
                onChange={(e) => setCustomerInfo({...customerInfo, orderPin: e.target.value.replace(/\D/g, '')})}
              />
            </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-5 gap-3 mb-12">
            {tables.map((t) => (
              <button
                key={t._id}
                onClick={() => handleTableSelect(t)}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all ${
                  tableNumber === t.tableNumber
                  ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-110'
                  : t.isOccupied 
                  ? 'bg-primary/10 text-primary border-2 border-primary/20' 
                  : 'bg-white text-primary hover:bg-cream border border-gray-100'
                }`}
              >
                <span className="text-lg font-black">{t.tableNumber}</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">
                  {t.isOccupied ? 'Taken' : 'Open'}
                </span>
              </button>
            ))}
          </div>

          {reentering ? (
            <div className="space-y-4">
              <button
                onClick={handleReenter}
                className="w-full bg-accent text-white py-5 rounded-[2rem] font-black text-xl hover:bg-accent/90 transition-all shadow-xl shadow-accent/20"
              >
                RE-ENTER TABLE
              </button>
              <button 
                onClick={() => { setReentering(false); setTableNumber(null); }}
                className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
              >
                Choose another table
              </button>
            </div>
          ) : (
            <button
              onClick={proceedToMenu}
              className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20"
            >
              EXPLORE MENU
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF5E6] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {ApiErrorBanner}
        <button onClick={() => setStep(1)} className="flex items-center space-x-2 text-primary hover:text-accent font-black transition-all group mb-6">
          <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 group-hover:bg-accent group-hover:text-white transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="uppercase tracking-widest text-xs">Change Table</span>
        </button>
        
        <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Menu or History (70%) */}
        <div className="lg:w-[70%]">
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                activeTab === 'menu' 
                ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              <UtensilsCrossed size={18} /> Food Menu
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative ${
                activeTab === 'orders' 
                ? 'bg-accent text-white shadow-xl shadow-accent/20' 
                : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              <History size={18} /> My Orders
              {myOrders.some(o => o.status !== 'Delivered') && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-[#FDF5E6]"></span>
              )}
            </button>
          </div>

          {activeTab === 'menu' ? (
            <>
              <header className="mb-10">
                <p className="text-accent font-black tracking-widest text-xs uppercase mb-2">Today's Menu</p>
                <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter leading-none mb-6">
                  Brewed with care,<br />served with warmth.
                </h1>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                        category === cat 
                        ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                        : 'bg-white/50 text-gray-500 hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative group max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search food or drinks..."
                    className="w-full pl-12 pr-6 py-3 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </header>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((food) => (
                  <FoodCard key={food._id} food={food} />
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <UtensilsCrossed size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No items found in this category</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <header className="mb-8 flex justify-between items-end">
                <div>
                  <p className="text-accent font-black tracking-widest text-xs uppercase mb-2">Order History</p>
                  <h2 className="text-4xl font-black text-primary tracking-tighter">Track your cravings.</h2>
                </div>
                {myOrders.length > 0 && (
                  <div className="text-right bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Grand Total Amount</span>
                    <span className="text-2xl font-black text-accent tracking-tighter">Rs. {myOrders.reduce((acc, order) => acc + order.totalPrice, 0)}</span>
                  </div>
                )}
              </header>

              {myOrders.length > 0 ? (
                myOrders.map((order) => (
                  <div key={order._id} className={`bg-white rounded-[2.5rem] overflow-hidden border shadow-sm ${order.status === 'Cancelled' ? 'opacity-60 grayscale' : 'border-gray-100'}`}>
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Order Status</span>
                        <div className="flex items-center gap-2">
                          {order.status === 'Delivered' ? <CheckCircle2 size={16} className="text-green-500" /> : 
                           order.status === 'Cancelled' ? <XCircle size={16} className="text-red-400" /> :
                           <Clock size={16} className="text-accent animate-pulse" />}
                          <span className={`text-sm font-black uppercase ${
                            order.status === 'Delivered' ? 'text-green-600' : 
                            order.status === 'Cancelled' ? 'text-red-400' : 
                            'text-accent'
                          }`}>{order.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {order.status === 'Pending' && (
                          <div className="flex items-center gap-2">
                            {editingOrderId === order._id ? (
                              <button 
                                onClick={() => setEditingOrderId(null)}
                                className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-colors flex items-center gap-1"
                              >
                                <Check size={12} /> Done
                              </button>
                            ) : (
                              <button 
                                onClick={() => setEditingOrderId(order._id)}
                                className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors flex items-center gap-1"
                              >
                                <Edit3 size={12} /> Edit Items
                              </button>
                            )}
                            <button 
                              onClick={() => handleCancelOrder(order._id)}
                              className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}
                        <div className="text-right">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Order ID</span>
                          <span className="text-xs font-bold text-primary">#{order._id.slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cream overflow-hidden flex-shrink-0">
                                <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" onError={handleImageError} />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-primary uppercase leading-none">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-gray-400 font-bold">Qty:</span>
                                  {order.status === 'Pending' && editingOrderId === order._id ? (
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-0.5 border border-primary/10">
                                      <button 
                                        onClick={() => updateItemQty(order._id, item._id, item.qty, -1)}
                                        className="text-gray-400 hover:text-accent transition-colors"
                                      >
                                        <Minus size={12} />
                                      </button>
                                      <span className="text-xs font-black text-primary min-w-[12px] text-center">{item.qty}</span>
                                      <button 
                                        onClick={() => updateItemQty(order._id, item._id, item.qty, 1)}
                                        className="text-gray-400 hover:text-accent transition-colors"
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-black text-primary">{item.qty}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-black text-primary">Rs. {item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Placed On</span>
                          <span className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Paid</span>
                          <span className="text-2xl font-black text-accent tracking-tighter">Rs. {order.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders placed yet</p>
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="mt-4 text-accent font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Go to menu
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Order Tray (30%) */}
        <div className="lg:w-[30%]">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-8 sticky top-28 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 p-2 rounded-xl text-accent">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-black text-primary tracking-tight uppercase">Order Details</h2>
              </div>
              <div className="bg-cream px-3 py-1 rounded-full">
                <span className="text-[10px] font-black text-primary uppercase">Serving: Table {tableNumber}</span>
              </div>
            </div>

            {/* Customer Info Form */}
            <div className="space-y-4 mb-8">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text"
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-3 bg-cream/50 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent/30"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="tel"
                  placeholder="Order PIN"
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-cream/50 rounded-xl text-xs font-bold outline-none cursor-not-allowed opacity-70"
                  value={customerInfo.orderPin}
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin mb-8">
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center group">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream flex-shrink-0">
                        <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" onError={handleImageError} />
                      </div>
                      <div className="ml-4 flex-grow min-w-0">
                        <h4 className="text-xs font-black text-primary truncate uppercase tracking-tight">{item.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-gray-400 font-bold">{item.qty}x</span>
                          <span className="text-[10px] text-accent font-black">Rs. {item.price * item.qty}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-gray-400 italic">Your tray is empty. Add something delicious ✨</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-50 pt-6">
              <div className="flex justify-between items-center mb-2 text-gray-400">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Items</span>
                <span className="text-sm font-black">{cartItems.reduce((acc, i) => acc + i.qty, 0)}</span>
              </div>
              <div className="flex justify-between items-end mb-8">
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Grand Total</span>
                <span className="text-3xl font-black text-accent tracking-tighter">Rs. {itemsPrice}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading || cartItems.length === 0}
                className="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:grayscale"
              >
                {orderLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CreditCard size={18} className="mr-2" /> PLACE ORDER
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Menu;
