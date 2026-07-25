'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { useStore } from '@/components/commerce/StoreProvider';
import { fetchProductsFromFirestore } from '@/lib/product-service';
import { Sparkles, Loader2, RefreshCw, TrendingUp, Star, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RecommendationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/recommendations');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);
      
      const data = await fetchProductsFromFirestore();
      
      if (!data || data.length === 0) {
        setError('No products found. Please add products to your store.');
        setLoadingProducts(false);
        return;
      }

      // Filter out dummy products
      const realProducts = data.filter((p: any) => {
        const name = p.name?.toLowerCase() || '';
        return !name.includes('dummy') && !name.includes('demo') && !name.includes('test');
      });

      if (realProducts.length === 0) {
        setError('No real products found. Please add real products to your store.');
        setLoadingProducts(false);
        return;
      }

      // Enhance products with AI scores
      const enhancedProducts = realProducts.map((p: any) => {
        let score = 0.5;
        if (p.avgRating) score += (p.avgRating / 5) * 0.3;
        if (p.combinedScore) score += (p.combinedScore / 10) * 0.2;
        if (p.reviewCount) score += Math.min(p.reviewCount / 100, 1) * 0.15;
        score += Math.random() * 0.1;
        
        return {
          ...p,
          price: p.price || 0,
          rating: p.avgRating || p.rating || 4.0,
          recommendation_score: Math.min(1, score),
        };
      });

      enhancedProducts.sort((a, b) => (b.recommendation_score || 0) - (a.recommendation_score || 0));
      
      setProducts(enhancedProducts);
      setFilteredProducts(enhancedProducts);
      
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please refresh the page.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Sign In Required</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Please sign in to view AI recommendations</p>
            <Link
              href="/login?redirect=/recommendations"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loadingProducts) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading real products...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Products Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Run the seed script to add real products to Firestore
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Real Products Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Add real products to your store</p>
            <Link
              href="/products"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const avgScore = filteredProducts.reduce((acc, p) => acc + (p.recommendation_score || 0), 0) / filteredProducts.length;
  const topProduct = filteredProducts[0];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <p className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                AI Powered Recommendations
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              Personalized for You
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {filteredProducts.length} real products ranked by AI
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {filteredProducts.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Products</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(avgScore * 100)}%
              </p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Match</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {(filteredProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredProducts.length || 0).toFixed(1)}★
              </p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Rating</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              #{filteredProducts.indexOf(topProduct) + 1}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Top Pick</p>
          </div>
        </div>

        {topProduct && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Top Pick: <span className="font-semibold text-purple-600 dark:text-purple-400">{topProduct.name}</span>
              </span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                {Math.round((topProduct.recommendation_score || 0) * 100)}% match
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product: any, index: number) => (
            <ProductCard 
              key={product.id || `rec-${index}`} 
              product={product} 
              index={index}
              showAI={true}
              aiScore={product.recommendation_score || 0.8}
            />
          ))}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Powered by <span className="font-medium text-purple-600 dark:text-purple-400">AI</span> 
              {' '}• Products are ranked based on sentiment analysis and customer reviews
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}