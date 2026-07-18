import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  if (!adminDb) {
    return NextResponse.json([]);
  }

  const snapshot = await adminDb.collection('reviews').orderBy('createdAt', 'desc').get();
  const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Firebase admin credentials not configured' }, { status: 500 });
  }

  const payload = await request.json();
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
