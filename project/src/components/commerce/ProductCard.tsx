'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { StoreProduct, formatPrice } from '@/lib/store-data';
import { ShoppingBag, Heart, Eye, Star, Sparkles, Plus, Minus } from 'lucide-react';

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
  const { addToCart, addToWishlist, cart, wishlist, updateCartQuantity } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const inCart = quantity > 0;
  const inWishlist = wishlist.some((item) => item.id === product.id);

  const rating = product.avgRating || product.rating || 4.0;
  const normalizedRating = Math.min(5, Math.max(0, rating));

  const renderStars = () => {
    const stars = [];
    const full = Math.floor(normalizedRating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${i < full ? 'text-warning fill-warning' : 'text-border'}`} 
        />
      );
    }
    return stars;
  };

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleIncrement = () => {
    updateCartQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateCartQuantity(product.id, quantity - 1);
    } else {
      updateCartQuantity(product.id, 0);
    }
  };

  const getProductEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('headphone') || lower.includes('earbud')) return '🎧';
    if (lower.includes('watch')) return '⌚';
    if (lower.includes('monitor') || lower.includes('display')) return '🖥️';
    if (lower.includes('speaker')) return '🔊';
    if (lower.includes('laptop')) return '💻';
    if (lower.includes('charger') || lower.includes('battery')) return '🔋';
    if (lower.includes('phone')) return '📱';
    if (lower.includes('camera')) return '📷';
    if (lower.includes('printer')) return '🖨️';
    if (lower.includes('tablet')) return '📱';
    if (lower.includes('tv')) return '📺';
    if (lower.includes('coffee')) return '☕';
    if (lower.includes('book')) return '📚';
    if (lower.includes('yoga') || lower.includes('fitness')) return '🧘';
    return '📦';
  };

  const getGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-cyan-400',
      'from-purple-500 to-pink-400',
      'from-emerald-500 to-teal-400',
      'from-orange-500 to-red-400',
      'from-indigo-500 to-blue-400',
      'from-rose-500 to-pink-400',
    ];
    return gradients[name.length % gradients.length];
  };

  return (
    <div
      ref={cardRef}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${getGradient(product.name)} aspect-square flex items-center justify-center text-6xl`}>
        <span className="text-7xl">{getProductEmoji(product.name)}</span>
        
        {showAI && aiScore > 0 && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {Math.round(aiScore * 100)}%
          </div>
        )}

        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link href={`/products/${product.id}`} className="p-3 bg-surface text-text-primary rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-lg">
            <Eye className="w-5 h-5" />
          </Link>
          <button onClick={handleAddToCart} className="p-3 bg-surface text-text-primary rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-lg">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-surface/90 backdrop-blur px-2.5 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {renderStars()}
          <span className="ml-1 text-text-secondary">{normalizedRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-text-secondary mt-0.5">{product.category}</p>
          </div>
          <p className="text-lg font-bold text-primary flex-shrink-0">
            {formatPrice(product.price || 0)}
          </p>
        </div>

        <p className="text-sm text-text-secondary mt-2 line-clamp-2">
          {product.description}
        </p>

        {product.featureScores && Object.keys(product.featureScores).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(product.featureScores).slice(0, 3).map(([name, score]) => (
              <span key={name} className="text-[10px] px-2 py-0.5 bg-card text-text-secondary rounded-full border border-border">
                {name}: {Math.round((score || 0) * 100)}%
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/80">
          {inCart ? (
            <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
              <button
                onClick={handleDecrement}
                className="p-1.5 hover:bg-surface rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4 text-text-secondary" />
              </button>
              <span className="w-6 text-center text-sm font-medium text-text-primary">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="p-1.5 hover:bg-surface rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isAdded
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-primary text-white hover:bg-primary-light'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isAdded ? 'Added ✓' : 'Add to Cart'}
            </button>
          )}
          <button
            onClick={() => addToWishlist(product)}
            className={`p-2.5 rounded-lg border-2 transition-all ${
              inWishlist 
                ? 'border-accent bg-accent/10 text-accent' 
                : 'border-border hover:border-primary hover:text-primary'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-accent' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}