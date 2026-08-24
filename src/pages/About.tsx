import React from 'react';

export const About = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-6 sm:mb-8 text-center">Our Story</h1>
      <div className="prose prose-lg text-text-secondary mx-auto">
        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          Welcome to Sanskriti Foods, where every bite takes you back to the authentic flavors of home. 
          Founded with a passion for preserving traditional Indian recipes, we bring you the finest, handcrafted 
          traditional foods, pickles, metkut, and papads made exactly the way our grandmothers used to make them.
        </p>
        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          Our journey started in a small home kitchen, using secret family spice blends and pure, sun-dried 
          ingredients. Today, we continue that legacy by ensuring zero preservatives, 100% natural ingredients, 
          and the same loving touch in every batch.
        </p>
        <div className="my-8 sm:my-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div className="p-5 sm:p-6 bg-bg-light rounded-xl border border-border-color shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">100% Pure</h3>
            <p className="text-xs sm:text-sm">No artificial colors, flavors, or preservatives.</p>
          </div>
          <div className="p-5 sm:p-6 bg-bg-light rounded-xl border border-border-color shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Sun-Dried</h3>
            <p className="text-xs sm:text-sm">Prepared naturally under the golden sun for authentic taste.</p>
          </div>
          <div className="p-5 sm:p-6 bg-bg-light rounded-xl border border-border-color shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Made with Love</h3>
            <p className="text-xs sm:text-sm">Handcrafted by experienced homemakers using traditional methods.</p>
          </div>
        </div>
      </div>
    </main>
  );
};
