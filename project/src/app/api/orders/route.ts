import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { authorizeRequest, idSchema, rateLimit, readJson, safeText } from '@/lib/api-security';

const orderSchema = z.object({
  items: z.array(z.object({
    productId: idSchema,
    quantity: z.number().int().min(1).max(50),
  }).strict()).min(1).max(50),
  shippingAddress: z.object({
    fullName: safeText(120),
    address: safeText(500),
    city: safeText(100),
    state: safeText(100),
    pincode: z.string().trim().min(3).max(20),
    phone: z.string().trim().min(7).max(24),
  }).strict(),
}).strict();

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;

  const authorization = await authorizeRequest(request, { requireVerifiedEmail: true });
  if (authorization.response) return authorization.response;
  if (!adminDb) {
    return NextResponse.json({ error: 'Order service is unavailable.' }, { status: 503 });
  }

  const parsed = await readJson(request, orderSchema);
  if (parsed.response) return parsed.response;

  try {
    const userSnapshot = await adminDb.collection('users').doc(authorization.uid).get();
    const user = userSnapshot.data();
    if (!userSnapshot.exists || user?.role !== 'customer') {
      return NextResponse.json({ error: 'Customer account required.' }, { status: 403 });
    }

    const orderRef = adminDb.collection('orders').doc();
    const order = await adminDb.runTransaction(async (transaction) => {
      const productSnapshots = await Promise.all(parsed.data.items.map(({ productId }) =>
        transaction.get(adminDb.collection('products').doc(productId))
      ));

      if (productSnapshots.some((product) => !product.exists)) return null;

      const items = productSnapshots.map((product, index) => {
        const data = product.data();
        if (typeof data?.price !== 'number' || !Number.isFinite(data.price) || data.price < 0 || data.price > 100_000_000) {
          return null;
        }

        return {
          productId: product.id,
          productName: typeof data.name === 'string' ? data.name : 'Product',
          price: data.price,
          quantity: parsed.data.items[index].quantity,
          ...(typeof data.image === 'string' ? { image: data.image } : {}),
        };
      });

      if (items.some((item) => item === null)) return null;

      const validItems = items.filter((item) => item !== null);
      const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const taxAmount = subtotal * 0.1;
      const shippingAmount = subtotal > 10000 ? 0 : 100;
      const now = new Date().toISOString();
      const orderData = {
        userId: authorization.uid,
        userEmail: typeof user.email === 'string' ? user.email : '',
        userDisplayName: typeof user.displayName === 'string' ? user.displayName : 'Customer',
        items: validItems,
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount: subtotal + taxAmount + shippingAmount,
        status: 'pending',
        shippingAddress: parsed.data.shippingAddress,
        createdAt: now,
        updatedAt: now,
      };

      transaction.create(orderRef, orderData);
      return orderData;
    });

    if (!order) {
      return NextResponse.json({ error: 'One or more products are unavailable.' }, { status: 400 });
    }

    return NextResponse.json({ id: orderRef.id, ...order }, { status: 201 });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 500 });
  }
}