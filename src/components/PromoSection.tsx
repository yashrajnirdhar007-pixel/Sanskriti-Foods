import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Gift, Truck, ShieldCheck, Heart } from 'lucide-react';

const promos = [
  {
    title: 'Combo Offers',
    subtitle: 'Best combos at special prices',
    buttonText: 'Shop Combos',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1606850244795-3ab4376fb134?w=200&h=200&fit=crop',
    bg: 'bg-bg-light'
  },
  {
    title: 'Free Delivery',
    subtitle: 'Free delivery on orders above ₹999',
    buttonText: 'Shop Now',
    link: '/shop',
    icon: <Truck className="w-12 h-12 text-[#385e2b]" />,
    bg: 'bg-bg-soft'
  },
  {
    title: 'Secure Payment',
    subtitle: '100% secure payments with UPI & Cards',
    buttonText: 'Learn More',
    link: '/about',
    icon: <ShieldCheck className="w-12 h-12 text-[#9a8650]" />,
    bg: 'bg-white'
  },
  {
    title: 'Traditional Taste',
    subtitle: 'Made with love and pure natural ingredients',
    buttonText: 'About Us',
    link: '/about',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=200&h=200&fit=crop',
    bg: 'bg-bg-light'
  }
];

export const PromoSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mb-8 sm:mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {promos.map((promo, idx) => (
          <div key={idx} className={`${promo.bg} rounded-xl sm:rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.08)] p-5 flex flex-col relative overflow-hidden h-40 border border-border-color`}>
            <div className="z-10 w-2/3">
              <div className="mb-2">
                {promo.icon && promo.icon}
              </div>
              <h3 className="font-bold text-text-primary text-sm mb-1">{promo.title}</h3>
              <p className="text-xs text-text-secondary mb-3 line-clamp-2">{promo.subtitle}</p>
              <Link 
                to={promo.link}
                className="inline-block text-xs font-bold text-primary border border-primary rounded px-3 py-1 hover:bg-primary hover:text-white transition-colors bg-white/50 backdrop-blur-sm"
              >
                {promo.buttonText}
              </Link>
            </div>
            {promo.image && (
              <img 
                src={promo.image} 
                alt="" 
                className="absolute -right-4 -bottom-4 w-28 h-28 object-cover rounded-full border-4 border-white/50 opacity-90"
              />
            )}
            {promo.icon && !promo.image && (
              <div className="absolute right-4 bottom-4 opacity-50 scale-150 transform translate-x-2 translate-y-2">
                {React.cloneElement(promo.icon as React.ReactElement, { className: 'w-16 h-16' })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
