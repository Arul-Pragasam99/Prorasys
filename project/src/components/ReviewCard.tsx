'use client';

import { useState } from 'react';
import type { Review } from '@/lib/mock-data';
import { Star, ThumbsUp, Flag, Clock } from 'lucide-react';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);

  const getSentimentInfo = (label: string) => {
    const sentiment = label?.toLowerCase() || 'neutral';
    switch (sentiment) {
      case 'positive':
        return { emoji: '😊', color: 'text-success bg-success/10 border-success/30', label: 'Positive' };
      case 'negative':
        return { emoji: '😞', color: 'text-danger bg-danger/10 border-danger/30', label: 'Negative' };
      case 'neutral':
        return { emoji: '😐', color: 'text-text-secondary bg-card border-border', label: 'Neutral' };
      default:
        return { emoji: '🤔', color: 'text-text-secondary bg-card border-border', label: 'Unknown' };
    }
  };

  const sentimentInfo = getSentimentInfo(review.sentimentLabel);

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return '';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-warning fill-warning' : 'text-border'
        }`}
      />
    ));
  };

  const handleHelpfulClick = () => {
    if (!isHelpful) {
      setIsHelpful(true);
      setHelpfulCount(prev => prev + 1);
    } else {
      setIsHelpful(false);
      setHelpfulCount(prev => prev - 1);
    }
  };

  const getCredibilityLabel = (weight: number) => {
    if (weight >= 0.8) return { label: 'High Trust', color: 'text-green-600' };
    if (weight >= 0.5) return { label: 'Medium Trust', color: 'text-yellow-600' };
    return { label: 'Low Trust', color: 'text-red-600' };
  };

  const credibility = getCredibilityLabel(review.credibilityWeight || 0);

  return (
    <div className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
      review.isFlagged ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-border bg-surface'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-text-primary">{review.userName}</p>
            {review.isFlagged && (
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
                <Flag className="w-3 h-3" />
                Flagged
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">{renderStars(review.starRating)}</div>
            <span className="text-sm text-text-secondary">({review.starRating}/5)</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${sentimentInfo.color}`}>
          <span>{sentimentInfo.emoji}</span>
          <span>{sentimentInfo.label}</span>
        </div>
      </div>

      <p className={`mt-3 text-sm text-text-secondary ${!isExpanded && review.text.length > 200 ? 'line-clamp-3' : ''}`}>
        {review.text}
      </p>
      
      {review.text.length > 200 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-sm text-primary hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {review.sentimentScore !== undefined && (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <span>🤖 AI Trust:</span>
            <span className="font-medium text-text-primary">
              {(review.sentimentScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Credibility:</span>
            <span className={`font-medium ${credibility.color}`}>
              {credibility.label}
            </span>
          </div>
          {(review as any).timestamp && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate((review as any).timestamp)}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleHelpfulClick}
          className={`flex items-center gap-1 text-xs transition-colors ${
            isHelpful ? 'text-primary' : 'text-text-secondary hover:text-primary'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-primary' : ''}`} />
          <span>Helpful</span>
          {helpfulCount > 0 && <span className="text-xs">({helpfulCount})</span>}
        </button>
        
        {review.isFlagged && review.flagReasons && review.flagReasons.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-red-500 hover:text-red-700 dark:text-red-300"
          >
            ⚠️ View flags
          </button>
        )}
      </div>

      {isExpanded && review.isFlagged && review.flagReasons && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
          <p className="text-xs font-medium text-red-700 dark:text-red-300">Flagged for:</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-red-600 dark:text-red-200">
            {review.flagReasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}