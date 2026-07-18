'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AuthStatusCard } from '@/components/commerce/AuthStatusCard';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { Shield, Users, Package, Star, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is admin
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setIsAdmin(true);
        setLoading(false);
      } else {
        // Redirect non-admin users
        router.push('/');
      }
    } else if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAdmin) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: 'power3.out',
        });

        gsap.from(statsRef.current?.children || [], {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: 'back.out(1.7)',
        });
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [isAdmin]);

  const stats = [
    { icon: Package, label: 'Total Products', value: '1,234', change: '+12%', trend: 'up' },
    { icon: Users, label: 'Active Users', value: '5,678', change: '+8%', trend: 'up' },
    { icon: Star, label: 'Avg Rating', value: '4.8★', change: '+0.3', trend: 'up' },
    { icon: TrendingUp, label: 'Trust Score', value: '94%', change: '+5%', trend: 'up' },
    { icon: Clock, label: 'Pending Reviews', value: '23', change: '-2', trend: 'down' },
    { icon: AlertTriangle, label: 'Flagged Reviews', value: '5', change: '-1', trend: 'down' },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <Header />
      
      <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-600" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
              Admin Panel
            </p>
            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Manage Products, Users, and Reviews
          </h1>
          <p className="mt-2 text-slate-600">
            Monitor and control your e-commerce platform with AI-powered insights.
            {user?.displayName && ` Welcome back, ${user.displayName}!`}
          </p>
        </div>

        {/* Quick Stats */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, change, trend }) => (
            <div 
              key={label}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-lg font-bold text-slate-900">{value}</p>
                  <p className={`text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend === 'up' ? '↑' : '↓'} {change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Status */}
        <div className="mb-8">
          <AuthStatusCard />
        </div>

        {/* Admin Overview */}
        <AdminOverview />

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1 text-left">
            <Package className="w-5 h-5 text-brand-600 mb-2" />
            <h3 className="font-medium text-slate-900">Add Product</h3>
            <p className="text-xs text-slate-500">Create a new product listing</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1 text-left">
            <Users className="w-5 h-5 text-blue-600 mb-2" />
            <h3 className="font-medium text-slate-900">Manage Users</h3>
            <p className="text-xs text-slate-500">View and manage user accounts</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1 text-left">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mb-2" />
            <h3 className="font-medium text-slate-900">Review Moderation</h3>
            <p className="text-xs text-slate-500">Moderate flagged reviews</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1 text-left">
            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
            <h3 className="font-medium text-slate-900">AI Analytics</h3>
            <p className="text-xs text-slate-500">View AI insights and trends</p>
          </button>
        </div>
      </section>
    </main>
  );
}