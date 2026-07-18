'use client';

import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';

export function Header() {
  const { cart, wishlist, isAuthenticated, userRole, logout } = useStore();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          Prorasys Store
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/" className="transition hover:text-brand-700">Home</Link>
          <Link href="/products" className="transition hover:text-brand-700">Products</Link>
          <Link href="/recommendations" className="transition hover:text-brand-700">Recommended</Link>
          <Link href="/login" className="transition hover:text-brand-700">Login</Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Cart {cart.length}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Saved {wishlist.length}
          </span>
          {isAuthenticated ? (
            <button onClick={logout} className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
              {userRole === 'admin' ? 'Admin out' : 'Logout'}
            </button>
          ) : (
            <Link href="/admin" className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
