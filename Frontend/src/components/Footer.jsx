const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-24 pb-12 relative overflow-hidden">
      {/* Decorative Gradient Element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-black mb-6 tracking-tighter">
              MATKA<span className="text-accent">HOUSE</span>
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">
              Inaruwa's premier 100% pure vegetarian cafe. We bring you the soul of Nepal in every clay pot.
            </p>
            <div className="flex space-x-4 mt-8">
              {['FB', 'IG', 'TW', 'YT'].map((social) => (
                <div key={social} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs hover:bg-accent hover:border-accent transition-all cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-accent font-black uppercase tracking-widest text-sm mb-8">Quick Navigation</h4>
            <ul className="space-y-4 font-bold">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Explore Menu</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">Our Story</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Get in Touch</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-accent font-black uppercase tracking-widest text-sm mb-8">Visit Us</h4>
            <div className="space-y-4 text-gray-400 font-medium">
              <p>Inaruwa-3, Sunsari<br />Nepal</p>
              <p className="text-white font-black">9814372647</p>
              <p>MatkaHouse@gmail.com</p>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 font-bold text-sm">
            &copy; {new Date().getFullYear()} MATKA CAFE. HANDCRAFTED WITH ❤️ IN NEPAL.
          </p>
          <div className="flex space-x-8 text-xs font-black text-gray-500 uppercase tracking-widest">
            <span className="hover:text-accent cursor-pointer">Privacy Policy</span>
            <span className="hover:text-accent cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
