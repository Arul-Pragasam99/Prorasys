import type { Review } from '@/lib/mock-data';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">{review.userName}</p>
        <span className="text-sm text-slate-500">★ {review.starRating}</span>
      </div>
      <p className="mt-3 text-sm text-slate-700">{review.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{review.sentimentLabel}</span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">Credibility {review.credibilityWeight}</span>
      </div>
    </div>
  );
}
