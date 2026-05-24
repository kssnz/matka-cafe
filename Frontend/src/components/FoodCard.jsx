import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const FoodCard = ({ food }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(food);
    toast.success(`${food.name} added!`, {
      style: {
        borderRadius: '1rem',
        background: '#5D2E17',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream flex-shrink-0">
          <img
            src={resolveImageUrl(food.image)}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-primary truncate">{food.name}</h3>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{food.category}</p>
          <p className="text-[11px] text-gray-500 line-clamp-1">{food.description}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end ml-4">
        <span className="text-sm font-black text-accent mb-2">Rs. {food.price}</span>
        <button
          onClick={handleAddToCart}
          className="bg-primary hover:bg-accent text-white p-1.5 rounded-lg transition-colors shadow-lg shadow-primary/20 group"
        >
          <Plus size={16} className="group-active:scale-90 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
