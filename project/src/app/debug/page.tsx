'use client';

import { useState, useEffect } from 'react';
import { fetchProductsFromFirestore } from '@/lib/product-service';
import { featuredProducts } from '@/lib/store-data';

export default function DebugPage() {
  const [firestoreProducts, setFirestoreProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProductsFromFirestore();
        setFirestoreProducts(data);
        console.log('Firestore Products:', data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug: Products</h1>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Featured Products (Fallback):</h2>
        <p>Total: {featuredProducts.length}</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {featuredProducts.slice(0, 5).map(p => (
            <div key={p.id} className="p-2 border rounded">
              <p><strong>{p.name}</strong></p>
              <p>Price: ₹{p.price}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Firestore Products:</h2>
        <p>Total: {firestoreProducts.length}</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {firestoreProducts.slice(0, 5).map(p => (
            <div key={p.id} className="p-2 border rounded">
              <p><strong>{p.name || 'Unnamed'}</strong></p>
              <p>Price: ₹{p.price || 0}</p>
            </div>
          ))}
        </div>
        {firestoreProducts.length === 0 && !loading && (
          <p className="text-amber-500 mt-2">No products found in Firestore. Using featured products as fallback.</p>
        )}
      </div>
    </div>
  );
}