'use client';

import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { ShoppingCart, Heart, Trash2, ArrowRight, Sparkles, Plus, Minus } from 'lucide-react';

export function CartPanel() {
  const { cart, removeFromCart, wishlist, removeFromWishlist, updateCartQuantity } = useStore();

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

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
      <div className="bg-card rounded-theme-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Cart
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-text-primary">Your selected items</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm text-primary hover:underline group">
            Continue shopping
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-text-secondary">Your cart is empty</p>
            <p className="text-sm text-text-secondary mt-1">Add products to get started</p>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.quantity}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-theme border border-border bg-surface p-4 hover:shadow-sm transition-shadow gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      📦
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary truncate">{item.name || 'Product'}</p>
                      <p className="text-sm text-text-secondary">{formatPrice(item.price || 0)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2 bg-card rounded-theme border border-border p-1">
                      <button
                        onClick={() => handleDecrement(item.id, item.quantity || 1)}
                        className="p-1.5 hover:bg-surface rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4 text-text-secondary" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-text-primary">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.id, item.quantity || 1)}
                        className="p-1.5 hover:bg-surface rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-card rounded-lg border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal ({cart.length} items)</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-text-secondary">Tax (10%)</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(total * 0.1)}
                </span>
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                <span className="text-text-primary">Total</span>
                <span className="text-primary">
                  {formatPrice(total * 1.1)}
                </span>
              </div>
              {total < 10000 && cart.length > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  🎉 Add {formatPrice(10000 - total)} more for free shipping!
                </p>
              )}
            </div>

            <button className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors hover:shadow-lg hover:shadow-primary/20">
              Proceed to Checkout
            </button>
          </>
        )}
      </div>

      {/* Wishlist Section */}
      <div className="bg-card rounded-theme-xl border border-border p-6">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent" />
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Wishlist
          </p>
        </div>
        <h3 className="mt-1 text-2xl font-semibold text-text-primary">
          Saved for later
        </h3>

        {wishlist.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <div className="text-4xl mb-3">💝</div>
            <p className="text-sm text-text-secondary">Save items to review them later</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {item.name || 'Product'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {formatPrice(item.price || 0)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Suggestions</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Based on your saved items, you might also like similar products.
          </p>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline group"
          >
            View recommendations
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}