import Link from 'next/link';
import { ReviewCard } from '@/components/ReviewCard';
import { TrustScoreBadge } from '@/components/TrustScoreBadge';
import { products as fallbackProducts, reviews as fallbackReviews } from '@/lib/mock-data';
import { Header } from '@/components/commerce/Header';
import { fetchProductsFromFirestore, fetchReviewsFromFirestore, Product } from '@/lib/product-service';
import { AIRecommendations } from '@/components/AIRecommendations';
import { ProductActions } from '@/components/ProductActions';
import { StoreProduct } from '@/lib/store-data';

// Convert Product to StoreProduct with safe defaults
function toStoreProduct(product: Product): StoreProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    rating: product.rating || 4.0,
    badge: product.badge || 'Featured',
    color: product.color || 'from-brand-500 to-blue-500',
    image: product.image || '/placeholder.jpg',
    combinedScore: product.combinedScore || 0,
    sentimentScore: product.sentimentScore || 0,
    trustLevel: product.trustLevel || 'medium',
    reviewCount: product.reviewCount || 0,
    featureScores: product.featureScores || {},
    rank: product.rank || 0,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;

  let product: Product = fallbackProducts.find((item) => item.id === productId) ?? fallbackProducts[0];
  let productReviews = fallbackReviews.filter((review) => review.productId === product.id);

  try {
    const firestoreProducts = await fetchProductsFromFirestore();
    const firestoreProduct = firestoreProducts.find((item) => item.id === productId);

    if (firestoreProduct) {
      product = {
        id: firestoreProduct.id,
        name: firestoreProduct.name,
        description: firestoreProduct.description,
        price: firestoreProduct.price,
        category: firestoreProduct.category,
        rating: firestoreProduct.rating,
        badge: firestoreProduct.badge,
        color: firestoreProduct.color,
        image: firestoreProduct.image,
        combinedScore: firestoreProduct.combinedScore,
        sentimentScore: firestoreProduct.sentimentScore,
        trustLevel: firestoreProduct.trustLevel,
        reviewCount: firestoreProduct.reviewCount,
        featureScores: firestoreProduct.featureScores,
        rank: firestoreProduct.rank,
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
        timestamp: (review.timestamp as string) ?? new Date().toISOString(),
      };
    });
  } catch {
    productReviews = fallbackReviews.filter((review) => review.productId === product.id);
  }

  const getTrustColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const storeProduct = toStoreProduct(product);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <Link href="/products" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to products
        </Link>
        
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
              Product detail
            </p>
            
            <h1 className="mt-3 text-3xl font-semibold">{product.name}</h1>
            
            <p className="mt-4 text-slate-600">{product.description}</p>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <TrustScoreBadge score={product.combinedScore || 0} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                ⭐ {product.rating?.toFixed(1) || 'N/A'} / 5
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                ${product.price?.toFixed(2)}
              </span>
              {product.trustLevel && (
                <span className={`rounded-full px-3 py-1 text-sm font-medium border ${getTrustColor(product.trustLevel)}`}>
                  🛡️ {product.trustLevel.charAt(0).toUpperCase() + product.trustLevel.slice(1)} Trust
                </span>
              )}
              {product.reviewCount !== undefined && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                  📝 {product.reviewCount} reviews
                </span>
              )}
            </div>

            {product.featureScores && Object.keys(product.featureScores).length > 0 && (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {Object.entries(product.featureScores).map(([name, score]) => (
                  <div key={name} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500 capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="mt-2 text-xl font-semibold">{score.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            )}

            <ProductActions productId={product.id} product={storeProduct} />
            <AIRecommendations productId={product.id} />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Customer Reviews</h2>
                <span className="text-sm text-slate-500">{productReviews.length} reviews</span>
              </div>
              
              {productReviews.length === 0 ? (
                <div className="mt-4 text-center py-8 text-slate-500">
                  <p>No reviews yet</p>
                  <p className="text-sm mt-2">Be the first to review this product!</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {productReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}