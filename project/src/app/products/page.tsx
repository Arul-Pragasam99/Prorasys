'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { fetchProductsFromFirestore, Product } from '@/lib/product-service';
import { featuredProducts } from '@/lib/store-data';
import { FeatureFilter } from '@/components/FeatureFilter';
import { FeatureExtractor } from '@/lib/feature-extraction';
import { Search, Loader2, Grid3x3, LayoutList, SlidersHorizontal, X } from 'lucide-react';

type SortOption = 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'feature';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('general');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showFilters, setShowFilters] = useState(false);

  const featureFilter = searchParams.get('feature') || '';
  const minRatingFilter = parseFloat(searchParams.get('minRating') || '0');
  const maxPriceFilter = parseFloat(searchParams.get('maxPrice') || '1000');
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, featureFilter, minRatingFilter, maxPriceFilter, categoryFilter, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsFromFirestore();
      
      if (data.length > 0) {
        setProducts(data);
        
        const featureExtractor = new FeatureExtractor();
        const allFeatures: string[] = [];
        data.forEach(product => {
          if (product.featureScores) {
            allFeatures.push(...Object.keys(product.featureScores));
          }
        });
        setAvailableFeatures([...new Set(allFeatures)]);
        
        if (categoryFilter) {
          setCategory(categoryFilter);
        }
      } else {
        const fallbackData = featuredProducts.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          rating: p.rating || 4.0,
          badge: p.badge || 'Featured',
          color: p.color || 'from-brand-500 to-blue-500',
          image: p.image || '/placeholder.jpg',
          combinedScore: p.combinedScore || 0,
          sentimentScore: p.sentimentScore || 0,
          trustLevel: p.trustLevel || 'medium',
          reviewCount: p.reviewCount || 0,
          featureScores: p.featureScores || {},
          rank: p.rank || 0,
        }));
        setProducts(fallbackData);
        
        const featureExtractor = new FeatureExtractor();
        const allFeatures: string[] = [];
        fallbackData.forEach(product => {
          if (product.featureScores) {
            allFeatures.push(...Object.keys(product.featureScores));
          }
        });
        setAvailableFeatures([...new Set(allFeatures)]);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      result = result.filter(p => 
        p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    result = result.filter(p => (p.price || 0) <= maxPriceFilter);

    if (minRatingFilter > 0) {
      result = result.filter(p => (p.rating || 0) >= minRatingFilter);
    }

    if (featureFilter) {
      result.sort((a, b) => {
        const scoreA = a.featureScores?.[featureFilter] || 0;
        const scoreB = b.featureScores?.[featureFilter] || 0;
        return scoreB - scoreA;
      });
    } else {
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
        case 'feature':
          break;
        case 'popularity':
        default:
          result.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
          break;
      }
    }

    setFilteredProducts(result);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('popularity');
    window.location.href = '/products';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-xl"></div>
                <div className="h-4 bg-gray-200 mt-3 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 mt-2 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 mt-1 rounded w-2/3"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-8 bg-gray-200 rounded-full w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Catalog</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
                Browse Products
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {filteredProducts.length} products found
                {featureFilter && ` • Filtered by ${featureFilter}`}
                {categoryFilter && ` • Category: ${categoryFilter}`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[180px] sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm"
                />
              </div>
              
              <FeatureFilter 
                features={availableFeatures} 
                category={category}
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="popularity">Popularity</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                {featureFilter && (
                  <option value="feature">By Feature Score</option>
                )}
              </select>

              <div className="flex border rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-gray-400 hover:text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-brand-50 text-brand-700' : 'text-gray-400 hover:text-gray-600'}`}
                  aria-label="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(featureFilter || minRatingFilter > 0 || maxPriceFilter < 1000 || categoryFilter) && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {featureFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  Feature: {featureFilter}
                  <button 
                    onClick={() => window.location.href = '/products'}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {minRatingFilter > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {minRatingFilter}+ Stars
                  <button 
                    onClick={() => window.location.href = '/products'}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {maxPriceFilter < 1000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  Max ${maxPriceFilter}
                  <button 
                    onClick={() => window.location.href = '/products'}
                    className="hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {categoryFilter}
                  <button 
                    onClick={() => window.location.href = '/products'}
                    className="hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-brand-600 hover:text-brand-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button 
              onClick={loadProducts}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
              : 'grid-cols-1 gap-4'
          }`}>
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  category: product.category,
                  rating: product.rating || 4.0,
                  badge: product.badge || 'Featured',
                  color: product.color || 'from-brand-500 to-blue-500',
                  image: product.image,
                  combinedScore: product.combinedScore,
                  sentimentScore: product.sentimentScore,
                  trustLevel: product.trustLevel,
                  reviewCount: product.reviewCount,
                  featureScores: product.featureScores,
                  rank: product.rank,
                  avgRating: product.rating || 4.0,
                }} 
                index={index}
                viewMode={viewMode}
                showAI={true}
                aiScore={featureFilter && product.featureScores?.[featureFilter] || 0}
              />
            ))}
          </div>
        )}

        {/* Feature Analysis Summary */}
        {filteredProducts.length > 0 && availableFeatures.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📊</span>
              <h3 className="font-semibold text-gray-800">Available Features to Filter By</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableFeatures.slice(0, 12).map((feature) => (
                <button
                  key={feature}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('feature', feature);
                    window.location.href = `/products?${params.toString()}`;
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                    featureFilter === feature
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-200'
                  }`}
                >
                  {feature.charAt(0).toUpperCase() + feature.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click a feature to rank products by that attribute
            </p>
          </div>
        )}
      </section>
    </main>
  );
}