'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/commerce/StoreProvider';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIRecommendationsProps {
  productId: string;
}

export function AIRecommendations({ productId }: AIRecommendationsProps) {
  const { user, aiRecommendations, loadingRecommendations } = useStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (user && aiRecommendations) {
      const filtered = aiRecommendations.filter((rec: any) => rec.id !== productId);
      setRecommendations(filtered.slice(0, 4));
    }
  }, [user, aiRecommendations, productId]);

  if (!user || loadingRecommendations) {
    return (
      <div className="mt-8 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Sparkles className="w-4 h-4 text-primary" />
          {loadingRecommendations ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Finding personalized recommendations...</span>
            </>
          ) : (
            <span>Sign in for personalized recommendations</span>
          )}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-text-primary">AI Recommended for You</h3>
        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Powered by AI</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={`/products/${rec.id}`}
            className="group p-3 bg-surface border border-border rounded-lg hover:shadow-md transition-all hover:border-primary/50"
          >
            <p className="font-medium text-sm text-text-primary group-hover:text-primary transition-colors">
              {rec.name || 'Product'}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-text-secondary">
                ${rec.price?.toFixed(2) || 'N/A'}
              </span>
              {rec.recommendation_score && (
                <span className="text-xs text-primary">
                  Match: {(rec.recommendation_score * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}