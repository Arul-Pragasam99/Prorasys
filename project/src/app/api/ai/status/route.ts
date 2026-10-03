import { NextRequest, NextResponse } from 'next/server';
import { getAIServiceHeaders, rateLimit } from '@/lib/api-security';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/python` : 'http://localhost:8000');

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/status`, {
      headers: getAIServiceHeaders(),
      signal: AbortSignal.timeout(2000),
    });
    
    if (!response.ok) {
      throw new Error('AI service not available');
    }
    
    const data = await response.json();
    return NextResponse.json({
      ...data,
      available: true,
      modelsReady: data.ready === true,
    });
  } catch (error) {
    return NextResponse.json(
      { available: false, error: 'AI service unavailable' },
      { status: 503 }
    );
  }
}