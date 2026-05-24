import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center space-x-2 text-primary hover:text-accent font-black transition-all group mb-6 ${className}`}
    >
      <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 group-hover:bg-accent group-hover:text-white transition-all">
        <ChevronLeft size={20} />
      </div>
      <span className="uppercase tracking-widest text-xs">Go Back</span>
    </button>
  );
};

export default BackButton;
