'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, CheckCircle, AlertCircle, Star } from 'lucide-react';

type TrustScoreBadgeProps = {
  score: number;
  label?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function TrustScoreBadge({ 
  score, 
  label = 'Trust Score',
  showDetails = false,
  size = 'md'
}: TrustScoreBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);

  // Normalize score to 0-10 scale if needed
  const normalizedScore = typeof score === 'number' ? Math.min(10, Math.max(0, score)) : 0;

  useEffect(() => {
    // Animate the progress bar
    gsap.from(progressRef.current, {
      width: 0,
      duration: 1.5,
      ease: 'power2.out',
      delay: 0.3,
    });

    // Animate the score number
    gsap.from(scoreRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.5,
      delay: 0.8,
      ease: 'power2.out',
    });
  }, [normalizedScore]);

  const getColor = () => {
    if (normalizedScore >= 8) return 'emerald';
    if (normalizedScore >= 6) return 'blue';
    if (normalizedScore >= 4) return 'yellow';
    return 'red';
  };

  const getLabel = () => {
    if (normalizedScore >= 8) return 'High Trust';
    if (normalizedScore >= 6) return 'Good Trust';
    if (normalizedScore >= 4) return 'Medium Trust';
    return 'Low Trust';
  };

  const getIcon = () => {
    if (normalizedScore >= 8) return <CheckCircle className="w-4 h-4" />;
    if (normalizedScore >= 6) return <Shield className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const color = getColor();
  const colorClasses = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  };

  return (
    <div 
      ref={badgeRef}
      className={`inline-flex flex-col rounded-2xl border ${colorClasses[color]} ${sizeClasses[size]} transition-all duration-300 hover:shadow-md hover:-translate-y-1 min-w-[140px]`}
    >
      <div className="flex items-center gap-2">
        <Shield className={`w-4 h-4 ${size === 'lg' ? 'w-5 h-5' : ''}`} />
        <span className="font-medium">{label}</span>
        <span ref={scoreRef} className={`font-bold ml-1 ${size === 'lg' ? 'text-xl' : 'text-lg'}`}>
          {normalizedScore.toFixed(1)}
        </span>
        <span className="text-xs opacity-60">/ 10</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface/80 rounded-full mt-2 overflow-hidden border border-border/60">
        <div 
          ref={progressRef}
          className={`h-full rounded-full transition-colors ${
            normalizedScore >= 8 ? 'bg-emerald-500' :
            normalizedScore >= 6 ? 'bg-blue-500' :
            normalizedScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${(normalizedScore / 10) * 100}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center gap-2 mt-2 text-xs">
          {getIcon()}
          <span className="font-medium">{getLabel()}</span>
          {normalizedScore < 4 && (
            <span className="text-red-600 ml-1">- Review with caution</span>
          )}
          {normalizedScore >= 8 && (
            <span className="text-emerald-600 ml-1">- Highly recommended</span>
          )}
        </div>
      )}

      {showDetails && (
        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span>Based on real user sentiment</span>
        </div>
      )}
    </div>
  );
}