import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { db } from '../firebase';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';

interface AdminProductModalProps {
  product: any | null;
  onClose: () => void;
  onSaved: (savedProduct: any) => void;
}

export const AdminProductModal = ({ product, onClose, onSaved }: AdminProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    ingredients: '',
    image: '',
    benefits: '',
    sizes: '250g,500g,1kg'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: typeof product.price === 'object' ? (product.price['250g'] || Object.values(product.price)[0] || '') : (product.price || ''),
        description: product.description || '',
        ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || ''),
        image: product.image || '',
        benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : (product.benefits || ''),
        sizes: Array.isArray(product.sizes || product.variants) ? (product.sizes || product.variants).join(',') : (product.sizes || product.variants || '250g,500g,1kg')
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const priceVal = parseFloat(formData.price) || 0;
      
      const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
      const priceObj = sizesArray.reduce((acc: any, size: string, index: number) => {
        // Just mock some prices based on size multiplier for simplicity if not editing an existing complex price object
        let multiplier = 1;
        if (size === '500g') multiplier = 1.9;
        if (size === '1kg') multiplier = 3.5;
        acc[size] = Math.round(priceVal * multiplier);
        return acc;
      }, {});

      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: Object.keys(priceObj).length > 0 ? priceObj : priceVal,
        image: formData.image,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        benefits: formData.benefits.split(',').map(b => b.trim()).filter(Boolean),
        sizes: sizesArray,
        variants: sizesArray,
        rating: product?.rating || 5.0,
        reviews: product?.reviews || 0
      };

      if (product?.id) {
        await updateDoc(doc(db, 'products', product.id), productData);
        onSaved({ ...productData, id: product.id });
      } else {
        const docRef = await addDoc(collection(db, 'products'), productData);
        onSaved({ ...productData, id: docRef.id });
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50">
          <h2 className="text-xl font-bold text-stone-800">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <input required name="category" value={formData.category} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Base Price (250g) in ₹</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                <input required name="image" value={formData.image} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:border-primary" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:border-primary"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Ingredients (comma separated)</label>
              <input name="ingredients" value={formData.ingredients} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Benefits (comma separated)</label>
              <input name="benefits" value={formData.benefits} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:border-primary" />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-stone-300 text-stone-700 font-medium hover:bg-stone-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-secondary disabled:opacity-70">
                {loading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
