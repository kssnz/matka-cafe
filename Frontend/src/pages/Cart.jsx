import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ChevronLeft, CreditCard, ShoppingBag, User, Lock, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import BackButton from '../components/BackButton';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const Cart = () => {
  const { cartItems, removeFromCart, updateQty, itemsPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    orderPin: '',
    tableNumber: 1,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (formData.orderPin.length !== 4) {
      toast.error('Pin must be 4 digits');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: formData.customerName,
        orderPin: formData.orderPin,
        tableNumber: formData.tableNumber,
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          foodItem: item._id
        })),
        totalPrice: itemsPrice,
      };

      await axios.post('/api/orders', orderData);
      toast.success('Order placed successfully! We are preparing your food.', {
        duration: 5000,
        style: {
          borderRadius: '1.5rem',
          background: '#5D2E17',
          color: '#fff',
          fontWeight: 'bold',
          padding: '1.5rem'
        }
      });
      clearCart();
      navigate('/');
    } catch (error) {
      toast.error('Failed to place order. Please check your connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center glass p-12 rounded-[3rem] shadow-2xl">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={40} className="text-primary" />
          </div>
          <h2 className="text-4xl font-black text-primary mb-4 tracking-tighter">CART IS EMPTY</h2>
          <p className="text-gray-500 font-bold mb-10 uppercase tracking-widest text-xs">Hungry? Explore our delicious menu now!</p>
          <Link to="/menu" className="bg-accent text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all flex items-center justify-center group">
            <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> START ORDERING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <h1 className="text-5xl font-black text-primary mb-12 tracking-tight">YOUR ORDER</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 group transition-all hover:shadow-2xl">
                <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-3xl">
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={handleImageError}
                  />
                </div>
                <div className="ml-8 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-2xl text-primary mb-1">{item.name}</h3>
                      <p className="text-accent font-black">Rs. {item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                  <div className="flex items-center mt-6">
                    <div className="bg-cream rounded-2xl p-1 flex items-center shadow-inner">
                      <button
                        onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
                        className="p-2 rounded-xl hover:bg-white text-primary transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="mx-6 font-black text-lg text-primary">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        className="p-2 rounded-xl hover:bg-white text-primary transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal</p>
                      <p className="font-black text-xl text-primary">Rs. {item.price * item.qty}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl h-fit sticky top-32">
            <h2 className="text-3xl font-black mb-8 border-b border-white/10 pb-6 tracking-tighter uppercase">Order Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  name="customerName"
                  placeholder="Your Name"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/10 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold placeholder:text-white/30"
                  value={formData.customerName}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="tel"
                  name="orderPin"
                  maxLength="4"
                  placeholder="4-Digit Order Pin"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/10 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold placeholder:text-white/30"
                  value={formData.orderPin}
                  onChange={(e) => setFormData({...formData, orderPin: e.target.value.replace(/\D/g, '')})}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <select
                  name="tableNumber"
                  className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/10 rounded-2xl focus:ring-2 focus:ring-accent outline-none font-bold appearance-none cursor-pointer"
                  value={formData.tableNumber}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num} className="bg-primary text-white">Table {num}</option>
                  ))}
                </select>
              </div>

              <div className="pt-8 mt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-white/60 font-bold uppercase tracking-widest text-sm">Grand Total</span>
                  <span className="text-4xl font-black text-accent tracking-tighter leading-none">Rs. {itemsPrice}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-accent/40 transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CreditCard size={24} className="mr-3" /> PLACE ORDER
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
