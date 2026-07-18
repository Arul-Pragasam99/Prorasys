import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Firebase admin credentials not configured' }, { status: 500 });
  }

  const payload = await request.json();
  const batch = adminDb.batch();

  for (const product of payload.products ?? []) {
    const ref = adminDb.collection('products').doc(product.id);
    batch.update(ref, {
      combinedScore: product.combinedScore,
      rank: product.rank,
      fakeReviewDiscount: product.fakeReviewDiscount ?? 0,
    });
  }

  await batch.commit();
  return NextResponse.json({ message: 'rank recalculated', products: payload.products ?? [] });
}
