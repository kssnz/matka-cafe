import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import logo from '../IMAGE/Matkalogo.jpeg';

const Navbar = () => {
  const { cartItems } = useCart();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Menu', path: '/' },
  ];

  return (
    <nav 
      className="fixed w-full z-50 transition-all duration-300 bg-primary shadow-xl py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <div className="mr-3 group-hover:rotate-6 transition-transform duration-300">
              <img src={logo} alt="Matka House Logo" className="h-12 w-12 rounded-full border-2 border-accent object-cover shadow-lg" />
            </div>
            <span className="text-white font-black text-2xl tracking-tighter">
              MATKA<span className="text-accent">HOUSE</span>
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-accent ${
                    location.pathname === link.path ? 'text-accent' : 'text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-white/20"></div>

            <div className="flex items-center space-x-5">
              <Link to="/cart" className="relative group">
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  <ShoppingCart size={22} className="text-white" />
                </div>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-primary shadow-lg animate-bounce">
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                )}
              </Link>

              {admin ? (
                <div className="flex items-center space-x-4">
                  <Link to="/admin/food" className="text-sm font-bold uppercase tracking-widest text-white/90 hover:text-accent transition-colors">
                    Menu Items
                  </Link>
                  <Link to="/admin" className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors text-white text-sm font-bold">
                    <User size={18} className="mr-2" /> Admin
                  </Link>
                  <button onClick={handleLogout} className="text-white/70 hover:text-red-400 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  LOGIN
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative p-2">
              <ShoppingCart size={24} className="text-white" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-primary">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
        <div className="bg-primary/95 backdrop-blur-xl border-t border-white/10 px-4 pt-4 pb-8 space-y-2 shadow-2xl">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`block px-4 py-4 rounded-2xl text-lg font-bold ${
                location.pathname === link.path ? 'bg-accent text-white' : 'text-white hover:bg-white/5'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 space-y-2">
            {admin ? (
              <>
                <Link to="/admin/food" className="block w-full bg-accent text-white px-4 py-4 rounded-2xl font-bold text-center" onClick={() => setIsOpen(false)}>Add Food / Beverage</Link>
                <Link to="/admin" className="block w-full bg-white/10 text-white px-4 py-4 rounded-2xl font-bold text-center" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                <button onClick={handleLogout} className="block w-full text-red-400 bg-red-400/10 px-4 py-4 rounded-2xl font-bold">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block w-full bg-accent text-white px-4 py-4 rounded-2xl font-black text-center shadow-lg" onClick={() => setIsOpen(false)}>LOGIN</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
