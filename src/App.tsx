import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { MyOrders } from './pages/MyOrders';
import { TrackOrder } from './pages/TrackOrder';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CheckCircle2 } from 'lucide-react';

import { ProtectedRoute } from './components/ProtectedRoute';
import { Admin } from './pages/Admin';

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { toastMessage } = useCart();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-transparent font-sans text-text-primary selection:bg-light-green flex flex-col">
      {!isAdminRoute && <Navbar onCartClick={() => setIsCartOpen(true)} onWishlistClick={() => setIsWishlistOpen(true)} />}
      
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="/track/:orderId" element={<TrackOrder />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      
      {/* Toast Notification */}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="bg-[#2E7D32] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      </div>
    </div>
  );
}

import { AuthProvider } from './AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
