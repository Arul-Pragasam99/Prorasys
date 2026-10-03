import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { authorizeRequest, rateLimit, readJson, safeText, idSchema } from '@/lib/api-security';

const reviewSchema = z.object({
  productId: idSchema,
  rating: z.number().int().min(1).max(5),
  text: safeText(5000),
}).strict();

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  if (!adminDb) {
    return NextResponse.json([]);
  }

  const snapshot = await adminDb.collection('reviews').orderBy('createdAt', 'desc').get();
  const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  if (!adminDb) {
    return NextResponse.json({ error: 'Firebase admin credentials not configured' }, { status: 500 });
  }

  const parsed = await readJson(request, reviewSchema);
  if (parsed.response) return parsed.response;
  const authorization = await authorizeRequest(request, { requireVerifiedEmail: true });
  if (authorization.response) return authorization.response;

  try {
    const deliveredOrders = await adminDb.collection('orders')
      .where('userId', '==', authorization.uid)
      .where('status', '==', 'delivered')
      .get();
    const hasPurchasedProduct = deliveredOrders.docs.some((order) =>
      Array.isArray(order.data().items)
        && order.data().items.some((item: { productId?: unknown }) => item.productId === parsed.data.productId)
    );

    if (!hasPurchasedProduct) {
      return NextResponse.json({ error: 'A delivered purchase is required to review this product.' }, { status: 403 });
    }

    const reviewId = createHash('sha256')
      .update(`${authorization.uid}:${parsed.data.productId}`)
      .digest('hex');
    const reviewRef = adminDb.collection('reviews').doc(reviewId);
    const productRef = adminDb.collection('products').doc(parsed.data.productId);
    const now = new Date().toISOString();
    const outcome = await adminDb.runTransaction(async (transaction) => {
      const [productSnapshot, existingReview] = await Promise.all([
        transaction.get(productRef),
        transaction.get(reviewRef),
      ]);
      if (!productSnapshot.exists) return { reason: 'product-not-found' as const };
      if (existingReview.exists) return { reason: 'already-reviewed' as const };

      const product = productSnapshot.data() || {};
      const reviewCount = Number.isSafeInteger(product.reviewCount) && product.reviewCount >= 0
        ? product.reviewCount
        : 0;
      const averageRating = typeof product.avgRating === 'number'
        && Number.isFinite(product.avgRating)
        && product.avgRating >= 0
        && product.avgRating <= 5
        ? product.avgRating
        : 0;
      const nextReviewCount = reviewCount + 1;
      const nextAverageRating = ((averageRating * reviewCount) + parsed.data.rating) / nextReviewCount;
      const reviewData = {
        productId: parsed.data.productId,
        userId: authorization.uid,
        userName: authorization.name || 'Anonymous',
        rating: parsed.data.rating,
        starRating: parsed.data.rating,
        text: parsed.data.text,
        sentimentLabel: 'neutral',
        sentimentScore: 0.5,
        credibilityWeight: 0,
        isFlagged: false,
        flagReasons: [],
        timestamp: now,
        createdAt: now,
        isVerifiedPurchase: true,
      };

      transaction.create(reviewRef, reviewData);
      transaction.update(productRef, {
        avgRating: nextAverageRating,
        reviewCount: nextReviewCount,
        updatedAt: now,
      });
      return { reason: 'created' as const, review: reviewData };
    });

    if (outcome.reason === 'product-not-found') {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    if (outcome.reason === 'already-reviewed') {
      return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 });
    }

    return NextResponse.json({ id: reviewRef.id, ...outcome.review }, { status: 201 });
  } catch (error) {
    console.error('Review creation failed:', error);
    return NextResponse.json({ error: 'Unable to create review.' }, { status: 500 });
  }
}
