'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { ShoppingCart, Heart, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export function CartPanel() {
  const { cart, removeFromCart, wishlist, removeFromWishlist } = useStore();
  const cartRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate cart items
    const cartItems = cartRef.current?.querySelectorAll('.cart-item');
    if (cartItems) {
      gsap.from(cartItems, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  }, [cart]);

  useEffect(() => {
    // Animate wishlist items
    const wishlistItems = wishlistRef.current?.querySelectorAll('.wishlist-item');
    if (wishlistItems) {
      gsap.from(wishlistItems, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.2,
      });
    }
  }, [wishlist]);

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Cart Section */}
      <div ref={cartRef} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Your selected items
            </h2>
          </div>
          <Link 
            href="/products" 
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors group"
          >
            Continue shopping
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-slate-600">Your cart is empty</p>
            <p className="text-sm text-slate-400 mt-1">Add products from the catalog to get started</p>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="cart-item flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
                      <p className="text-sm text-slate-600">${item.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal ({cart.length} items)</span>
                <span className="font-semibold text-slate-900">${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-600">Tax (10%)</span>
                <span className="font-semibold text-slate-900">${(getTotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${(getTotal() * 1.1).toFixed(2)}</span>
              </div>
              {getTotal() < 100 && cart.length > 0 && (
                <p className="text-xs text-emerald-600 mt-2">
                  🎉 Add ${(100 - getTotal()).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>

            <button className="w-full mt-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-full font-medium hover:shadow-lg hover:shadow-brand-200 transition-all duration-300 hover:-translate-y-1">
              Proceed to Checkout
            </button>
          </>
        )}
      </div>

      {/* Wishlist Section */}
      <div ref={wishlistRef} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
            Wishlist
          </p>
        </div>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          Saved for later
        </h3>

        {wishlist.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <div className="text-4xl mb-3">💝</div>
            <p className="text-sm text-slate-600">Save items to review them later</p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="wishlist-item flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-600">${item.price?.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI Suggestions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">AI Suggestions</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Based on your saved items, you might also like similar products.
          </p>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600 hover:text-purple-700 transition-colors group"
          >
            View recommendations
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}