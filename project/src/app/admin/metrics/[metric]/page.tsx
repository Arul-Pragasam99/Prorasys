'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, CheckCircle, Clock, Package, Shield, Star, Users } from 'lucide-react';
import { Header } from '@/components/commerce/Header';

const metricDetails = {
  products: {
    title: 'Total Products',
    description: 'Review your product catalog and add new listings.',
    icon: Package,
    action: 'Manage Products',
    href: '/admin/products/add',
  },
  users: {
    title: 'Active Users',
    description: 'View customer accounts and manage platform access.',
    icon: Users,
    action: 'Manage Users',
    href: '/admin/users',
  },
  'avg-rating': {
    title: 'Average Rating',
    description: 'Explore rating trends and product performance.',
    icon: Star,
    action: 'Open Analytics',
    href: '/admin/analytics',
  },
  'pending-reviews': {
    title: 'Pending Reviews',
    description: 'Review customer feedback awaiting moderation.',
    icon: Clock,
    action: 'Review Submissions',
    href: '/admin/reviews',
  },
  'flagged-reviews': {
    title: 'Flagged Reviews',
    description: 'Investigate reviews identified for moderation.',
    icon: Shield,
    action: 'Open Moderation',
    href: '/admin/reviews',
  },
  'trust-score': {
    title: 'Trust Score',
    description: 'See AI-powered trust insights across your catalog.',
    icon: BarChart3,
    action: 'Open Analytics',
    href: '/admin/analytics',
  },
} as const;

export default function AdminMetricPage() {
  const { metric } = useParams<{ metric: string }>();
  const detail = metricDetails[metric as keyof typeof metricDetails];

  if (!detail) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="mx-auto max-w-3xl px-4 pt-28 text-center">
          <h1 className="text-2xl font-bold">Metric not found</h1>
          <Link href="/admin" className="mt-4 inline-block text-primary hover:underline">Back to Admin</Link>
        </div>
      </main>
    );
  }

  const Icon = detail.icon;

  return (
    <main className="relative h-screen overflow-hidden bg-surface text-text-primary">
      <Header />
      <div className="absolute inset-x-0 top-16 bottom-0 overflow-y-auto sm:top-20">
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Admin
          </Link>
          <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-10">
            <Icon className="h-10 w-10 text-primary" />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Admin Metric</p>
            <h1 className="mt-2 text-3xl font-bold">{detail.title}</h1>
            <p className="mt-3 max-w-2xl text-text-secondary">{detail.description}</p>
            <Link href={detail.href} className="mt-8 inline-flex items-center gap-2 rounded-theme bg-primary px-5 py-3 font-medium text-white hover:bg-primary-light">
              <CheckCircle className="h-4 w-4" /> {detail.action}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}