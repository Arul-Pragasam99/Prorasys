import { Header } from '@/components/commerce/Header';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AuthStatusCard } from '@/components/commerce/AuthStatusCard';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Admin panel</p>
          <h1 className="mt-2 text-3xl font-semibold">Manage products, users, and review trust</h1>
        </div>
        <div className="mb-8">
          <AuthStatusCard />
        </div>
        <AdminOverview />
      </section>
    </main>
  );
}
