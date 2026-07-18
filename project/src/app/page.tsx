import { Header } from '@/components/commerce/Header';
import { HeroSection } from '@/components/commerce/HeroSection';
import { CategoryStrip } from '@/components/commerce/CategoryStrip';
import { ProductCard } from '@/components/commerce/ProductCard';
import { featuredProducts } from '@/lib/store-data';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <HeroSection />
      <CategoryStrip />
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Featured products</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Popular right now</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
