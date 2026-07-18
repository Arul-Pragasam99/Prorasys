import Link from 'next/link';
import { Header } from '@/components/commerce/Header';
import { ProductCard } from '@/components/commerce/ProductCard';
import { fetchProductsFromFirestore } from '@/lib/product-service';
import { featuredProducts } from '@/lib/store-data';

export default async function ProductsPage() {
  let products = featuredProducts;

  try {
    products = (await fetchProductsFromFirestore()).map((item) => ({
      id: item.id ?? '',
      name: item.name ?? 'Unnamed product',
      description: item.description ?? 'A featured product',
      price: item.price ?? 0,
      category: item.category ?? 'General',
      rating: item.avgRating ?? 4.5,
      badge: item.combinedScore ? `${item.combinedScore.toFixed(1)} score` : 'Featured',
      color: 'from-sky-500 to-cyan-400',
    }));
  } catch {
    products = featuredProducts;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Catalog</p>
            <h1 className="mt-2 text-3xl font-semibold">Browse products for your next order</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-brand-700">Back home</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
