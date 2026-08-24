import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Metkut', image: 'https://images.unsplash.com/photo-1605341517409-72c67c51ddf9?w=400&h=300&fit=crop' },
  { name: 'Papad & Kurdai', image: 'https://images.unsplash.com/photo-1596450514735-111a2fe02935?w=400&h=300&fit=crop' },
  { name: 'Mango Pickle', image: 'https://images.unsplash.com/photo-1627464016663-71862142279f?w=400&h=300&fit=crop' },
  { name: 'Lemon Pickle', image: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=400&h=300&fit=crop' },
  { name: 'Mixed Pickle', image: 'https://images.unsplash.com/photo-1589115682855-89f41b212f48?w=400&h=300&fit=crop' },
  { name: 'Garlic Pickle', image: 'https://images.unsplash.com/photo-1615486171448-4eff3a7027d7?w=400&h=300&fit=crop' },
  { name: 'Combo Offers', image: 'https://images.unsplash.com/photo-1606850244795-3ab4376fb134?w=400&h=300&fit=crop' },
  { name: 'Gift Packs', image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=300&fit=crop' },
];

export const Categories = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Shop by Category</h2>
        <Link to="/shop" className="text-xs sm:text-sm font-medium text-text-secondary hover:text-primary flex items-center gap-1">
          View All <span className="text-base sm:text-lg">›</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat, idx) => (
          <Link to="/shop" key={idx} className="flex flex-col items-center group cursor-pointer">
            <div className="w-full aspect-[4/3] rounded-[12px] overflow-hidden bg-white shadow-[0_4px_10px_rgba(0,0,0,0.08)] mb-2 sm:mb-3 relative flex items-center justify-center p-2 border border-border-color">
              {cat.image && (
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-text-primary text-center group-hover:text-primary transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};
