'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { CartPanel } from '@/components/commerce/CartPanel';
import { useStore } from '@/components/commerce/StoreProvider';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userRole } = useStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }
    if (!isLoading && userRole === 'admin') {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, userRole, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || userRole === 'admin') {
    return null;
  }

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <CartPanel />
      </div>
    </main>
  );
}