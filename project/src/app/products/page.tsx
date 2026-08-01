'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { fetchProductsFromFirestore } from '@/lib/product-service';
import { useStore } from '@/components/commerce/StoreProvider';
import {
  Search,
  Loader2,
  Grid3x3,
  LayoutList,
  Filter,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-surface text-text-primary"><Header /><div className="mx-auto max-w-7xl px-4 py-12 text-text-secondary">Loading products...</div></main>}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/products');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [products, searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);

      const data = await fetchProductsFromFirestore();

      if (data && data.length > 0) {
        const realProducts = data.filter((p: any) => {
          const name = p.name?.toLowerCase() || '';
          return !name.includes('dummy') && !name.includes('demo') && !name.includes('test');
        });

        if (realProducts.length > 0) {
          const enhancedProducts = realProducts.map((p: any) => ({
            ...p,
            id: p.id || `product_${Math.random().toString(36).substr(2, 9)}`,
            name: p.name || 'Unnamed Product',
            description: p.description || 'No description available',
            price: p.price || 0,
            rating: p.avgRating || p.rating || 4.0,
            category: p.category || 'General',
            badge: p.badge || 'Featured',
            color: p.color || 'from-blue-500 to-cyan-400',
            combinedScore: p.combinedScore || 0,
            trustLevel: p.trustLevel || 'medium',
            reviewCount: p.reviewCount || 0,
            featureScores: p.featureScores || {},
            rank: p.rank || 0,
          }));
          setProducts(enhancedProducts);
        } else {
          setError('No real products found. Please add products to your store.');
          setProducts([]);
        }
      } else {
        setError('No products found. Please add products to your store.');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please refresh the page.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result = result.filter((p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);

    if (minRating > 0) {
      result = result.filter((p) => (p.rating || 0) >= minRating);
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        result.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
        break;
    }

    setFilteredProducts(result);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinRating(0);
    setSortBy('popularity');
    const maxPrice = Math.max(...products.map((p) => p.price || 0));
    setPriceRange([0, maxPrice || 100000]);
    setShowFilters(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    minRating > 0 ||
    priceRange[1] < (Math.max(...products.map((p) => p.price || 0)) || 100000);

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
            <p className="mt-2 text-text-secondary">Please sign in to view products</p>
            <Link
              href="/login?redirect=/products"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors"
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
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (error || products.length === 0) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="text-center py-16 bg-card rounded-theme-xl border border-border">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-text-primary">No Products Available</h3>
            <p className="text-text-secondary mt-1">{error || 'Please add products to your store'}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Products</h1>
          <p className="mt-1 text-text-secondary">{filteredProducts.length} products available</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-theme bg-surface hover:bg-card transition-colors"
            >
              <Filter className="w-4 h-4 text-text-primary" />
              <span className="hidden sm:inline text-text-primary">Filters</span>
              {hasActiveFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
            </button>

            <div className="hidden sm:flex border border-border rounded-theme overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-card'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-card'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-text-secondary">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-primary-light">×</button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                {minRating}+ ★
                <button onClick={() => setMinRating(0)}>×</button>
              </span>
            )}
            {priceRange[1] < 100000 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning rounded-full text-sm">
                ₹{priceRange[1].toLocaleString()}
                <button
                  onClick={() => {
                    const max = Math.max(...products.map((p) => p.price || 0));
                    setPriceRange([0, max || 100000]);
                  }}
                >
                  ×
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-sm text-primary hover:underline">
              Clear all
            </button>
          </div>
        )}

        {showFilters && (
          <div className="bg-card rounded-theme-lg border border-border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-text-primary">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-theme bg-surface text-text-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Max Price: ₹{priceRange[1].toLocaleString()}</label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(...products.map((p) => p.price || 0)) || 100000}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-theme bg-surface text-text-primary"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ ★</option>
                  <option value={3}>3+ ★</option>
                  <option value={2}>2+ ★</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-theme bg-surface text-text-primary"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Top Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">
                Clear All
              </button>
              <button onClick={() => setShowFilters(false)} className="px-6 py-2 text-sm bg-primary text-white rounded-theme hover:bg-primary-light transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-theme-xl border border-border">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-text-primary">No products found</h3>
            <p className="text-text-secondary mt-1">Try adjusting your filters</p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
            }`}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id || `product-${index}`} product={product} index={index} />
            ))}
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-between items-center text-sm text-text-secondary border-t border-border pt-4">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
            <div className="flex gap-4">
              <span>Avg Rating: {(filteredProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredProducts.length || 0).toFixed(1)} ★</span>
              <span>Price Range: ₹{Math.min(...filteredProducts.map((p) => p.price || 0)).toLocaleString()} - ₹{Math.max(...filteredProducts.map((p) => p.price || 0)).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}