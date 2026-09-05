import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { rateLimit, readJson, safeText, idSchema } from '@/lib/api-security';

const reviewSchema = z.object({
  productId: idSchema,
  userId: idSchema,
  userName: z.string().trim().min(1).max(120).default('Anonymous'),
  rating: z.number().int().min(1).max(5),
  text: safeText(5000),
  sentimentLabel: z.enum(['positive', 'neutral', 'negative']).default('neutral'),
  sentimentScore: z.number().min(0).max(1).default(0),
  credibilityWeight: z.number().min(0).max(1).default(0),
  isFlagged: z.boolean().default(false),
  flagReasons: z.array(z.string().trim().max(200)).max(20).default([]),
  timestamp: z.string().datetime().optional(),
}).strict();

export async function GET() {
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
  const payload = parsed.data;
  const docRef = await adminDb.collection('reviews').add({
    ...payload,
    createdAt: new Date().toISOString(),
    sentimentLabel: payload.sentimentLabel ?? 'neutral',
    sentimentScore: payload.sentimentScore ?? 0,
    credibilityWeight: payload.credibilityWeight ?? 0,
    isFlagged: payload.isFlagged ?? false,
    flagReasons: payload.flagReasons ?? [],
  });
  return NextResponse.json({ id: docRef.id, ...payload }, { status: 201 });
}
