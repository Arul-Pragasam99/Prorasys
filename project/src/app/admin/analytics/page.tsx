'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ArrowLeft, TrendingUp, Star, Users, Package, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AnalyticsData {
  totalProducts: number;
  totalUsers: number;
  avgRating: number;
  trustScore: number;
  totalReviews: number;
  flaggedReviews: number;
  sentimentDistribution: { positive: number; negative: number; neutral: number };
  topProducts: any[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => doc.data());
      
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // Fetch reviews
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());
      
      // Calculate analytics
      const totalProducts = productsSnapshot.size;
      const totalUsers = usersSnapshot.size;
      const totalReviews = reviews.length;
      
      // Average rating
      let avgRating = 0;
      const ratings = products.map(p => p.avgRating || p.rating || 0).filter(r => r > 0);
      if (ratings.length > 0) {
        avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
      
      // Trust score
      let trustScore = 0;
      const scores = products.map(p => p.combinedScore || 0).filter(s => s > 0);
      if (scores.length > 0) {
        trustScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
      
      // Sentiment distribution
      const sentimentDist = { positive: 0, negative: 0, neutral: 0 };
      reviews.forEach((r: any) => {
        const label = r.sentimentLabel?.toLowerCase() || 'neutral';
        if (label === 'positive') sentimentDist.positive++;
        else if (label === 'negative') sentimentDist.negative++;
        else sentimentDist.neutral++;
      });
      
      // Flagged reviews
      const flaggedReviews = reviews.filter((r: any) => r.isFlagged).length;
      
      // Top products (by rating)
      const topProducts = products
        .sort((a: any, b: any) => (b.avgRating || 0) - (a.avgRating || 0))
        .slice(0, 5)
        .map((p: any) => ({ name: p.name, rating: p.avgRating || 0 }));
      
      setData({
        totalProducts,
        totalUsers,
        avgRating,
        trustScore: trustScore * 10,
        totalReviews,
        flaggedReviews,
        sentimentDistribution: sentimentDist,
        topProducts,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  const stats = [
    { label: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'text-primary' },
    { label: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'text-secondary' },
    { label: 'Avg Rating', value: data?.avgRating?.toFixed(1) + '★' || '0★', icon: Star, color: 'text-accent' },
    { label: 'Trust Score', value: data?.trustScore?.toFixed(0) + '%' || '0%', icon: TrendingUp, color: 'text-success' },
    { label: 'Total Reviews', value: data?.totalReviews || 0, icon: Clock, color: 'text-warning' },
    { label: 'Flagged Reviews', value: data?.flaggedReviews || 0, icon: AlertTriangle, color: 'text-danger' },
  ];

  return (
    <main className="min-h-screen bg-surface text-text-primary overflow-x-hidden">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-lg hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">AI Analytics</h1>
            <p className="text-text-secondary mt-1">View AI insights and trends</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-bold text-text-primary">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Sentiment Distribution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data?.sentimentDistribution.positive || 0}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Positive Reviews</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data?.sentimentDistribution.neutral || 0}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Neutral Reviews</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data?.sentimentDistribution.negative || 0}</p>
              <p className="text-sm text-red-600 dark:text-red-400">Negative Reviews</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        {data?.topProducts && data.topProducts.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Top Rated Products</h2>
            <div className="space-y-3">
              {data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-text-secondary">#{index + 1}</span>
                    <span className="font-medium text-text-primary">{product.name || 'Unnamed'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-text-primary">{product.rating?.toFixed(1) || '0'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}