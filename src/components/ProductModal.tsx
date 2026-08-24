import React from 'react';
import { X, Star, ShoppingBag, Zap } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { getPriceForVariant } from '../utils/price';
import { useOrderAction } from '../hooks/useOrderAction';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const { addToCart } = useCart();
  const { handleOrder } = useOrderAction();
  const [selectedVariant, setSelectedVariant] = React.useState((product?.variants || [''])[0]);

  React.useEffect(() => {
    if (product) {
      setSelectedVariant((product.variants || [''])[0]);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl bg-white rounded-2xl z-50 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors z-10 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-bg-light relative flex items-center justify-center p-8">
          <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded shadow-sm">
            Bestseller
          </div>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl max-h-[300px] md:max-h-[500px]"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
              <span className="text-sm font-bold text-stone-700">{product.rating}</span>
              <span className="text-xs text-stone-400">({product.reviews} reviews)</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 leading-tight">
            {product.name}
          </h2>
          
          <p className="text-text-secondary text-base mb-6 leading-relaxed">
            {product.description}
          </p>

          {(product.ingredients || product.taste || product.shelfLife || product.storage || product.bestWith) && (
            <div className="flex flex-col gap-2 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
              {product.ingredients && (
                <div className="text-sm">
                  <span className="font-bold text-stone-800">Ingredients:</span> <span className="text-stone-600">{product.ingredients}</span>
                </div>
              )}
              {product.taste && (
                <div className="text-sm">
                  <span className="font-bold text-stone-800">Taste:</span> <span className="text-stone-600">{product.taste}</span>
                </div>
              )}
              {product.shelfLife && (
                <div className="text-sm">
                  <span className="font-bold text-stone-800">Shelf Life:</span> <span className="text-stone-600">{product.shelfLife}</span>
                </div>
              )}
              {product.storage && (
                <div className="text-sm">
                  <span className="font-bold text-stone-800">Storage:</span> <span className="text-stone-600">{product.storage}</span>
                </div>
              )}
              {product.bestWith && (
                <div className="text-sm">
                  <span className="font-bold text-stone-800">Best With:</span> <span className="text-stone-600">{product.bestWith}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-stone-700 mb-3">Select Quantity:</h3>
              <div className="flex flex-wrap gap-2">
                {(product.variants || []).map(v => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedVariant === v 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-border-color text-stone-600 hover:border-primary/30 hover:bg-stone-50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-color">
              <div className="w-full sm:w-auto">
                <span className="block text-sm text-stone-500 font-medium mb-1">Price</span>
                <span className="text-3xl font-bold text-stone-900">₹{getPriceForVariant(product.price, selectedVariant)}</span>
              </div>
              
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 flex-1">
                <button 
                  onClick={() => {
                    addToCart(product, selectedVariant);
                    onClose();
                  }}
                  className="flex-1 bg-white border border-primary text-primary py-3 px-4 rounded-xl font-bold hover:bg-stone-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    handleOrder(product, selectedVariant);
                  }}
                  className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-secondary transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
