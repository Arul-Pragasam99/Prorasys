import { NextRequest, NextResponse } from 'next/server';
import { z, type ZodType } from 'zod';

const MAX_BODY_BYTES = 64 * 1024;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
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
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return {
      data: null,
      response: NextResponse.json({ error: 'Request body is too large.' }, { status: 413 }),
    };
  }

  let body: unknown;
  try {
    body = await request.json();
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
