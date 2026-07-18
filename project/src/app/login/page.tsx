import { Header } from '@/components/commerce/Header';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { AuthStatusCard } from '@/components/commerce/AuthStatusCard';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Customer access</p>
          <h1 className="text-3xl font-semibold">Log in to your account</h1>
          <p className="text-lg text-slate-600">Track orders, save favorites, and leave reviews for products you already own.</p>
          <AuthStatusCard />
        </div>
        <AuthPanel />
      </section>
    </main>
  );
}
