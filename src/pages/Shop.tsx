import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../types';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (snap.empty) {
          // If empty, let's fetch from mock API and seed the DB
          const res = await fetch('/api/products');
          const mockProducts = await res.json();
          const savedProducts = [];
          
          for (const p of mockProducts) {
            const docRef = await addDoc(collection(db, 'products'), p);
            savedProducts.push({ ...p, id: docRef.id });
          }
          setProducts(savedProducts);
        } else {
          let dbProducts = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
          
          // Ensure new Sanskriti Foods products are present
          if (!dbProducts.find(p => p.name.includes('Metkut') || p.id === 'p_metkut')) {
            try {
               const res = await fetch('/api/products');
               const mockProducts = await res.json();
               const missingProducts = mockProducts.filter((mp: any) => mp.id === 'p_metkut' || mp.id === 'p_jeerapapad');
               dbProducts = [...missingProducts, ...dbProducts];
            } catch (e) {
               console.error("Failed to inject missing products", e);
            }
          }
          
          setProducts(dbProducts);
        }
      } catch (err) {
        // Fallback to mock API if Firestore fails
        try {
          const res = await fetch('/api/products');
          const mockProducts = await res.json();
          setProducts(mockProducts);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Our Products</h1>
          <div className="flex items-center mt-2 mb-2 gap-2">
            <div className="h-1 w-12 bg-primary rounded"></div>
            <div className="h-1 w-2 bg-primary rounded"></div>
          </div>
          <p className="text-text-secondary mt-2">Authentic homemade pickles, papad and kurdai</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-border-color rounded-[12px] px-4 py-2 bg-white text-text-primary outline-none focus:border-primary">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest Arrivals</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="animate-pulse bg-white rounded-[12px] h-40 border border-border-color shadow-[0_4px_10px_rgba(0,0,0,0.08)]"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
          
          <div className="flex justify-center mt-12 gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-600 border border-stone-200 hover:bg-stone-50">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white border border-primary">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-600 border border-stone-200 hover:bg-stone-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-600 border border-stone-200 hover:bg-stone-50">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-600 border border-stone-200 hover:bg-stone-50">4</button>
            <span className="w-8 h-8 flex items-center justify-center text-stone-600">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-600 border border-stone-200 hover:bg-stone-50">10</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-600 border border-stone-200 hover:bg-stone-50">&gt;</button>
          </div>
          
          <ProductModal 
            product={selectedProduct} 
            isOpen={!!selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        </>
      )}
    </main>
  );
};
