type TrustScoreBadgeProps = {
  score: number;
  label?: string;
};

export function TrustScoreBadge({ score, label = 'Trust score' }: TrustScoreBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      {label}: {score.toFixed(1)}
    </div>
  );
}
