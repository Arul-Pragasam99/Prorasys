'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { fetchProductsFromFirestore } from '@/lib/product-service';
import { featuredProducts, formatPrice } from '@/lib/store-data';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { 
  Search, 
  Loader2, 
  Grid3x3, 
  LayoutList, 
  Filter, 
  X, 
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const featureFilter = searchParams.get('feature') || '';

  // ✅ Check authentication - redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/products');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      applyFilters();
    }
  }, [products, searchQuery, featureFilter, priceRange, minRating, selectedCategory, isAuthenticated]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await fetchProductsFromFirestore();
      if (data.length > 0) {
        const convertedData = data.map((p: any) => ({
          ...p,
          price: p.price ? Math.round(p.price * 83) : 0,
        }));
        setProducts(convertedData);
        const allCategories: string[] = ['all'];
        convertedData.forEach((p: any) => {
          if (p.category && !allCategories.includes(p.category)) allCategories.push(p.category);
        });
        setCategories(allCategories);
        const maxPrice = Math.max(...convertedData.map((p: any) => p.price || 0));
        setPriceRange([0, maxPrice || 100000]);
      } else {
        setProducts(featuredProducts);
        const allCategories: string[] = ['all'];
        featuredProducts.forEach((p) => {
          if (p.category && !allCategories.includes(p.category)) allCategories.push(p.category);
        });
        setCategories(allCategories);
        const maxPrice = Math.max(...featuredProducts.map((p) => p.price || 0));
        setPriceRange([0, maxPrice || 100000]);
      }
    } catch (err) {
      setProducts(featuredProducts);
    } finally {
      setLoadingProducts(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    result = result.filter(p => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);

    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    if (featureFilter) {
      result.sort((a, b) => (b.featureScores?.[featureFilter] || 0) - (a.featureScores?.[featureFilter] || 0));
    }

    setFilteredProducts(result);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinRating(0);
    const maxPrice = Math.max(...products.map((p) => p.price || 0));
    setPriceRange([0, maxPrice || 100000]);
    router.push('/products');
    setShowFilters(false);
  };

  // ✅ Show loading state while checking authentication
  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary">Authentication Required</h2>
            <p className="text-text-secondary mt-2">Please sign in to access the products page</p>
            <Link
              href="/login?redirect=/products"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-all duration-300"
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-text-secondary">Loading products...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      <div className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Products</h1>
            <p className="text-sm text-text-secondary mt-1">{filteredProducts.length} products found</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-border rounded-theme hover:bg-card transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>
            <div className="flex border-2 border-border rounded-theme overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface hover:bg-card'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface hover:bg-card'}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-theme-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-text-primary">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input">
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Max Price: ₹{(priceRange[1] / 1000).toFixed(0)}K</label>
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
                <label className="label">Minimum Rating</label>
                <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="input">
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ ★</option>
                  <option value={3}>3+ ★</option>
                  <option value={2}>2+ ★</option>
                </select>
              </div>
              <button onClick={clearFilters} className="w-full py-2.5 text-sm bg-primary text-white rounded-theme hover:bg-primary-light">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-theme-lg border border-border">
            <p className="text-text-primary text-lg font-medium">No products found</p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2.5 bg-primary text-white rounded-theme hover:bg-primary-light">
              Clear Filters
            </button>
          </div>
        ) : (
          <div ref={gridRef} className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} showAI={!!featureFilter} aiScore={product.featureScores?.[featureFilter]} />
            ))}
          </div>
        )}

        {featureFilter && filteredProducts.length > 0 && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-theme-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm">Products ranked by <span className="font-medium text-primary">{featureFilter}</span> sentiment score</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}