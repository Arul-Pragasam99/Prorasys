import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FakeReviewDetector } from '@/lib/fake-review-detection';
import { adminDb } from '@/lib/firebase-admin';
import { authorizeRequest, rateLimit, readJson, idSchema } from '@/lib/api-security';

const fakeDetector = new FakeReviewDetector();

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;

  const parsed = await readJson(request, z.object({
    userId: idSchema,
    review: z.object({
      id: idSchema.optional().default('unknown'),
      text: z.string().trim().max(5000).default(''),
      rating: z.number().int().min(1).max(5).default(3),
      timestamp: z.string().datetime().optional(),
    }).strict(),
  }).strict());
  if (parsed.response) return parsed.response;

    const authorization = await authorizeRequest(request, { adminOnly: true });
    if (authorization.response) return authorization.response;
    if (!adminDb) {
      return NextResponse.json({ error: 'Review analysis is unavailable.' }, { status: 503 });
    }

  try {
    const { review, userId } = parsed.data;

    // Ensure review has the required properties
    const reviewData = {
      id: review.id || 'unknown',
      text: review.text,
      rating: review.rating,
      timestamp: review.timestamp || new Date().toISOString(),
    };

    const analysis = await fakeDetector.detectFakeReviews(reviewData, userId);

    return NextResponse.json({
      isFake: analysis.isFake,
      confidence: analysis.confidence,
      reasons: analysis.reasons,
      credibilityScore: analysis.credibilityScore,
    });
  } catch (error) {
    console.error('Fake review detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect fake review' },
      { status: 500 }
    );
  }
}