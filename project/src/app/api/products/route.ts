import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import { authorizeRequest, rateLimit, readJson, safeText } from '@/lib/api-security';

const productSchema = z.object({
  name: safeText(160),
  description: z.string().trim().max(5000).default(''),
  price: z.number().finite().min(0).max(100_000_000),
  category: z.string().trim().min(1).max(80).default('General'),
  image: z.string().url().max(2048).optional().or(z.literal('')),
}).strict();

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  try {
    const q = query(collection(db, 'products'), orderBy('combinedScore', 'desc'));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  const authorization = await authorizeRequest(request, { adminOnly: true });
  if (authorization.response) return authorization.response;

  const parsed = await readJson(request, productSchema);
  if (parsed.response) return parsed.response;
  if (!adminDb) {
    return NextResponse.json({ error: 'Product service is unavailable.' }, { status: 503 });
  }

  try {
    const ref = await adminDb.collection('products').add({
      ...parsed.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ id: ref.id, ...parsed.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to write to Firestore' }, { status: 500 });
  }
}
