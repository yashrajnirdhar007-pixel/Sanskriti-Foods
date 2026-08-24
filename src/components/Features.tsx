import React from 'react';
import { Leaf, Coffee, ShieldCheck, Truck, Lock, Star } from 'lucide-react';

const features = [
  { icon: Leaf, title: '100% Homemade', subtitle: 'No preservatives' },
  { icon: Coffee, title: 'Authentic Taste', subtitle: 'Traditional recipes' },
  { icon: ShieldCheck, title: 'Hygienically Prepared', subtitle: 'Clean & safe' },
  { icon: Truck, title: 'Pan India Delivery', subtitle: 'Fast & secure' },
  { icon: Lock, title: 'Secure Payments', subtitle: 'Multiple options' },
  { icon: Star, title: 'Happy Customers', subtitle: '4.8 ★ Rating' },
];

export const Features = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:-mt-8 md:-mt-10 relative z-20">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border-color p-3.5 sm:p-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 p-1.5 sm:p-1 rounded-lg hover:bg-bg-light/60 transition-colors">
              <div className="bg-bg-light p-2.5 sm:p-3 rounded-full text-primary shrink-0 shadow-xs">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-text-primary leading-snug">{feature.title}</h4>
                <p className="text-[11px] sm:text-xs text-text-secondary leading-snug mt-0.5">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
