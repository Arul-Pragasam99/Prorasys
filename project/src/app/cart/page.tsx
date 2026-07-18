import { Header } from '@/components/commerce/Header';
import { CartPanel } from '@/components/commerce/CartPanel';

export default function CartPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <CartPanel />
      </section>
    </main>
  );
}
