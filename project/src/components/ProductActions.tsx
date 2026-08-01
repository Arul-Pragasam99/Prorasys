'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { addToCartPersistence, addToWishlistPersistence } from '@/lib/cart-service';
import { StoreProduct } from '@/lib/store-data';
import { ShoppingCart, Heart, Check, Loader2 } from 'lucide-react';

interface ProductActionsProps {
  productId: string;
  product: StoreProduct;
}

export function ProductActions({ productId, product }: ProductActionsProps) {
  const { user, refreshCart } = useStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/products/${productId}`;
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCartPersistence(user.uid, product);
      if (refreshCart) await refreshCart();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/products/${productId}`;
      return;
    }

    setIsAddingToWishlist(true);
    try {
      await addToWishlistPersistence(user.uid, product);
      if (refreshCart) await refreshCart();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {isAddingToCart ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
        
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-medium text-text-primary hover:bg-card transition-colors disabled:opacity-50"
        >
          {isAddingToWishlist ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
          {isAddingToWishlist ? 'Saving...' : 'Save for Later'}
        </button>
      </div>

      {showSuccess && (
        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-100 border border-emerald-200 p-3 rounded-lg dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
          <Check className="w-4 h-4" />
          <span>Added to your {isAddingToCart ? 'cart' : 'wishlist'} successfully!</span>
        </div>
      )}

      {!user && (
        <p className="mt-3 text-sm text-text-secondary">
          <Link href={`/login?redirect=/products/${productId}`} className="text-primary hover:underline">
            Sign in
          </Link>
          {' '}to add items to your cart or wishlist
        </p>
      )}
    </div>
  );
}