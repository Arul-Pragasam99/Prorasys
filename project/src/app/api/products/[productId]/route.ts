import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { idSchema, rateLimit, readJson, safeText } from '@/lib/api-security';

type RouteContext = {
  params: Promise<{ productId: string }>;
};

const productUpdateSchema = z.object({
  name: safeText(160).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.number().finite().min(0).max(100_000_000).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  image: z.string().url().max(2048).optional().or(z.literal('')),
}).strict();

export async function GET(_request: Request, context: RouteContext) {
  const { productId } = await context.params;
  if (!idSchema.safeParse(productId).success) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }
  return NextResponse.json({
    id: productId,
    name: 'Example product',
    description: 'Example description',
    price: 1000,
    category: 'C001',
    combinedScore: 7.2,
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  const { productId } = await context.params;
  if (!idSchema.safeParse(productId).success) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }
  const parsed = await readJson(request, productUpdateSchema);
  if (parsed.response) return parsed.response;
  return NextResponse.json({ id: productId, ...parsed.data });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  const { productId } = await context.params;
  if (!idSchema.safeParse(productId).success) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }
  return NextResponse.json({ deleted: true, id: productId });
}
  