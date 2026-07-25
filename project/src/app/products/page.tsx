'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { fetchProductsFromFirestore } from '@/lib/product-service';
import { featuredProducts, formatPrice } from '@/lib/store-data';
import { gsap } from 'gsap';
import { 
  Search, 
  Loader2, 
  Grid3x3, 
  LayoutList, 
  Filter,
  X,
  Sparkles,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

type SortOption = 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const featureFilter = searchParams.get('feature') || '';
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    gsap.from(headerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, featureFilter, categoryFilter, sortBy, priceRange, minRating, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsFromFirestore();
      
      if (data.length > 0) {
        const convertedData = data.map((p: any) => ({
          ...p,
          price: p.price ? Math.round(p.price * 83) : 0,
        }));
        setProducts(convertedData);
        
        const allFeatures: string[] = [];
        const allCategories: string[] = [];
        convertedData.forEach((p: any) => {
          if (p.featureScores) allFeatures.push(...Object.keys(p.featureScores));
          if (p.category && !allCategories.includes(p.category)) allCategories.push(p.category);
        });
        setAvailableFeatures([...new Set(allFeatures)]);
        setCategories(['all', ...allCategories]);
        
        const maxPrice = Math.max(...convertedData.map((p: any) => p.price || 0));
        setPriceRange([0, maxPrice || 100000]);
      } else {
        setProducts(featuredProducts);
        const allFeatures: string[] = [];
        const allCategories: string[] = [];
        featuredProducts.forEach((p) => {
          if (p.featureScores) allFeatures.push(...Object.keys(p.featureScores));
          if (p.category && !allCategories.includes(p.category)) allCategories.push(p.category);
        });
        setAvailableFeatures([...new Set(allFeatures)]);
        setCategories(['all', ...allCategories]);
        
        const maxPrice = Math.max(...featuredProducts.map((p) => p.price || 0));
        setPriceRange([0, maxPrice || 100000]);
      }
    } catch (err) {
      setError('Failed to load products.');
      setProducts(featuredProducts);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (categoryFilter) {
      result = result.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    result = result.filter(p => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);

    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    if (featureFilter) {
      result.sort((a, b) => (b.featureScores?.[featureFilter] || 0) - (a.featureScores?.[featureFilter] || 0));
    } else {
      switch (sortBy) {
        case 'price_asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
        case 'price_desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
        case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
        case 'newest': result.sort((a, b) => (b.rank || 0) - (a.rank || 0)); break;
        default: result.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
      }
    }

    setFilteredProducts(result);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSortBy('popularity');
    setSelectedCategory('all');
    setMinRating(0);
    const maxPrice = Math.max(...products.map((p) => p.price || 0));
    setPriceRange([0, maxPrice || 100000]);
    router.push('/products');
    setShowFilters(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || minRating > 0 || 
    priceRange[1] < (Math.max(...products.map((p) => p.price || 0)) || 100000) ||
    featureFilter || categoryFilter;

  if (loading) {
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
      
      <div className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div ref={headerRef} className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
                Products
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                {featureFilter && ` • Filtered by ${featureFilter}`}
                {categoryFilter && ` • ${categoryFilter}`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[160px] sm:min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 text-sm"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input text-sm w-auto min-w-[130px]"
              >
                <option value="popularity">Popularity</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-border rounded-theme hover:bg-card transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>

              <div className="hidden sm:flex border-2 border-border rounded-theme overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface hover:bg-card'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface hover:bg-card'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-text-secondary">Active filters:</span>
              {featureFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  Feature: {featureFilter}
                  <button onClick={() => router.push('/products')} className="hover:text-primary-dark">×</button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  {categoryFilter}
                  <button onClick={() => router.push('/products')} className="hover:text-secondary-dark">×</button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>×</button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-medium">
                  {minRating}+ ★
                  <button onClick={() => setMinRating(0)}>×</button>
                </span>
              )}
              {priceRange[1] < (Math.max(...products.map((p) => p.price || 0)) || 100000) && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-medium">
                  Max ₹{(priceRange[1] / 1000).toFixed(0)}K
                  <button onClick={() => {
                    const max = Math.max(...products.map((p) => p.price || 0));
                    setPriceRange([0, max || 100000]);
                  }}>×</button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-xs text-primary hover:underline font-medium">
                Clear all
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-theme text-danger text-sm">
            {error}
            <button onClick={loadProducts} className="ml-4 underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Desktop Filters */}
        <div ref={filterRef} className="hidden lg:grid grid-cols-4 gap-4 mb-8">
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
          {availableFeatures.length > 0 && (
            <div>
              <label className="label">Feature Importance</label>
              <select
                value={featureFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  router.push(value ? `/products?feature=${value}` : '/products');
                }}
                className="input"
              >
                <option value="">No preference</option>
                {availableFeatures.map(f => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden bg-card border border-border rounded-theme-lg p-4 mb-6 animate-slide-down">
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
              <div className="flex gap-2 pt-2 border-t border-border">
                <button onClick={clearAllFilters} className="flex-1 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-theme border border-border">
                  Clear All
                </button>
                <button onClick={() => setShowFilters(false)} className="flex-1 py-2.5 text-sm bg-primary text-white rounded-theme hover:bg-primary-light">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Quick Filters */}
        {availableFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-text-secondary py-1.5">Quick filter:</span>
            {availableFeatures.slice(0, 8).map(f => (
              <button
                key={f}
                onClick={() => {
                  router.push(featureFilter === f ? '/products' : `/products?feature=${f}`);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                  featureFilter === f
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-card text-text-secondary border border-border hover:border-primary'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-theme-lg border border-border">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-text-primary text-lg font-medium">No products found</p>
            <p className="text-text-secondary text-sm mt-1">Try adjusting your filters</p>
            <button onClick={clearAllFilters} className="mt-4 px-6 py-2.5 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div 
            ref={gridRef}
            className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
                showAI={!!featureFilter}
                aiScore={featureFilter ? product.featureScores?.[featureFilter] : 0}
              />
            ))}
          </div>
        )}

        {/* AI Suggestion Banner */}
        {featureFilter && filteredProducts.length > 0 && (
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-theme-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm text-text-primary">
                Products ranked by <span className="font-medium text-primary">{featureFilter}</span> sentiment score
              </p>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Higher scores indicate better customer sentiment for this feature
            </p>
          </div>
        )}

        {/* Footer Stats */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-between items-center text-xs text-text-secondary border-t border-border pt-4">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
            <div className="flex gap-4">
              <span>Avg Rating: {(filteredProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredProducts.length || 0).toFixed(1)} ★</span>
              <span>Price Range: ₹{(Math.min(...filteredProducts.map(p => p.price || 0))).toLocaleString('en-IN')} - ₹{(Math.max(...filteredProducts.map(p => p.price || 0))).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}