import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { ArrowRight, Coffee, Utensils, Star, Clock, MapPin } from 'lucide-react';
import { resolveImageUrl, handleImageError, HERO_PLACEHOLDER } from '../utils/imageUtils';

const Home = () => {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await axios.get('/api/content/hero');
        setHero(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hero content', error);
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return <Loader />;

  const heroImage = resolveImageUrl(hero?.image, HERO_PLACEHOLDER);

  return (
    <div className="flex flex-col">
      {/* Hero Section with Parallax and Gradient Overlay */}
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-cream/100 z-10"></div>
        <img
          src={heroImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
          onError={(e) => handleImageError(e, HERO_PLACEHOLDER)}
        />
        
        <div className="relative z-20 text-center px-4 max-w-5xl">
          <div className="inline-flex items-center space-x-2 bg-accent/20 backdrop-blur-md border border-accent/30 px-4 py-2 rounded-full mb-6 animate-fade-in-down">
            <Star className="text-accent fill-accent" size={16} />
            <span className="text-sm font-black tracking-widest uppercase text-accent">Top Rated Cafe in Nepal</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter animate-fade-in">
            {hero?.title || "MATKA CAFE"}
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-white/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {hero?.subtitle || "Authentic Nepali flavors served in traditional clay pots for an earthy, unforgettable experience."}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up">
            <Link
              to="/menu"
              className="bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-accent/40 transition-all hover:-translate-y-1 flex items-center justify-center"
            >
              EXPLORE MENU <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>

        {/* Floating Badges */}
        <div className="absolute bottom-20 left-10 z-20 hidden lg:block animate-bounce-slow">
          <div className="glass p-4 rounded-3xl shadow-2xl flex items-center space-x-4">
            <div className="bg-primary p-3 rounded-2xl">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Opening Hours</p>
              <p className="text-sm font-black text-primary">8:00 AM - 10:00 PM</p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 right-10 z-20 hidden lg:block animate-bounce-slow-delayed">
          <div className="glass p-4 rounded-3xl shadow-2xl flex items-center space-x-4">
            <div className="bg-accent p-3 rounded-2xl">
              <MapPin className="text-white" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Location</p>
              <p className="text-sm font-black text-primary">Kathmandu, Nepal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experience Section */}
      <section className="py-32 bg-cream relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-accent font-black tracking-[0.2em] uppercase text-sm mb-4">Our Essence</h2>
            <h3 className="text-5xl md:text-6xl font-black text-primary tracking-tight">THE MATKA EXPERIENCE</h3>
            <div className="w-20 h-2 bg-accent mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: <Coffee size={32} />, 
                title: "Traditional Matka", 
                desc: "Brewed in clay pots that infuse an earthy essence into every sip of our signature masala tea.",
                color: "bg-primary"
              },
              { 
                icon: <Utensils size={32} />, 
                title: "Local Spices", 
                desc: "We source authentic spices from the hills of Nepal to create that perfect kick in our Choila.",
                color: "bg-accent"
              },
              { 
                icon: <Star size={32} />, 
                title: "Cultural Vibes", 
                desc: "A cozy environment that feels like home, perfect for making memories with your loved ones.",
                color: "bg-primary-light"
              }
            ].map((feature, i) => (
              <div key={i} className="group relative bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-gray-100 overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-[0.03] rounded-bl-full group-hover:scale-150 transition-transform duration-700`}></div>
                <div className={`${feature.color} w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-black text-primary mb-4">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
