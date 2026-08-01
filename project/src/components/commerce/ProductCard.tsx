'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { StoreProduct } from '@/lib/store-data';
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

  // Find if product is in cart and get its quantity
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
          className={`w-3.5 h-3.5 ${i < full ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      ref={cardRef}
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${getGradient(product.name)} aspect-square flex items-center justify-center text-6xl`}>
        <span className="text-7xl">{getProductEmoji(product.name)}</span>
        
        {showAI && aiScore > 0 && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {Math.round(aiScore * 100)}%
          </div>
        )}

        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link href={`/products/${product.id}`} className="p-3 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-all hover:scale-110 shadow-lg">
            <Eye className="w-5 h-5" />
          </Link>
          <button onClick={handleAddToCart} className="p-3 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-all hover:scale-110 shadow-lg">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2.5 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {renderStars()}
          <span className="ml-1 text-gray-700 dark:text-gray-300">{normalizedRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{product.category}</p>
          </div>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
            {formatPrice(product.price || 0)}
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
          {product.description}
        </p>

        {product.featureScores && Object.keys(product.featureScores).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(product.featureScores).slice(0, 3).map(([name, score]) => (
              <span key={name} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {name}: {Math.round((score || 0) * 100)}%
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {inCart ? (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={handleDecrement}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-medium text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isAdded
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
                ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}