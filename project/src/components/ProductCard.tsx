import Link from 'next/link';
import { TrustScoreBadge } from './TrustScoreBadge';
import type { Product } from '@/lib/mock-data';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">#{product.rank}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{product.name}</h2>
        </div>
        <TrustScoreBadge score={product.combinedScore} />
      </div>
      <p className="mt-4 text-sm text-slate-600">{product.description}</p>
      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <span>${product.price}</span>
        <span>Rating {product.avgRating}</span>
      </div>
      <div className="mt-6 flex gap-3">
        <Link href={`/products/${product.id}`} className="rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white">
          View details
        </Link>
        <Link href="/recommendations" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          See recommendations
        </Link>
      </div>
    </article>
  );
}
