'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { StoreProduct, formatPrice } from '@/lib/store-data';
import { gsap } from 'gsap';
import { ShoppingBag, Heart, Eye, Star, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: StoreProduct & {
    combinedScore?: number;
    featureScores?: Record<string, number>;
    trustLevel?: string;
    avgRating?: number;
  };
  index?: number;
  showAI?: boolean;
  aiScore?: number;
}

export function ProductCard({ product, index = 0, showAI = false, aiScore = 0 }: ProductCardProps) {
  const { addToCart, addToWishlist, cart, wishlist } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const inCart = cart.some((item) => item.id === product.id);
  const inWishlist = wishlist.some((item) => item.id === product.id);

  const rating = product.avgRating || product.rating || 4.0;
  const normalizedRating = Math.min(5, Math.max(0, rating));

  useEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      delay: index * 0.06,
      ease: 'power3.out',
    });
  }, [index]);

  const renderStars = () => {
    const stars = [];
    const full = Math.floor(normalizedRating);
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />);
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-border" />);
      }
    }
    return stars;
  };

  const getTrustColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-success/15 text-success border-success/30';
      case 'medium': return 'bg-warning/15 text-warning border-warning/30';
      case 'low': return 'bg-danger/15 text-danger border-danger/30';
      default: return 'bg-card text-text-secondary border-border';
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getProductEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('headphone')) return '🎧';
    if (lower.includes('watch')) return '⌚';
    if (lower.includes('earbud')) return '🎵';
    if (lower.includes('monitor')) return '🖥️';
    if (lower.includes('speaker')) return '🔊';
    if (lower.includes('laptop')) return '💻';
    if (lower.includes('charger')) return '🔋';
    if (lower.includes('yoga')) return '🧘';
    return '📦';
  };

  return (
    <div
      ref={cardRef}
      className="group relative bg-card rounded-theme-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showAI && aiScore > 0 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          <Sparkles className="w-3 h-3" />
          {Math.round(aiScore * 100)}% match
        </div>
      )}

      {product.trustLevel && (
        <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getTrustColor(product.trustLevel)}`}>
          {product.trustLevel === 'high' ? '⭐ High Trust' : product.trustLevel === 'medium' ? '📊 Medium' : '⚠️ Low Trust'}
        </div>
      )}

      {/* Image/Icon Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-surface to-card aspect-square flex items-center justify-center text-7xl">
        {getProductEmoji(product.name)}
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link
            href={`/products/${product.id}`}
            className="p-3 bg-surface text-text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button
            onClick={handleAddToCart}
            className="p-3 bg-surface text-text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-surface/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {renderStars()}
          <span className="ml-1 text-text-secondary font-semibold">{normalizedRating.toFixed(1)}</span>
        </div>
        {product.reviewCount && (
          <div className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary shadow-lg">
            {product.reviewCount} reviews
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1 text-base sm:text-lg">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              {product.category || 'General'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg sm:text-xl font-bold text-primary">
              {formatPrice(product.price || 0)}
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {product.combinedScore !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  product.combinedScore > 7 ? 'bg-success' :
                  product.combinedScore > 5 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${Math.min(100, product.combinedScore * 10)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {product.combinedScore.toFixed(1)}/10
            </span>
          </div>
        )}

        {product.featureScores && Object.keys(product.featureScores).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(product.featureScores)
              .slice(0, 3)
              .map(([name, score]) => (
                <span 
                  key={name} 
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                    score > 0.7 ? 'bg-success/10 text-success' :
                    score > 0.4 ? 'bg-warning/10 text-warning' :
                    'bg-danger/10 text-danger'
                  }`}
                >
                  {name}: {Math.round(score * 100)}%
                </span>
              ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-theme text-sm font-medium transition-all duration-200 hover:scale-105 ${
              inCart || isAdded
                ? 'bg-success/15 text-success border border-success/30'
                : 'bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/20'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {inCart || isAdded ? 'Added ✓' : 'Add to Cart'}
          </button>
          <button
            onClick={() => addToWishlist(product)}
            className={`p-2.5 rounded-theme border-2 transition-all duration-200 hover:scale-110 ${
              inWishlist 
                ? 'border-accent bg-accent/10 text-accent' 
                : 'border-border hover:border-primary hover:text-primary'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-accent' : ''}`} />
          </button>
          <Link 
            href={`/products/${product.id}`} 
            className="px-4 py-2.5 rounded-theme border-2 border-border text-sm font-medium text-text-secondary hover:bg-card hover:border-primary transition-all duration-200"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}