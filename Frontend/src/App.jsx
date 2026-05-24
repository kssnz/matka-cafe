import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFood from './pages/admin/ManageFood';
import ManageOrders from './pages/admin/ManageOrders';
import ManageContent from './pages/admin/ManageContent';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Menu />} />
          <Route path="/menu" element={<Navigate to="/" replace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/food" element={<ProtectedRoute><ManageFood /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><ManageOrders /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
