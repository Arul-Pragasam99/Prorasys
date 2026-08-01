'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { ShoppingCart, Heart, Trash2, ArrowRight, Sparkles, Plus, Minus } from 'lucide-react';

export function CartPanel() {
  const { cart, removeFromCart, wishlist, removeFromWishlist, updateCartQuantity } = useStore();

  // Create unique key using id and a random string to ensure uniqueness
  const getUniqueKey = (item: any, index: number) => {
    return `${item.id}-${index}-${Date.now()}`;
  };

  // Remove duplicate items from cart (keep only one with combined quantity)
  const getUniqueCart = () => {
    const uniqueMap = new Map();
    cart.forEach(item => {
      if (uniqueMap.has(item.id)) {
        const existing = uniqueMap.get(item.id);
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      } else {
        uniqueMap.set(item.id, { ...item });
      }
    });
    return Array.from(uniqueMap.values());
  };

  // Remove duplicate items from wishlist
  const getUniqueWishlist = () => {
    const seen = new Set();
    return wishlist.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const uniqueCart = getUniqueCart();
  const uniqueWishlist = getUniqueWishlist();

  const total = uniqueCart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleIncrement = (productId: string, currentQuantity: number) => {
    updateCartQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartQuantity(productId, currentQuantity - 1);
    } else {
      updateCartQuantity(productId, 0);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Cart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Cart
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              Your selected items
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline group"
          >
            Continue shopping
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {uniqueCart.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Add products to get started</p>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {uniqueCart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 hover:shadow-sm transition-shadow gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      📦
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {item.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPrice(item.price || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
                      <button
                        onClick={() => handleDecrement(item.id, item.quantity || 1)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.id, item.quantity || 1)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal ({uniqueCart.length} items)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">Tax (10%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(total * 0.1)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 flex justify-between font-bold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatPrice(total * 1.1)}
                </span>
              </div>
              {total < 10000 && uniqueCart.length > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  🎉 Add {formatPrice(10000 - total)} more for free shipping!
                </p>
              )}
            </div>

            <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors hover:shadow-lg hover:shadow-blue-600/20">
              Proceed to Checkout
            </button>
          </>
        )}
      </div>

      {/* Wishlist Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Wishlist
          </p>
        </div>
        <h3 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
          Saved for later
        </h3>

        {uniqueWishlist.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <div className="text-4xl mb-3">💝</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Save items to review them later</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {uniqueWishlist.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.name || 'Product'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatPrice(item.price || 0)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Suggestions</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Based on your saved items, you might also like similar products.
          </p>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline group"
          >
            View recommendations
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}