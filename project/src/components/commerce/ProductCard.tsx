'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { StoreProduct } from '@/lib/store-data';
import { gsap } from 'gsap';
import { ShoppingCart, Heart, Eye, Star, Sparkles } from 'lucide-react';

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
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const inCart = cart.some((item) => item.id === product.id);
  const inWishlist = wishlist.some((item) => item.id === product.id);

  const rating = product.avgRating || product.rating || 4.0;
  const normalizedRating = Math.min(5, Math.max(0, rating));

  const priceInINR = (product.price || 0) * 83; // Assuming 1 USD = 83 INR (can be adjusted)

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
      gsap.to(imageRef.current, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
      gsap.to(contentRef.current, { y: -5, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(imageRef.current, { scale: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(contentRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, [isHovered]);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    gsap.from(cardRef.current, { scale: 0.95, duration: 0.3, ease: 'back.out(1.7)' });
    setTimeout(() => setIsAdded(false), 2000);
  };

  const renderStars = () => {
    const stars = [];
    const full = Math.floor(normalizedRating);
    const half = normalizedRating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<Star key={i} className="w-3 h-3 text-warning fill-warning" />);
      else if (i === full && half) stars.push(<Star key={i} className="w-3 h-3 text-warning fill-warning" />);
      else stars.push(<Star key={i} className="w-3 h-3 text-border" />);
    }
    return stars;
  };

  const getTrustColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-success/10 text-success border-success/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'low': return 'bg-danger/10 text-danger border-danger/30';
      default: return 'bg-card text-text-secondary border-border';
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative bg-card rounded-theme-lg border border-border p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showAI && aiScore > 0 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-primary text-white px-2.5 py-1 rounded-theme text-xs font-medium shadow-sm">
          <Sparkles className="w-3 h-3" />
          {Math.round(aiScore * 100)}% match
        </div>
      )}

      {product.trustLevel && (
        <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-theme text-xs font-medium border ${getTrustColor(product.trustLevel)}`}>
          {product.trustLevel === 'high' ? '⭐ High Trust' : product.trustLevel === 'medium' ? 'Medium Trust' : 'Low Trust'}
        </div>
      )}

      <div ref={imageRef} className="relative overflow-hidden rounded-theme bg-surface aspect-square">
        <div className="absolute inset-0 flex items-center justify-center text-5xl">{product.image || '📦'}</div>
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link href={`/products/${product.id}`} className="p-3 bg-white rounded-theme hover:bg-primary hover:text-white transition-all duration-200">
            <Eye className="w-5 h-5" />
          </Link>
          <button onClick={handleAddToCart} className="p-3 bg-white rounded-theme hover:bg-primary hover:text-white transition-all duration-200">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-surface/90 backdrop-blur px-2 py-1 rounded-theme text-xs font-medium shadow-sm">
          {renderStars()}
          <span className="ml-1 text-text-secondary">{normalizedRating.toFixed(1)}</span>
        </div>
      </div>

      <div ref={contentRef} className="mt-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          </Link>
          <p className="text-lg font-bold text-primary">₹{priceInINR.toLocaleString('en-IN')}</p>
        </div>
        <p className="text-sm text-text-secondary mt-1 line-clamp-2">{product.description}</p>

        {product.combinedScore !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: `${Math.min(100, product.combinedScore * 10)}%` }} />
            </div>
            <span className="text-xs font-medium text-text-secondary">{product.combinedScore.toFixed(1)}/10</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-theme text-sm font-medium transition-all duration-200 hover:scale-105 ${
              inCart || isAdded ? 'bg-success/10 text-success' : 'bg-primary text-white hover:bg-primary-light'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {inCart || isAdded ? 'Added ✓' : 'Add to Cart'}
          </button>
          <button
            onClick={() => addToWishlist(product)}
            className={`p-2 rounded-theme border transition-all duration-200 hover:scale-110 ${
              inWishlist ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-primary'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-accent' : ''}`} />
          </button>
          <Link href={`/products/${product.id}`} className="px-4 py-2 rounded-theme border border-border text-sm font-medium text-text-secondary hover:bg-surface transition-all duration-200">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}