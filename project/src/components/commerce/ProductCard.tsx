'use client';

import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { StoreProduct } from '@/lib/store-data';

export function ProductCard({ product }: { product: StoreProduct }) {
  const { addToCart, addToWishlist, cart, wishlist } = useStore();
  const inCart = cart.some((item) => item.id === product.id);
  const inWishlist = wishlist.some((item) => item.id === product.id);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`rounded-2xl bg-gradient-to-r ${product.color} p-5`}>
        <div className="flex items-center justify-between text-sm font-medium text-white">
          <span>{product.badge}</span>
          <span>★ {product.rating}</span>
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
        <p className="mt-2 text-sm text-slate-600">{product.description}</p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{product.category}</p>
          <p className="text-xl font-semibold text-slate-900">${product.price}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => addToCart(product)} className="rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white">
          {inCart ? 'Added' : 'Add to cart'}
        </button>
        <button onClick={() => addToWishlist(product)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          {inWishlist ? 'Saved' : 'Save'}
        </button>
        <Link href={`/products/${product.id}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Details
        </Link>
      </div>
    </article>
  );
}
