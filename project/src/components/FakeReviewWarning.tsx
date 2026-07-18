'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';

interface FakeReviewWarningProps {
  reviewId: string;
  userId: string;
  onClose?: () => void;
}

export function FakeReviewWarning({ reviewId, userId, onClose }: FakeReviewWarningProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    detectFakeReview();
  }, [reviewId, userId]);

  const detectFakeReview = async () => {
    try {
      const response = await fetch('/api/reviews/detect-fake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: { id: reviewId }, userId }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error detecting fake review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !visible || !analysis) return null;

  if (!analysis.isFake) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
        <Shield className="w-3 h-3" />
        <span>Verified review</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      <span className="font-medium">Suspicious review</span>
      {analysis.reasons && analysis.reasons.length > 0 && (
        <span className="text-amber-600">
          ({analysis.reasons.slice(0, 2).join(', ')})
        </span>
      )}
      {onClose && (
        <button
          onClick={() => { setVisible(false); onClose(); }}
          className="ml-auto text-amber-400 hover:text-amber-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}