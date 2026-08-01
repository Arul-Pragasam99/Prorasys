'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    avgRating: '',
    combinedScore: '',
    trustLevel: 'medium',
    reviewCount: '',
    featureScores: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category || 'General',
        avgRating: parseFloat(formData.avgRating) || 0,
        combinedScore: parseFloat(formData.combinedScore) || 0,
        trustLevel: formData.trustLevel,
        reviewCount: parseInt(formData.reviewCount) || 0,
        featureScores: formData.featureScores || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'products'), productData);
      alert('Product added successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-surface text-text-primary overflow-x-hidden">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-lg hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Add Product</h1>
            <p className="text-text-secondary mt-1">Create a new product listing</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <label className="label">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Electronics, Fashion"
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[100px]"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="label">Price (INR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="input"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
            
            <div>
              <label className="label">Rating</label>
              <input
                type="number"
                name="avgRating"
                value={formData.avgRating}
                onChange={handleChange}
                className="input"
                placeholder="0.0 - 5.0"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="label">Trust Level</label>
              <select
                name="trustLevel"
                value={formData.trustLevel}
                onChange={handleChange}
                className="input"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label">Combined Score</label>
              <input
                type="number"
                name="combinedScore"
                value={formData.combinedScore}
                onChange={handleChange}
                className="input"
                placeholder="0.0 - 10.0"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="label">Review Count</label>
              <input
                type="number"
                name="reviewCount"
                value={formData.reviewCount}
                onChange={handleChange}
                className="input"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-3 border border-border rounded-theme font-medium hover:bg-card transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}