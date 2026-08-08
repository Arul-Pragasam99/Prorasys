'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ArrowLeft, Plus, Loader2, Upload, X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      setUploadingImage(true);
      const fileName = `products/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category || 'General',
        image: imageUrl || '',
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-20 sm:pt-24 lg:pt-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-lg hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Add Product</h1>
            <p className="text-sm text-text-secondary">Create a new product listing</p>
          </div>
        </div>

        {/* Form - Compact Layout */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Left Column - Image */}
            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-text-secondary block mb-1.5">Product Image</label>
              <div className="mt-1">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full hover:bg-danger/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-surface"
                  >
                    <Upload className="w-6 h-6 text-text-secondary" />
                    <span className="text-[10px] text-text-secondary mt-1 text-center px-1">Upload Image</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-[10px] text-text-secondary mt-1">Max 5MB</p>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="sm:col-span-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                    placeholder="e.g., Electronics"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-none"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Info Box - Compact */}
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-text-secondary">
              🤖 <span className="font-medium text-primary">AI will handle:</span>
              <span className="ml-2 text-text-secondary">
                Rating · Combined Score · Trust Level · Review Count
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4 pt-3 border-t border-border">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 py-2.5 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadingImage ? 'Uploading...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-2.5 border border-border rounded-theme font-medium hover:bg-card transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}