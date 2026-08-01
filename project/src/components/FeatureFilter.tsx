'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Filter } from 'lucide-react';

interface FeatureFilterProps {
  features: string[];
  category: string;
}

export function FeatureFilter({ features, category }: FeatureFilterProps) {
  return (
    <Suspense fallback={<div className="flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg bg-surface border-border text-text-primary text-sm">Filters</div>}>
      <FeatureFilterContent features={features} category={category} />
    </Suspense>
  );
}

function FeatureFilterContent({ features, category }: FeatureFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFeature, setSelectedFeature] = useState<string>(
    searchParams.get('feature') || ''
  );
  const [minRating, setMinRating] = useState<number>(
    parseFloat(searchParams.get('minRating') || '0')
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    parseFloat(searchParams.get('maxPrice') || '1000')
  );
  const [isOpen, setIsOpen] = useState(false);

  // Update state when URL params change
  useEffect(() => {
    setSelectedFeature(searchParams.get('feature') || '');
    setMinRating(parseFloat(searchParams.get('minRating') || '0'));
    setMaxPrice(parseFloat(searchParams.get('maxPrice') || '1000'));
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedFeature) params.set('feature', selectedFeature);
    if (minRating > 0) params.set('minRating', minRating.toString());
    if (maxPrice < 1000) params.set('maxPrice', maxPrice.toString());
    if (category && category !== 'general') params.set('category', category);
    
    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedFeature('');
    setMinRating(0);
    setMaxPrice(1000);
    router.push('/products');
    setIsOpen(false);
  };

  const hasFilters = selectedFeature || minRating > 0 || maxPrice < 1000;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm ${
          hasFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface hover:bg-card border-border text-text-primary'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">Filters</span>
        {hasFilters && (
          <span className="w-2 h-2 bg-primary rounded-full ml-1" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-card rounded-xl shadow-lg border border-border p-6 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Filter Products
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Feature Select */}
            {features.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Feature Importance
                </label>
                <select
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary text-sm text-text-primary"
                >
                  <option value="">No preference</option>
                  {features.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
                {selectedFeature && (
                  <p className="text-xs text-text-secondary mt-1">
                    Products will be ranked by {selectedFeature} sentiment
                  </p>
                )}
              </div>
            )}

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full p-2 border rounded-lg bg-surface border-border focus:ring-2 focus:ring-primary text-sm text-text-primary"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={2}>2+ Stars</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Max Price: ${maxPrice}
              </label>
              <input
                type="range"
                min={0}
                max={1000}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>$0</span>
                <span>$1000</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={clearFilters}
                className="flex-1 px-3 py-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface text-sm transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light text-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}