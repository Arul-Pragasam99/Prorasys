'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { CartPanel } from '@/components/commerce/CartPanel';
import { useStore } from '@/components/commerce/StoreProvider';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <CartPanel />
      </div>
    </main>
  );
}