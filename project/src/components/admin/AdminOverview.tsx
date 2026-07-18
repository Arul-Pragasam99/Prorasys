const cards = [
  { label: 'Pending reviews', value: '12' },
  { label: 'Active users', value: '328' },
  { label: 'Average trust score', value: '8.4' },
];

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Moderation queue</h2>
        <p className="mt-2 text-sm text-slate-600">Admins can review flagged content, approve products, and manage trust signals.</p>
      </div>
    </div>
  );
}
