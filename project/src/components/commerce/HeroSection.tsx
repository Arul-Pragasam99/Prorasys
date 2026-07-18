import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-700 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
            Trusted shopping, verified reviews
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Shop smarter with customer-first products and admin-backed trust.
          </h1>
          <p className="max-w-xl text-lg text-slate-200">
            Browse curated products, compare trust signals, and manage reviews with a storefront built for both shoppers and admins.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full bg-white px-5 py-3 font-medium text-slate-900">
              Shop products
            </Link>
            <Link href="/login" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
              Customer login
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Why shoppers choose us</p>
          <div className="mt-6 space-y-4">
            {[
              'Verified reviews and trust scores',
              'Secure checkout and account access',
              'Fast admin moderation and insights',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-100">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
