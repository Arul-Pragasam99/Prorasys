import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { authorizeRequest, rateLimit, readJson, safeText, idSchema } from '@/lib/api-security';

const reviewSchema = z.object({
  productId: idSchema,
  userId: idSchema,
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
  const authorization = await authorizeRequest(request, { expectedUserId: parsed.data.userId });
  if (authorization.response) return authorization.response;
  const payload = parsed.data;
  const docRef = await adminDb.collection('reviews').add({
    ...payload,
    userName: authorization.name || 'Anonymous',
    createdAt: new Date().toISOString(),
    sentimentLabel: 'neutral',
    sentimentScore: 0.5,
    credibilityWeight: 0,
    isFlagged: false,
    flagReasons: [],
  });
  return NextResponse.json({ id: docRef.id, ...payload }, { status: 201 });
}
