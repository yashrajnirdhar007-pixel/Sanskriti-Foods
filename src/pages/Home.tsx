import React from 'react';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Categories } from '../components/Categories';
import { PromoSection } from '../components/PromoSection';

export const Home = () => {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <div>
        <Hero />
        <Features />
      </div>
      <Categories />
      <PromoSection />
    </div>
  );
};
