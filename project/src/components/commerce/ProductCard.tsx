'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { StoreProduct } from '@/lib/store-data';
import { gsap } from 'gsap';
import { ShoppingCart, Heart, Eye, Star, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProductCardProps {
  product: StoreProduct & {
    combinedScore?: number;
    featureScores?: Record<string, number>;
    trustLevel?: string;
    avgRating?: number;
    reviewCount?: number;
  };
  index?: number;
  showAI?: boolean;
  aiScore?: number;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ 
  product, 
  index = 0, 
  showAI = false, 
  aiScore = 0,
  viewMode = 'grid' 
}: ProductCardProps) {
  const { addToCart, addToWishlist, cart, wishlist } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const inCart = cart.some((item) => item.id === product.id);
  const inWishlist = wishlist.some((item) => item.id === product.id);

  // Normalize rating to 0-5
  const displayRating = product.avgRating || product.rating || 4.0;
  const normalizedRating = Math.min(5, Math.max(0, displayRating));
  
  // Normalize combined score to 0-10
  const displayScore = product.combinedScore || 0;
  const normalizedScore = Math.min(10, Math.max(0, displayScore));

  // Get trust level color
  const getTrustColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTrustBadge = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return '⭐ High Trust';
      case 'medium': return 'Medium Trust';
      case 'low': return 'Low Trust';
      default: return 'Trust Score';
    }
  };

  useEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      delay: index * 0.08,
      ease: 'power2.out',
    });
  }, [index]);

  useEffect(() => {
    if (isHovered) {
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(contentRef.current, {
        y: -5,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(contentRef.current, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isHovered]);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    gsap.from(cardRef.current, {
      scale: 0.95,
      duration: 0.3,
      ease: 'back.out(1.7)',
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-3 h-3 text-gray-300" />
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 absolute top-0 left-0 clip-half" />
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white rounded-xl shadow-sm border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
        viewMode === 'list' ? 'flex gap-6 p-4' : 'p-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* AI Badge */}
      {showAI && aiScore > 0 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
          <Sparkles className="w-3 h-3" />
          {Math.round(aiScore * 100)}% match
        </div>
      )}

      {/* Trust Badge */}
      {product.trustLevel && (
        <div className={`absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTrustColor(product.trustLevel)} shadow-sm`}>
          {product.trustLevel === 'high' && '⭐'}
          {getTrustBadge(product.trustLevel)}
        </div>
      )}

      {/* Image */}
      <div 
        ref={imageRef}
        className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 ${
          viewMode === 'list' ? 'w-40 h-40 flex-shrink-0' : 'aspect-square'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${product.color || 'from-brand-500 to-blue-500'} opacity-10`} />
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {product.image || '📦'}
        </div>
        
        {/* Quick actions overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Link
            href={`/products/${product.id}`}
            className="p-3 bg-white rounded-full hover:bg-brand-50 hover:text-brand-600 transition-all duration-200 hover:scale-110"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button
            onClick={handleAddToCart}
            className="p-3 bg-white rounded-full hover:bg-brand-50 hover:text-brand-600 transition-all duration-200 hover:scale-110"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium shadow-sm">
          {renderStars()}
          <span className="ml-1 text-slate-700">{normalizedRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className={`${viewMode === 'list' ? 'flex-1' : 'mt-4'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
              {product.category || 'General'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-slate-900">
              ${product.price?.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
          {product.description}
        </p>

        {/* Trust Score Bar */}
        {product.combinedScore !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  normalizedScore > 7 ? 'bg-emerald-500' :
                  normalizedScore > 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(normalizedScore / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {normalizedScore.toFixed(1)}/10
            </span>
          </div>
        )}

        {/* Feature Scores Preview */}
        {product.featureScores && Object.keys(product.featureScores).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(product.featureScores)
              .slice(0, 3)
              .map(([name, score]) => {
                const numScore = typeof score === 'number' ? score : 0.5;
                return (
                  <span 
                    key={name} 
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      numScore > 0.7 ? 'bg-emerald-50 text-emerald-600' :
                      numScore > 0.4 ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}
                  >
                    {name}: {Math.round(numScore * 100)}%
                  </span>
                );
              })}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
              inCart || isAdded
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {inCart || isAdded ? 'Added ✓' : 'Add to Cart'}
          </button>
          <button
            onClick={() => addToWishlist(product)}
            className={`p-2 rounded-full border transition-all duration-200 hover:scale-110 ${
              inWishlist
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-slate-200 hover:border-brand-200 hover:text-brand-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
          </button>
          <Link
            href={`/products/${product.id}`}
            className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-all duration-200 hover:scale-105"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}