import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ProductDetail } from '@/components/ProductDetail';
import { fetchProductsFromFirestore, fetchReviewsFromFirestore } from '@/lib/product-service';
import { products as fallbackProducts, reviews as fallbackReviews } from '@/lib/mock-data';

interface PageParams {
  params: Promise<{ productId: string }>;
}

async function getProductData(productId: string) {
  let product = fallbackProducts.find((p) => p.id === productId) ?? fallbackProducts[0];
  let productReviews = fallbackReviews.filter((r) => r.productId === product.id);

  try {
    const firestoreProducts = await fetchProductsFromFirestore();
    const firestoreProduct = firestoreProducts.find((p) => p.id === productId);

    if (firestoreProduct) {
      product = {
        id: firestoreProduct.id ?? productId,
        name: firestoreProduct.name ?? product.name,
        description: firestoreProduct.description ?? product.description,
        price: firestoreProduct.price ?? product.price,
        category: firestoreProduct.category ?? product.category,
        rating: firestoreProduct.avgRating ?? product.rating,
        badge: product.badge || 'Featured',
        color: product.color || 'from-brand-500 to-blue-500',
        image: product.image,
        combinedScore: firestoreProduct.combinedScore ?? product.combinedScore,
        sentimentScore: firestoreProduct.sentimentScore ?? product.sentimentScore,
        trustLevel: firestoreProduct.trustLevel ?? 'medium',
        reviewCount: firestoreProduct.reviewCount ?? 0,
        featureScores: firestoreProduct.featureScores ?? product.featureScores,
        rank: firestoreProduct.rank ?? product.rank,
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
        isVerifiedPurchase: (review.isVerifiedPurchase as boolean) ?? false,
      };
    });
  } catch {
    productReviews = fallbackReviews.filter((r) => r.productId === product.id);
  }

  return { product, reviews: productReviews };
}

export default async function ProductDetailPage({ params }: PageParams) {
  const { productId } = await params;
  const { product, reviews } = await getProductData(productId);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
        <ProductDetail product={product} reviews={reviews} />
      </Suspense>
    </main>
  );
}