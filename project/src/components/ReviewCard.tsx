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
        return { emoji: '😊', color: 'text-green-600 bg-green-50 border-green-200', label: 'Positive' };
      case 'negative':
        return { emoji: '😞', color: 'text-red-600 bg-red-50 border-red-200', label: 'Negative' };
      case 'neutral':
        return { emoji: '😐', color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Neutral' };
      default:
        return { emoji: '🤔', color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Unknown' };
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
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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
      review.isFlagged ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{review.userName}</p>
            {review.isFlagged && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <Flag className="w-3 h-3" />
                Flagged
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">{renderStars(review.starRating)}</div>
            <span className="text-sm text-slate-500">({review.starRating}/5)</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${sentimentInfo.color}`}>
          <span>{sentimentInfo.emoji}</span>
          <span>{sentimentInfo.label}</span>
        </div>
      </div>

      <p className={`mt-3 text-sm text-slate-700 ${!isExpanded && review.text.length > 200 ? 'line-clamp-3' : ''}`}>
        {review.text}
      </p>
      
      {review.text.length > 200 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-sm text-brand-600 hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {review.sentimentScore !== undefined && (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>🤖 AI Trust:</span>
            <span className="font-medium">
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
            isHelpful ? 'text-brand-600' : 'text-slate-500 hover:text-brand-600'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-brand-600' : ''}`} />
          <span>Helpful</span>
          {helpfulCount > 0 && <span className="text-xs">({helpfulCount})</span>}
        </button>
        
        {review.isFlagged && review.flagReasons && review.flagReasons.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            ⚠️ View flags
          </button>
        )}
      </div>

      {isExpanded && review.isFlagged && review.flagReasons && (
        <div className="mt-3 p-3 bg-red-100 rounded-lg">
          <p className="text-xs font-medium text-red-700">Flagged for:</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-red-600">
            {review.flagReasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}