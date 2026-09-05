import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, readJson, idSchema } from '@/lib/api-security';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;

  const parsed = await readJson(request, z.object({
    user_id: idSchema,
    num_recommendations: z.number().int().min(1).max(50).default(5),
  }).strict());
  if (parsed.response) return parsed.response;

  try {
    // Try to connect to Python AI service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Return empty recommendations instead of error
      return NextResponse.json(
        { recommendations: [], error: 'AI service unavailable' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { recommendations: [], error: 'AI service unavailable' },
      { status: 200 }
    );
  }
}