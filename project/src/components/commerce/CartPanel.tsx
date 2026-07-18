'use client';

import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';

export function CartPanel() {
  const { cart, removeFromCart, wishlist, removeFromWishlist } = useStore();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Cart</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your selected items</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-brand-700">Continue shopping</Link>
        </div>
        {cart.length === 0 ? (
          <p className="mt-8 text-sm text-slate-600">Your cart is empty. Add products from the catalog to get started.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">${item.price}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-sm font-medium text-rose-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Wishlist</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">Saved for later</h3>
        {wishlist.length === 0 ? (
          <p className="mt-8 text-sm text-slate-600">Save items to review them later.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {wishlist.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">${item.price}</p>
                </div>
                <button onClick={() => removeFromWishlist(item.id)} className="text-sm font-medium text-rose-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
