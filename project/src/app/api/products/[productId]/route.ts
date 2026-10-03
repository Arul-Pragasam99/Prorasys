import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { authorizeRequest, idSchema, rateLimit, readJson, safeText } from '@/lib/api-security';

type RouteContext = {
  params: Promise<{ productId: string }>;
};

const productUpdateSchema = z.object({
  name: safeText(160).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.number().finite().min(0).max(100_000_000).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  image: z.string().url().max(2048).optional().or(z.literal('')),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one product field is required.',
});

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;

  const { productId } = await context.params;
  if (!idSchema.safeParse(productId).success) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }
  if (!adminDb) {
    return NextResponse.json({ error: 'Product service is unavailable.' }, { status: 503 });
  }

  try {
    const snapshot = await adminDb.collection('products').doc(productId).get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    console.error('Product fetch failed:', error);
    return NextResponse.json({ error: 'Unable to fetch product.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;
  const authorization = await authorizeRequest(request, { adminOnly: true });
  if (authorization.response) return authorization.response;
  if (!adminDb) {
    return NextResponse.json({ error: 'Product service is unavailable.' }, { status: 503 });
  }

  const { productId } = await context.params;
  if (!idSchema.safeParse(productId).success) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }
  const parsed = await readJson(request, productUpdateSchema);
  if (parsed.response) return parsed.response;

  try {
    const productRef = adminDb.collection('products').doc(productId);
    const snapshot = await productRef.get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    await productRef.update({ ...parsed.data, updatedAt: new Date().toISOString() });
    return NextResponse.json({ id: productId, ...snapshot.data(), ...parsed.data });
  } catch (error) {
    console.error('Product update failed:', error);
    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;
  const authorization = await authorizeRequest(request, { adminOnly: true });
  if (authorization.response) return authorization.response;
  if (!adminDb) {
    return NextResponse.json({ error: 'Product service is unavailable.' }, { status: 503 });
  }

  const { productId } = await context.params;
  if (!idSchema.safeParse(productId).success) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }
  try {
    const productRef = adminDb.collection('products').doc(productId);
    const snapshot = await productRef.get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    await productRef.delete();
    return NextResponse.json({ deleted: true, id: productId });
  } catch (error) {
    console.error('Product deletion failed:', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
  