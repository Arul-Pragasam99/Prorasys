import { NextRequest, NextResponse } from 'next/server';
import { z, type ZodType } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const MAX_BODY_BYTES = 64 * 1024;
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 5_000;

export function getClientKey(request: NextRequest): string {
  return request.headers.get('x-real-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
    || 'unknown-client';
}

export function rateLimit(
  request: NextRequest,
  limit = 30,
  windowMs = 60_000,
): NextResponse | null {
  const now = Date.now();
  const key = `${getClientKey(request)}:${request.nextUrl.pathname}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now || buckets.size >= MAX_BUCKETS) buckets.delete(bucketKey);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)) },
      },
    );
  }

  return null;
}

export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<
  { data: T; response: null } | { data: null; response: NextResponse }
> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return {
      data: null,
      response: NextResponse.json({ error: 'Content-Type must be application/json.' }, { status: 415 }),
    };
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return {
      data: null,
      response: NextResponse.json({ error: 'Request body is too large.' }, { status: 413 }),
    };
  }

  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Missing request body');

    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return {
          data: null,
          response: NextResponse.json({ error: 'Request body is too large.' }, { status: 413 }),
        };
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {
      data: null,
      response: NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null,
      response: NextResponse.json(
        { error: 'Invalid request data.', details: result.error.flatten().fieldErrors },
        { status: 400 },
      ),
    };
  }

  return { data: result.data, response: null };
}

export const safeText = (max: number) => z.string().trim().min(1).max(max);
export const idSchema = z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);

export function getAIServiceHeaders(): HeadersInit {
  const apiKey = process.env.AI_SERVICE_API_KEY;
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  };
}

export async function authorizeRequest(
  request: Request,
  options: { adminOnly?: boolean; expectedUserId?: string } = {},
): Promise<{ uid: string; name?: string; response: null } | { uid: null; name: null; response: NextResponse }> {
  if (!adminAuth) {
    return {
      uid: null,
      name: null,
      response: NextResponse.json({ error: 'Authentication is unavailable.' }, { status: 503 }),
    };
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return {
      uid: null,
      name: null,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (options.expectedUserId && decoded.uid !== options.expectedUserId) {
      return {
        uid: null,
        name: null,
        response: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }),
      };
    }

    if (options.adminOnly) {
      const user = await adminDb?.collection('users').doc(decoded.uid).get();
      if (!user?.exists || user.data()?.role !== 'admin') {
        return {
          uid: null,
          name: null,
          response: NextResponse.json({ error: 'Administrator access required.' }, { status: 403 }),
        };
      }
    }

    return { uid: decoded.uid, name: typeof decoded.name === 'string' ? decoded.name : undefined, response: null };
  } catch {
    return {
      uid: null,
      name: null,
      response: NextResponse.json({ error: 'Invalid or expired authentication token.' }, { status: 401 }),
    };
  }
}
