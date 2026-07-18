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
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Sparkles className="w-4 h-4" />
          {loadingRecommendations ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
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
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-800">AI Recommended for You</h3>
        <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">Powered by AI</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={`/products/${rec.id}`}
            className="group p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-purple-300"
          >
            <p className="font-medium text-sm group-hover:text-purple-600 transition-colors">
              {rec.name || 'Product'}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                ${rec.price?.toFixed(2) || 'N/A'}
              </span>
              {rec.recommendation_score && (
                <span className="text-xs text-purple-600">
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