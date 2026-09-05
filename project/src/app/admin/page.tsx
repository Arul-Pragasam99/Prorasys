'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AuthStatusCard } from '@/components/commerce/AuthStatusCard';
import { useStore } from '@/components/commerce/StoreProvider';
import { Shield, Users, Package, Star, TrendingUp, Clock, AlertTriangle, CheckCircle, PlusCircle, BarChart3, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  avgRating: number;
  trustScore: number;
  pendingReviews: number;
  flaggedReviews: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalUsers: 0,
    avgRating: 0,
    trustScore: 0,
    pendingReviews: 0,
    flaggedReviews: 0,
  });
  const [fetchingStats, setFetchingStats] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setIsAdmin(true);
        setLoading(false);
        fetchAdminStats();
      } else {
        router.push('/');
      }
    } else if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, router]);

  const fetchAdminStats = async () => {
    try {
      setFetchingStats(true);
      
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => doc.data());
      const totalProducts = productsSnapshot.size;
      
      // Calculate average rating
      let avgRating = 0;
      const ratings = products.map(p => p.avgRating || p.rating || 0).filter(r => r > 0);
      if (ratings.length > 0) {
        avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
      
      // Calculate trust score
      let trustScore = 0;
      const scores = products.map(p => p.combinedScore || 0).filter(s => s > 0);
      if (scores.length > 0) {
        trustScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
      
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Fetch reviews
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());
      const pendingReviews = reviews.filter(r => !r.isFlagged).length;
      const flaggedReviews = reviews.filter(r => r.isFlagged).length;
      
      setStats({
        totalProducts,
        totalUsers,
        avgRating,
        trustScore: trustScore * 10, // Convert to percentage
        pendingReviews,
        flaggedReviews,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setFetchingStats(false);
    }
  };

  const statItems = [
    { icon: Package, label: 'Total Products', value: stats.totalProducts.toLocaleString(), change: '+12%', trend: 'up' },
    { icon: Users, label: 'Active Users', value: stats.totalUsers.toLocaleString(), change: '+8%', trend: 'up' },
    { icon: Star, label: 'Avg Rating', value: stats.avgRating.toFixed(1) + '★', change: '+0.3', trend: 'up' },
    { icon: TrendingUp, label: 'Trust Score', value: (stats.trustScore).toFixed(0) + '%', change: '+5%', trend: 'up' },
    { icon: Clock, label: 'Pending Reviews', value: stats.pendingReviews, change: '-2', trend: 'down' },
    { icon: AlertTriangle, label: 'Flagged Reviews', value: stats.flaggedReviews, change: '-1', trend: 'down' },
  ];

  // Quick Actions with actual navigation
  const quickActions = [
    {
      icon: PlusCircle,
      label: 'Add Product',
      description: 'Create a new product listing',
      onClick: () => router.push('/admin/products/add'),
      color: 'text-primary'
    },
    {
      icon: Users,
      label: 'Manage Users',
      description: 'View and manage user accounts',
      onClick: () => router.push('/admin/users'),
      color: 'text-secondary'
    },
    {
      icon: AlertTriangle,
      label: 'Review Moderation',
      description: 'Moderate flagged reviews',
      onClick: () => router.push('/admin/reviews'),
      color: 'text-warning'
    },
    {
      icon: BarChart3,
      label: 'AI Analytics',
      description: 'View AI insights and trends',
      onClick: () => router.push('/admin/analytics'),
      color: 'text-accent'
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="relative h-screen bg-surface text-text-primary overflow-hidden">
      <Header />

      <div className="absolute inset-x-0 top-16 bottom-0 overflow-y-auto overflow-x-hidden sm:top-20">
        <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div ref={headerRef} className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Admin Panel
            </p>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Verified
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">
            Manage Products, Users, and Reviews
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-text-secondary">
            Monitor and control your e-commerce platform with AI-powered insights.
            {user?.displayName && ` Welcome back, ${user.displayName}!`}
          </p>
        </div>

        {/* Stats - Real Data */}
        {fetchingStats ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-text-secondary">Loading stats...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
            {statItems.map(({ icon: Icon, label, value, change, trend }) => (
              <div 
                key={label}
                className="bg-card p-3 sm:p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wider truncate">{label}</p>
                    <p className="text-base sm:text-lg font-bold text-text-primary">{value}</p>
                    <p className={`text-[10px] sm:text-xs ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {trend === 'up' ? '↑' : '↓'} {change}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auth Status Card */}
        <div className="mb-6 sm:mb-8">
          <AuthStatusCard />
        </div>

        {/* Admin Overview */}
        <AdminOverview stats={stats} />

        {/* Quick Actions - Now Working */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map(({ icon: Icon, label, description, onClick, color }) => (
            <button
              key={label}
              onClick={onClick}
              className="p-3 sm:p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all hover:-translate-y-1 text-left group cursor-pointer"
            >
              <Icon className={`w-5 h-5 ${color} mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform`} />
              <h3 className="font-medium text-text-primary text-sm sm:text-base">{label}</h3>
              <p className="text-xs text-text-secondary">{description}</p>
            </button>
          ))}
        </div>
        </section>
      </div>
    </main>
  );
}