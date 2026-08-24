import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';
import { getPriceForVariant } from '../utils/price';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { t } = useTranslation();
  const { cart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {t('cart')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>{t('your_cart_is_empty')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.variant}`} className="flex gap-4">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-stone-100"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-800">{item.product.name}</h4>
                    <p className="text-sm text-stone-500 mb-2">{item.variant}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-stone-200">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.variant, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded shadow-sm text-stone-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.variant, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded shadow-sm text-stone-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-stone-900">₹{getPriceForVariant(item.product.price, item.variant) * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-100 bg-stone-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-600 font-medium">{t('total')}</span>
              <span className="text-2xl font-bold text-stone-900">₹{cartTotal}</span>
            </div>
            
            <button 
              onClick={handleGoToCheckout}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm"
            >
              {t('checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
