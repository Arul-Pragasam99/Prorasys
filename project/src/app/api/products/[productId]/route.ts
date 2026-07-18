import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ productId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { productId } = await context.params;
  return NextResponse.json({
    id: productId,
    name: 'Example product',
    description: 'Example description',
    price: 1000,
    category: 'C001',
    combinedScore: 7.2,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { productId } = await context.params;
  const payload = await request.json();
  return NextResponse.json({ id: productId, ...payload });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { productId } = await context.params;
  return NextResponse.json({ deleted: true, id: productId });
}
