import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { Product } from '../types';

export const useOrderAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const handleOrder = (product: Product, variant: string) => {
    if (!user) {
      alert('Please login first to place an order');
      // Redirect to login and preserve the current path
      navigate('/login', { state: { from: location } });
      return;
    }

    // Add to cart and navigate to checkout
    addToCart(product, variant);
    navigate('/checkout');
  };

  return { handleOrder };
};
