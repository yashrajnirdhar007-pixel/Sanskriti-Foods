import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const heroImages = [
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1627464016663-71862142279f?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589115682855-89f41b212f48?w=1600&auto=format&fit=crop&q=80"
];

export const Hero = () => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="relative w-full min-h-[440px] sm:min-h-[480px] md:h-[520px] overflow-hidden bg-[#e4cfb3] flex items-center">
      {heroImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Background ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover object-center md:object-right transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-black/25 z-[1]"></div>
      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#ebd6bc]/95 via-[#ebd6bc]/90 sm:via-[#ebd6bc]/85 to-[#ebd6bc]/60 md:to-transparent z-[2]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-0 w-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-accent-red leading-tight sm:leading-[1.15] mb-3 sm:mb-4 drop-shadow-sm">
            {t('hero_title')}
          </h1>
          <p className="text-sm xs:text-base md:text-xl text-text-primary mb-6 sm:mb-8 max-w-lg font-medium leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-secondary transition-colors shadow-lg active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('shop_now')}
            </Link>
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur text-primary border-2 border-primary px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-bg-light transition-colors shadow-md active:scale-98"
            >
              {t('explore_products') || 'Explore Products'}
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Badge */}
      <div className="absolute top-12 right-12 md:top-24 md:right-24 bg-bg-light w-32 h-32 rounded-full border-4 border-dashed border-primary flex flex-col items-center justify-center rotate-12 shadow-xl hidden md:flex">
        <span className="text-lg font-bold text-text-primary text-center leading-tight">100%<br/>Authentic</span>
        <span className="text-[10px] text-text-secondary mt-1">& Homemade</span>
        <svg className="w-6 h-6 text-primary mt-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5 16 5 16s1-6 8-11c0 0 3-1 4 3zM7 16c0 0 2-3 7-5 0 0-2 4-7 5z" />
        </svg>
      </div>

      {/* Carousel Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 hidden md:block">
        <button onClick={prevSlide} className="bg-white/80 p-2 rounded-full shadow-md text-stone-700 hover:bg-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 hidden md:block">
        <button onClick={nextSlide} className="bg-white/80 p-2 rounded-full shadow-md text-stone-700 hover:bg-white transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      {/* Carousel Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
