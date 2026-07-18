import { categories } from '@/lib/store-data';

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Top categories</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Shop by need</h2>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <div key={category.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
