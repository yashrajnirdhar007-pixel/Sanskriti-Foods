import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from './types';
import { getPriceForVariant } from './utils/price';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, variant: string, quantity?: number) => void;
  removeFromCart: (productId: string, variant: string) => void;
  updateQuantity: (productId: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, productName: string) => void;
  cartTotal: number;
  wishlistCount: number;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product: Product, variant: string, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id && item.variant === variant
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id && item.variant === variant
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, { product, variant, quantity }];
    });
    
    showToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: string, variant: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.variant === variant))
    );
  };

  const updateQuantity = (productId: string, variant: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.variant === variant
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string, productName: string) => {
    const isCurrentlyLiked = wishlist.includes(productId);
    
    if (isCurrentlyLiked) {
      setWishlist((prev) => prev.filter(id => id !== productId));
      showToast(`Removed ${productName} from wishlist`);
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast(`Added ${productName} to wishlist`);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + getPriceForVariant(item.product.price, item.variant) * item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, cartTotal, wishlistCount, toastMessage, showToast }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
