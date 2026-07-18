import { NextRequest, NextResponse } from 'next/server';
import { FakeReviewDetector } from '@/lib/fake-review-detection';

const fakeDetector = new FakeReviewDetector();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { review, userId } = body;

    if (!review || !userId) {
      return NextResponse.json(
        { error: 'Review and userId are required' },
        { status: 400 }
      );
    }

    // Ensure review has the required properties
    const reviewData = {
      id: review.id || 'unknown',
      text: review.text || '',
      rating: review.rating || 3,
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