import React, { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { useCart } from '../CartContext';
import { Product } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const { wishlist, toggleWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    if (isOpen && products.length === 0) {
      const fetchProducts = async () => {
        try {
          const snap = await getDocs(collection(db, 'products'));
          setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
        } catch (err) {
          try {
            const res = await fetch('/api/products');
            const mockProducts = await res.json();
            setProducts(mockProducts);
          } catch (e) {
            console.error(e);
          }
        }
      };
      fetchProducts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            My Wishlist
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {wishlistProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <Heart className="w-16 h-16 opacity-20" />
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="flex gap-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-stone-100"
                  />
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-semibold text-stone-800 leading-tight mb-1">{product.name}</h4>
                    <p className="text-sm font-bold text-stone-900 mb-2">₹{typeof product.price === 'object' ? Object.values(product.price)[0] : product.price}</p>
                    
                    <button 
                      onClick={() => toggleWishlist(product.id, product.name)}
                      className="mt-auto text-sm text-red-500 font-medium hover:text-red-700 self-start"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
