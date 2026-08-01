'use client';

import { useStore } from '@/components/commerce/StoreProvider';

export function AuthStatusCard() {
  const { isAuthenticated, userRole, cart, wishlist, user } = useStore();
  
  const displayName = user?.displayName || 'User';

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Session</p>
      <h3 className="mt-2 text-xl font-semibold text-text-primary">
        {isAuthenticated ? `Signed in as ${userRole}` : 'Not signed in'}
      </h3>
      {isAuthenticated && (
        <p className="text-sm text-text-secondary mt-1">Welcome, {displayName}!</p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface border border-border p-4">
          <p className="text-sm text-text-secondary">Cart items</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{cart.length}</p>
        </div>
        <div className="rounded-2xl bg-surface border border-border p-4">
          <p className="text-sm text-text-secondary">Wishlist items</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">{wishlist.length}</p>
        </div>
      </div>
    </div>
  );
}