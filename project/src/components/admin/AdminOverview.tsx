'use client';

import { Package, Users, Star, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  avgRating: number;
  trustScore: number;
  pendingReviews: number;
  flaggedReviews: number;
}

interface AdminOverviewProps {
  stats: AdminStats;
}

export function AdminOverview({ stats }: AdminOverviewProps) {
  const metrics = [
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'text-primary' },
    { label: 'Active Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-secondary' },
    { label: 'Avg Rating', value: stats.avgRating.toFixed(1) + '★', icon: Star, color: 'text-accent' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'text-warning' },
    { label: 'Flagged Reviews', value: stats.flaggedReviews, icon: AlertTriangle, color: 'text-danger' },
    { label: 'Trust Score', value: stats.trustScore.toFixed(0) + '%', icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
      {metrics.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-card p-3 sm:p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center"
        >
          <div className="flex justify-center mb-1 sm:mb-2">
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
          </div>
          <p className="text-base sm:text-xl font-bold text-text-primary">{value}</p>
          <p className="text-[10px] sm:text-xs text-text-secondary">{label}</p>
        </div>
      ))}
    </div>
  );
}