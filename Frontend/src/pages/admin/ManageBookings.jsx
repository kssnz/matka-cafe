import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const ManageBookings = () => {
  const { admin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [admin]);

  const fetchBookings = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin.token}` },
      };
      const { data } = await axios.get('/api/bookings', config);
      setBookings(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin.token}` },
      };
      await axios.put(`/api/bookings/${id}`, { status }, config);
      toast.success('Booking status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Bookings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Table</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{booking.customerName}</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <Phone size={14} className="mr-1" /> {booking.customerPhone}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">Table {booking.tableNumber}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-2" /> {new Date(booking.bookingDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Clock size={16} className="mr-2" /> {booking.bookingTime}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select
                    className="border rounded-lg px-2 py-1 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-primary"
                    value={booking.status}
                    onChange={(e) => updateStatus(booking._id, e.target.value)}
                  >
                    <option value="Confirmed">Confirm</option>
                    <option value="Cancelled">Cancel</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">No bookings found.</div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
