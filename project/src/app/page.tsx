'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { useStore } from '@/components/commerce/StoreProvider';
import { gsap } from 'gsap';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Package,
  Users,
  Crown,
  Shield
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getOrdersByUser, type Order } from '@/lib/order-service';
import { formatPriceSimple } from '@/lib/store-data';

interface CustomerStats {
  totalOrders: number;
  totalReviews: number;
  averageRating: number;
  wishlistCount: number;
  cartCount: number;
}

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, userRole, cart, wishlist, aiRecommendations } = useStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalReviews: 0,
    averageRating: 0,
    wishlistCount: 0,
    cartCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // ✅ Redirect admins to admin panel
  useEffect(() => {
    if (!isLoading && isAuthenticated && userRole === 'admin') {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, userRole, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Fetch customer stats
  useEffect(() => {
    if (isAuthenticated && user && userRole === 'customer') {
      fetchCustomerStats();
    }
  }, [isAuthenticated, user, userRole]);

  const fetchCustomerStats = async () => {
    try {
      // Fetch user's reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', user.uid)
      );
      const [reviewsSnapshot, orders] = await Promise.all([
        getDocs(reviewsQuery),
        getOrdersByUser(user.uid),
      ]);
      const userReviews = reviewsSnapshot.docs.map(doc => doc.data());
      setRecentOrders(orders.slice(0, 3));
      
      // Calculate review stats
      const totalReviews = userReviews.length;
      let avgRating = 0;
      const ratings = userReviews.map(r => r.rating || 0).filter(r => r > 0);
      if (ratings.length > 0) {
        avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
      
      setStats({
        totalOrders: orders.length,
        totalReviews,
        averageRating: avgRating,
        wishlistCount: wishlist.length,
        cartCount: cart.length,
      });
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  // ✅ Animations
  useEffect(() => {
    if (!mounted || !isAuthenticated || userRole !== 'customer') return;

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

  }, [mounted, isAuthenticated, userRole]);

  const displayName = user?.displayName || 'Customer';

  // Loading state
  if (isLoading || !mounted) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  // ✅ Admin redirect (only admins)
  if (isAuthenticated && userRole === 'admin') {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-text-secondary">Redirecting to Admin Panel...</p>
        </div>
      </main>
    );
  }

  // ─── GUEST LANDING PAGE ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="h-screen bg-surface text-text-primary overflow-hidden">
        <Header />

        <div className="absolute inset-x-0 top-16 bottom-0 overflow-y-auto overflow-x-hidden sm:top-20">
          <section 
            className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(15, 110, 86, 0.05) 0%, var(--color-surface) 70%)',
          }}
        >
          <div className="floating-bg absolute top-20 right-10 lg:right-20 opacity-20">
            <div className="w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="floating-bg absolute bottom-20 left-10 lg:left-20 opacity-15">
            <div className="w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          </div>

          <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
            <div className="w-full max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-card backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm mx-auto">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI-Powered Product Discovery
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1]">
                Discover Products
                <span className="block text-primary mt-2">
                  Built on Trust
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                AI-powered trust scores, sentiment analysis, and personalized recommendations 
                — helping you make confident purchasing decisions.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-theme font-medium hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
                >
                  Start Exploring
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-card text-text-primary rounded-theme border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  Sign In
                  <Users className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats - ✅ Fixed contrast */}
              <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-card p-4 rounded-theme-lg border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-bold text-primary">10K+</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Happy Users</p>
                </div>
                <div className="bg-card p-4 rounded-theme-lg border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-bold text-secondary">4.8★</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Rating</p>
                </div>
                <div className="bg-card p-4 rounded-theme-lg border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-bold text-accent">95%</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Trust Score</p>
                </div>
                <div className="bg-card p-4 rounded-theme-lg border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-bold text-success">24/7</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Support</p>
                </div>
              </div>
            </div>
          </div>
          </section>

        {/* Features Section */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Why Prorasys</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Built for Modern Shopping</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to make informed purchasing decisions with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-theme flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">AI Sentiment Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Advanced AI analyzes reviews to understand real customer sentiment and product quality.
              </p>
            </div>
            <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-secondary/10 rounded-theme flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Trust Scores</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Every product gets a trust score based on genuine reviews and sentiment analysis.
              </p>
            </div>
            <div className="bg-card rounded-theme-lg border border-border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-accent/10 rounded-theme flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Smart Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Personalized suggestions powered by machine learning and your preferences.
              </p>
            </div>
          </div>
          </section>

        {/* Footer */}
          <footer className="border-t border-border py-8 bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                <span className="font-semibold text-gray-900 dark:text-white">Prorasys</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Shop with Confidence</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Prorasys. All rights reserved.
              </p>
            </div>
          </div>
          </footer>
        </div>
      </main>
    );
  }

  // ─── CUSTOMER DASHBOARD ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-surface text-text-primary overflow-x-hidden">
      <Header />
      
      <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-20 sm:pt-24 lg:pt-28">
        
        {/* Welcome Header */}
        <div ref={headerRef} className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Customer Dashboard
            </p>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track your activity, reviews, and personalized recommendations
          </p>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cart</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.cartCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Heart className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wishlist</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.wishlistCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Star className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reviews</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Rating</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}★</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/products"
            className="p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all hover:-translate-y-1 text-center group"
          >
            <ShoppingBag className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 dark:text-white">Browse Products</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Discover new items</p>
          </Link>

          <Link
            href="/cart"
            className="p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all hover:-translate-y-1 text-center group"
          >
            <ShoppingBag className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 dark:text-white">View Cart</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.cartCount} items in cart</p>
          </Link>

          <Link
            href="/recommendations"
            className="p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all hover:-translate-y-1 text-center group"
          >
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 dark:text-white">AI Picks</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Personalized recommendations</p>
          </Link>

          <Link
            href="/profile"
            className="p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all hover:-translate-y-1 text-center group"
          >
            <Users className="w-6 h-6 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 dark:text-white">My Profile</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Recent Activity</p>
                <h2 className="mt-1 text-lg font-semibold text-text-primary">Your latest orders</h2>
              </div>
              <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="mt-4 space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Package className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-text-secondary">{order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">{formatPriceSimple(order.totalAmount)}</p>
                      <p className="text-xs capitalize text-primary">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border p-5 text-center">
                <p className="text-sm text-text-secondary">No orders yet.</p>
                <Link href="/products" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Start shopping <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>

          <section className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">For You</p>
                <h2 className="mt-1 text-lg font-semibold text-text-primary">AI picks</h2>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              {(aiRecommendations || []).slice(0, 3).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0 hover:text-primary">
                  <span className="truncate text-sm font-medium text-text-primary">{product.name}</span>
                  <span className="shrink-0 text-xs text-text-secondary">{formatPriceSimple(product.price)}</span>
                </Link>
              ))}
              {(!aiRecommendations || aiRecommendations.length === 0) && (
                <p className="text-sm text-text-secondary">Your personalized picks are being prepared.</p>
              )}
            </div>
            <Link href="/recommendations" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Explore recommendations <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

      </section>
    </main>
  );
}