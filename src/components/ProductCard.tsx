import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { getPriceForVariant } from '../utils/price';
import { useOrderAction } from '../hooks/useOrderAction';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t } = useTranslation();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const { handleOrder } = useOrderAction();
  const [selectedVariant, setSelectedVariant] = useState((product.variants || product.sizes || [''])[0]);
  const isLiked = wishlist.includes(product.id);

  return (
    <div 
      className="bg-white rounded-[12px] p-4 overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition-shadow border border-border-color flex relative group cursor-pointer hover:shadow-lg flex-col"
      onClick={onClick}
    >
      {/* Bestseller tag */}
      <div className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded z-20 shadow-sm relative">
        Bestseller
      </div>
      
      {/* Like Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id, product.name);
        }}
        className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur rounded-full text-stone-400 hover:text-red-500 hover:bg-stone-100 transition-colors z-20 shadow-sm"
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      <div className="w-full flex flex-col justify-center mt-6">
        <h3 className="text-sm font-bold text-stone-800 leading-tight mb-1">{product.name}</h3>
        
        {/* Weight Selector */}
        <select 
          className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded px-1 outline-none mb-1 cursor-pointer w-fit"
          value={selectedVariant}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setSelectedVariant(e.target.value)}
        >
          {(product.variants || product.sizes || []).map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
          <span className="text-xs font-bold text-stone-700">{product.rating}</span>
          <span className="text-[10px] text-stone-400">({product.reviews})</span>
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          <span className="text-lg font-bold text-stone-900 leading-none">₹{getPriceForVariant(product.price, selectedVariant)}</span>
          <div className="flex flex-row sm:flex-col lg:flex-row gap-2 mt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, selectedVariant);
              }}
              className="flex-1 bg-white text-primary border border-primary py-1.5 px-2 rounded text-xs font-medium hover:bg-stone-50 transition-colors shadow-sm"
            >
              {t('add_to_cart')}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleOrder(product, selectedVariant);
              }}
              className="flex-1 bg-primary text-white py-1.5 px-2 rounded text-xs font-medium hover:bg-secondary transition-colors shadow-sm"
            >
              {t('order_now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
