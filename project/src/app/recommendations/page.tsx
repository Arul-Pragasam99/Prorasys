'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { useStore } from '@/components/commerce/StoreProvider';
import { Sparkles, Loader2, RefreshCw, TrendingUp, Star, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RecommendationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userRole, aiRecommendations, loadingRecommendations, getRecommendations } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/recommendations');
    } else if (!isLoading && userRole === 'admin') {
      router.replace('/admin');
    }
  }, [isAuthenticated, isLoading, router, userRole]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || loadingRecommendations) {
      setLoadingProducts(isLoading || loadingRecommendations);
      return;
    }

    if (!aiRecommendations?.length) {
      setProducts([]);
      setFilteredProducts([]);
      setError('Trained recommendations are unavailable.');
      setLoadingProducts(false);
      return;
    }

    setError(null);
    setProducts(aiRecommendations);
    setFilteredProducts(aiRecommendations);
    setLoadingProducts(false);
  }, [aiRecommendations, isAuthenticated, isLoading, loadingRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getRecommendations?.();
    } finally {
      setRefreshing(false);
    }
  };

  if (userRole === 'admin') {
    return null;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-text-primary">Sign In Required</h2>
            <p className="mt-2 text-text-secondary">Please sign in to view AI recommendations</p>
            <Link href="/login?redirect=/recommendations" className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loadingProducts) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="mt-4 text-text-secondary">Loading products...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="text-center py-16 bg-card rounded-theme-xl border border-border">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-text-primary">No Products Available</h3>
            <p className="text-text-secondary mt-1">{error}</p>
            <button onClick={handleRefresh} className="mt-4 px-6 py-2 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors">
              Refresh
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="text-center py-16 bg-card rounded-theme-xl border border-border">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-lg font-semibold text-text-primary">No products found</h3>
            <p className="text-text-secondary mt-1">Add products to your store to get AI recommendations</p>
            <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors">
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
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Personalized Recommendations</p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-text-primary">Personalized for You</h1>
            <p className="mt-1 text-text-secondary">{filteredProducts.length} real products ranked by AI</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-theme hover:bg-surface transition-colors disabled:opacity-50 text-text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-4 rounded-theme-xl border border-border text-center">
            <p className="text-2xl font-bold text-primary">{filteredProducts.length}</p>
            <p className="text-xs text-text-secondary">Products</p>
          </div>
          <div className="bg-card p-4 rounded-theme-xl border border-border text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-2xl font-bold text-success">{Math.round(avgScore * 100)}%</p>
            </div>
            <p className="text-xs text-text-secondary">Avg Match</p>
          </div>
          <div className="bg-card p-4 rounded-theme-xl border border-border text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-warning" />
              <p className="text-2xl font-bold text-warning">
                {(filteredProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredProducts.length || 0).toFixed(1)}★
              </p>
            </div>
            <p className="text-xs text-text-secondary">Avg Rating</p>
          </div>
          <div className="bg-card p-4 rounded-theme-xl border border-border text-center">
            <p className="text-2xl font-bold text-secondary">#{filteredProducts.indexOf(topProduct) + 1}</p>
            <p className="text-xs text-text-secondary">Top Pick</p>
          </div>
        </div>

        {topProduct && (
          <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-theme-xl border border-primary/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-text-primary">
                Top Pick: <span className="font-semibold text-primary">{topProduct.name}</span>
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {Math.round((topProduct.recommendation_score || 0) * 100)}% match
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product: any, index: number) => (
            <ProductCard key={product.id || `rec-${index}`} product={product} index={index} showAI={true} aiScore={product.recommendation_score || 0.8} />
          ))}
        </div>

      </div>
    </main>
  );
}