import Link from 'next/link';
import { ReviewCard } from '@/components/ReviewCard';
import { TrustScoreBadge } from '@/components/TrustScoreBadge';
import { products as fallbackProducts, reviews as fallbackReviews } from '@/lib/mock-data';
import { Header } from '@/components/commerce/Header';
import { fetchProductsFromFirestore, fetchReviewsFromFirestore } from '@/lib/product-service';

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;

  let product = fallbackProducts.find((item) => item.id === productId) ?? fallbackProducts[0];
  let productReviews = fallbackReviews.filter((review) => review.productId === product.id);

  try {
    const firestoreProducts = await fetchProductsFromFirestore();
    const firestoreProduct = firestoreProducts.find((item) => item.id === productId);

    if (firestoreProduct) {
      product = {
        id: firestoreProduct.id ?? productId,
        name: firestoreProduct.name ?? product.name,
        description: firestoreProduct.description ?? product.description,
        price: firestoreProduct.price ?? product.price,
        category: firestoreProduct.category ?? product.category,
        combinedScore: firestoreProduct.combinedScore ?? product.combinedScore,
        sentimentScore: firestoreProduct.sentimentScore ?? product.sentimentScore,
        avgRating: firestoreProduct.avgRating ?? product.avgRating,
        fakeReviewDiscount: 1.05,
        featureScores: firestoreProduct.featureScores ?? product.featureScores,
        rank: firestoreProduct.rank ?? product.rank,
        image: product.image,
      };
    }

    productReviews = (await fetchReviewsFromFirestore(productId)).map((reviewItem) => {
      const review = reviewItem as Record<string, unknown>;
      return {
        id: (review.id as string) ?? `${productId}-review`,
        productId: productId,
        userName: (review.userName as string) ?? 'Anonymous',
        text: (review.text as string) ?? 'No review text provided.',
        starRating: (review.starRating as number) ?? 5,
        sentimentLabel: (review.sentimentLabel as string) ?? 'neutral',
        sentimentScore: (review.sentimentScore as number) ?? 0,
        credibilityWeight: (review.credibilityWeight as number) ?? 0,
        isFlagged: (review.isFlagged as boolean) ?? false,
        flagReasons: (review.flagReasons as string[]) ?? [],
      };
    });
  } catch {
    productReviews = fallbackReviews.filter((review) => review.productId === product.id);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <Link href="/products" className="text-sm font-medium text-brand-700">← Back to products</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Product detail</p>
            <h1 className="mt-3 text-3xl font-semibold">{product.name}</h1>
            <p className="mt-4 text-slate-600">{product.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrustScoreBadge score={product.combinedScore} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Rating {product.avgRating}</span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">${product.price}</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {Object.entries(product.featureScores).map(([name, score]) => (
                <div key={name} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{name}</p>
                  <p className="mt-2 text-xl font-semibold">{score.toFixed(1)}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button className="rounded-full bg-slate-900 px-5 py-3 font-medium text-white">Add to cart</button>
              <button className="rounded-full border border-slate-300 px-5 py-3 font-medium text-slate-700">Save for later</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Customer reviews</h2>
              <div className="mt-4 space-y-3">
                {productReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
