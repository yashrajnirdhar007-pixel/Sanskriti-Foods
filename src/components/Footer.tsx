import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer id="footer" className="bg-[#2B2118] text-stone-300 py-10 sm:py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="sm:col-span-2">
          <h3 className="text-white text-xl font-serif font-bold mb-3">Sanskriti Foods</h3>
          <p className="text-sm max-w-sm mb-4 text-stone-400">Authentic homemade taste delivered directly to your doorstep. Preserving traditional recipes in every jar.</p>
        </div>
        <div>
          <h3 className="text-white text-base sm:text-lg font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-stone-400">
            <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
            <li><Link to="/shop" className="hover:text-accent transition-colors">Shop All Products</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
            <li><Link to="/orders" className="hover:text-accent transition-colors">Track Orders</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white text-base sm:text-lg font-bold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>Mumbai, Maharashtra, India</li>
            <li>+91 94224 87272</li>
            <li>support@sanskritifoods.com</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-stone-800 text-xs sm:text-sm text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 Sanskriti Foods. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
