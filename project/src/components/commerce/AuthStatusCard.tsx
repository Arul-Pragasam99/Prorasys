'use client';

import { useStore } from '@/components/commerce/StoreProvider';

export function AuthStatusCard() {
  const { isAuthenticated, userRole, cart, wishlist } = useStore();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Session</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">
        {isAuthenticated ? `Signed in as ${userRole}` : 'Guest mode'}
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Cart items</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{cart.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Wishlist items</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{wishlist.length}</p>
        </div>
      </div>
    </div>
  );
}
