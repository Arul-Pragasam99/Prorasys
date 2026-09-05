import { NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/python` : 'http://localhost:8000');

export async function GET() {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/status`, {
      signal: AbortSignal.timeout(2000),
    });
    
    if (!response.ok) {
      throw new Error('AI service not available');
    }
    
    const data = await response.json();
    return NextResponse.json({ ...data, available: true });
  } catch (error) {
    return NextResponse.json(
      { available: false, error: 'AI service unavailable' },
      { status: 503 }
    );
  }
}