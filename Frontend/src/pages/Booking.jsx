import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Users, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import BackButton from '../components/BackButton';

const Booking = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    tableNumber: 1,
    bookingDate: '',
    bookingTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/bookings', formData);
      setIsSuccess(true);
      toast.success('Reservation confirmed!', {
        style: {
          borderRadius: '1.5rem',
          background: '#5D2E17',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    } catch (error) {
      toast.error('Failed to book table. Try a different time.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-20">
        <div className="max-w-xl w-full text-center glass p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>
          <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-200">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-5xl font-black mb-4 text-primary tracking-tighter uppercase">RESERVED!</h2>
          <p className="text-gray-600 font-medium text-lg mb-10 leading-relaxed">
            Thank you, <span className="font-black text-primary">{formData.customerName}</span>. <br />
            Your table <span className="text-accent font-black">#{formData.tableNumber}</span> is waiting for you on 
            <span className="font-black text-primary block text-2xl mt-2">{new Date(formData.bookingDate).toLocaleDateString()} at {formData.bookingTime}</span>
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
          >
            BOOK ANOTHER TABLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Premium Experience</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-primary mb-8 tracking-tighter leading-tight">
              RESERVE YOUR <span className="text-accent">MOMENT</span>
            </h1>
            <p className="text-gray-500 text-xl font-medium mb-12 leading-relaxed max-w-lg">
              Avoid the wait and secure your favorite spot. Whether it's a quiet morning tea or a spicy evening feast, we've got you covered.
            </p>
            
            <div className="space-y-8">
              {[
                { icon: <Calendar />, title: "Flexible Dates", desc: "Choose any day that fits your schedule." },
                { icon: <Clock />, title: "Instant Confirm", desc: "Real-time booking with zero wait time." },
                { icon: <Users />, title: "Group Seating", desc: "Up to 5 tables available for your tribe." }
              ].map((item, i) => (
                <div key={i} className="flex items-start group">
                  <div className="bg-white p-4 rounded-2xl mr-6 text-primary shadow-lg group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-primary mb-1">{item.title}</h3>
                    <p className="text-gray-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-accent/5 rounded-[4rem] blur-2xl"></div>
            <div className="relative bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    className="w-full px-6 py-4 bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl outline-none transition-all font-bold text-primary"
                    placeholder="Enter your name"
                    value={formData.customerName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    className="w-full px-6 py-4 bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl outline-none transition-all font-bold text-primary"
                    placeholder="+977-9800000000"
                    value={formData.customerPhone}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Date</label>
                    <input
                      type="date"
                      name="bookingDate"
                      required
                      className="w-full px-6 py-4 bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl outline-none transition-all font-bold text-primary"
                      value={formData.bookingDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Time</label>
                    <input
                      type="time"
                      name="bookingTime"
                      required
                      className="w-full px-6 py-4 bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl outline-none transition-all font-bold text-primary"
                      value={formData.bookingTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Select Table</label>
                  <select
                    name="tableNumber"
                    className="w-full px-6 py-4 bg-cream/50 border-2 border-transparent focus:border-accent/30 rounded-2xl outline-none transition-all font-bold text-primary appearance-none cursor-pointer"
                    value={formData.tableNumber}
                    onChange={handleChange}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>Table {num} (Ground Floor)</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 mt-4 flex items-center justify-center group"
                >
                  {loading ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      CONFIRM RESERVATION <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
