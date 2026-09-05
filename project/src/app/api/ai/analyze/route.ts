import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, readJson, safeText, idSchema } from '@/lib/api-security';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/python` : 'http://localhost:8000');

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;

  const parsed = await readJson(request, z.object({
    product_id: idSchema,
    user_id: idSchema,
    rating: z.number().int().min(1).max(5),
    text: safeText(5000),
    timestamp: z.string().datetime().optional(),
  }).strict());
  if (parsed.response) return parsed.response;

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/analyze-sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 503 }
    );
  }
}