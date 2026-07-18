import { Header } from '@/components/commerce/Header';
import { recommendations } from '@/lib/mock-data';

export default function RecommendationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <h1 className="text-3xl font-semibold">Recommendations</h1>
        <p className="mt-3 text-slate-600">Content-based suggestions tuned to your browsing and review behavior.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {recommendations.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{item.reason}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
