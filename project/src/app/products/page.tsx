'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { fetchProductsFromFirestore } from '@/lib/product-service';
import { featuredProducts, formatPrice } from '@/lib/store-data';
import { FeatureFilter } from '@/components/FeatureFilter';
import { gsap } from 'gsap';
import { 
  Search, 
  Loader2, 
  Grid3x3, 
  LayoutList, 
  SlidersHorizontal, 
  X,
  ChevronDown,
  Filter,
  Sparkles
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]); // INR range
  const [minRating, setMinRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Get filter params from URL
  const featureFilter = searchParams.get('feature') || '';
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    // GSAP animation for header
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
        // Convert USD prices to INR if needed
        const convertedData = data.map((p: any) => ({
          ...p,
          price: p.price ? Math.round(p.price * 83) : 0, // Convert USD to INR
        }));
        setProducts(convertedData);
        
        // Extract features
        const allFeatures: string[] = [];
        const allCategories: string[] = [];
        convertedData.forEach((p: any) => {
          if (p.featureScores) {
            allFeatures.push(...Object.keys(p.featureScores));
          }
          if (p.category && !allCategories.includes(p.category)) {
            allCategories.push(p.category);
          }
        });
        setAvailableFeatures([...new Set(allFeatures)]);
        setCategories(['all', ...allCategories]);
        
        // Set max price range
        const maxPrice = Math.max(...convertedData.map((p: any) => p.price || 0));
        setPriceRange([0, maxPrice || 100000]);
      } else {
        // Fallback to featured products (already in INR)
        setProducts(featuredProducts);
        const allFeatures: string[] = [];
        const allCategories: string[] = [];
        featuredProducts.forEach((p) => {
          if (p.featureScores) {
            allFeatures.push(...Object.keys(p.featureScores));
          }
          if (p.category && !allCategories.includes(p.category)) {
            allCategories.push(p.category);
          }
        });
        setAvailableFeatures([...new Set(allFeatures)]);
        setCategories(['all', ...allCategories]);
        
        const maxPrice = Math.max(...featuredProducts.map((p) => p.price || 0));
        setPriceRange([0, maxPrice || 100000]);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again.');
      // Fallback to featured products
      setProducts(featuredProducts);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Category filter from URL
    if (categoryFilter) {
      result = result.filter(p => 
        p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Price range filter (INR)
    result = result.filter(p => 
      (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]
    );

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    // Feature filter - sort by feature score if specified
    if (featureFilter) {
      result.sort((a, b) => {
        const scoreA = a.featureScores?.[featureFilter] || 0;
        const scoreB = b.featureScores?.[featureFilter] || 0;
        return scoreB - scoreA;
      });
    } else {
      // Sort by selected option
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
        case 'newest':
          result.sort((a, b) => (b.rank || 0) - (a.rank || 0));
          break;
        case 'popularity':
        default:
          result.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
          break;
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
    setShowMobileFilters(false);
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
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div ref={headerRef} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                All Products
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                {featureFilter && ` • Filtered by ${featureFilter}`}
                {categoryFilter && ` • ${categoryFilter}`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-sm"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input text-sm w-auto min-w-[120px]"
              >
                <option value="popularity">Popularity</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border border-border rounded-theme hover:bg-card transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>

              {/* View Toggle */}
              <div className="hidden sm:flex border border-border rounded-theme overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface hover:bg-card'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface hover:bg-card'
                  }`}
                  aria-label="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-text-secondary">Active filters:</span>
              {featureFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  Feature: {featureFilter}
                  <button 
                    onClick={() => router.push('/products')}
                    className="hover:text-primary-dark"
                  >
                    ×
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-xs">
                  {categoryFilter}
                  <button 
                    onClick={() => router.push('/products')}
                    className="hover:text-secondary-dark"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>×</button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success rounded-full text-xs">
                  {minRating}+ ★
                  <button onClick={() => setMinRating(0)}>×</button>
                </span>
              )}
              {priceRange[1] < (Math.max(...products.map((p) => p.price || 0)) || 100000) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-warning/10 text-warning rounded-full text-xs">
                  Max ₹{priceRange[1].toLocaleString('en-IN')}
                  <button onClick={() => {
                    const max = Math.max(...products.map((p) => p.price || 0));
                    setPriceRange([0, max || 100000]);
                  }}>×</button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-theme text-danger">
            {error}
            <button 
              onClick={loadProducts}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Desktop Filters (visible on large screens) */}
        <div className="hidden lg:block mb-8">
          <div className="grid grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="label">Max Price</label>
              <input
                type="range"
                min={0}
                max={Math.max(...products.map((p) => p.price || 0)) || 100000}
                step={1000}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>₹0</span>
                <span>₹{(priceRange[1] / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="label">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="input"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ ★</option>
                <option value={3}>3+ ★</option>
                <option value={2}>2+ ★</option>
              </select>
            </div>

            {/* Feature Filter */}
            {availableFeatures.length > 0 && (
              <div>
                <label className="label">Feature Importance</label>
                <select
                  value={featureFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      router.push(`/products?feature=${value}`);
                    } else {
                      router.push('/products');
                    }
                  }}
                  className="input"
                >
                  <option value="">No preference</option>
                  {availableFeatures.map(f => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters (slide down) */}
        {showMobileFilters && (
          <div className="lg:hidden bg-card border border-border rounded-theme-lg p-4 mb-6 animate-slide-down">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-text-primary">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="label">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
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

              {/* Rating */}
              <div>
                <label className="label">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="input"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ ★</option>
                  <option value={3}>3+ ★</option>
                  <option value={2}>2+ ★</option>
                </select>
              </div>

              {/* View Mode */}
              <div>
                <label className="label">View Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-2 px-4 rounded-theme text-sm font-medium transition-colors ${
                      viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface border border-border'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2 px-4 rounded-theme text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface border border-border'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2 text-sm text-text-secondary hover:text-text-primary rounded-theme border border-border"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2 text-sm bg-primary text-white rounded-theme hover:bg-primary-light"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Quick Filters */}
        {availableFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-text-secondary py-1">Quick filter:</span>
            {availableFeatures.slice(0, 8).map(f => (
              <button
                key={f}
                onClick={() => {
                  if (featureFilter === f) {
                    router.push('/products');
                  } else {
                    router.push(`/products?feature=${f}`);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                  featureFilter === f
                    ? 'bg-primary text-white'
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
            <p className="text-text-secondary text-sm mt-1">Try adjusting your filters or search terms</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-theme hover:bg-primary-light transition-colors"
            >
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

        {/* AI Suggestion - Feature-based ranking note */}
        {featureFilter && filteredProducts.length > 0 && (
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-theme-lg">
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