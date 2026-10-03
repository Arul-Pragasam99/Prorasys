import { adminDb } from './firebase-admin';

export type ReviewCredibility = {
  userId: string;
  credibilityScore: number;
  reviewCount: number;
  accountAge: number;
  isVerified: boolean;
  flaggedReasons: string[];
};

export type ReviewAnalysis = {
  reviewId: string;
  isFake: boolean;
  confidence: number;
  reasons: string[];
  credibilityScore: number;
};

export class FakeReviewDetector {
  private readonly MIN_REVIEWS_THRESHOLD = 3;
  private readonly MAX_REVIEWS_PER_DAY = 5;
  private readonly ACCOUNT_AGE_THRESHOLD = 30; // days

  async detectFakeReviews(review: any, userId: string): Promise<ReviewAnalysis> {
    const analysis: ReviewAnalysis = {
      reviewId: review.id || 'unknown',
      isFake: false,
      confidence: 0,
      reasons: [],
      credibilityScore: 0.5,
    };

    try {
      // 1. Check user credibility
      const userCredibility = await this.getUserCredibility(userId);
      analysis.credibilityScore = userCredibility.credibilityScore;

      // 2. Analyze review content
      const contentAnalysis = this.analyzeReviewContent(review.text || '');

      // 3. Check review patterns
      const patternAnalysis = await this.checkReviewPatterns(userId);

      // 4. Calculate fake review probability
      const fakeProbability = this.calculateFakeProbability(
        userCredibility,
        contentAnalysis,
        patternAnalysis
      );

      analysis.isFake = fakeProbability > 0.6;
      analysis.confidence = fakeProbability;
      analysis.reasons = [
        ...(userCredibility.flaggedReasons || []),
        ...(contentAnalysis.flaggedReasons || []),
        ...(patternAnalysis.flaggedReasons || []),
      ];

      // If confidence is high but we have few reasons, add a generic reason
      if (analysis.isFake && analysis.reasons.length === 0) {
        analysis.reasons.push('Suspicious review pattern detected');
      }

      return analysis;
    } catch (error) {
      console.error('Fake review detection error:', error);
      throw error;
    }
  }

  private async getUserCredibility(userId: string): Promise<ReviewCredibility> {
    try {
      if (!adminDb) throw new Error('Firebase Admin is unavailable.');

      // Get user's review history
      const reviewsSnapshot = await adminDb.collection('reviews').where('userId', '==', userId).get();
      const userReviews = reviewsSnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() }));

      // Get user data
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) throw new Error('User profile not found.');
      const userData = userDoc.data() || {};

      const reviewCount = userReviews.length;
      const accountAge = this.calculateAccountAge(userData.createdAt);
      const isVerified = userData.emailVerified === true;

      let credibilityScore = 0.5;
      const flaggedReasons: string[] = [];

      // Check review frequency
      if (reviewCount > this.MAX_REVIEWS_PER_DAY * 10) {
        flaggedReasons.push('Too many reviews (potential bot)');
        credibilityScore -= 0.3;
      }

      // Check account age
      if (accountAge < this.ACCOUNT_AGE_THRESHOLD) {
        flaggedReasons.push('New account');
        credibilityScore -= 0.15;
      }

      // Check review quality
      if (reviewCount > 0) {
        const avgReviewLength = userReviews.reduce((acc: number, r: any) => acc + (r.text?.length || 0), 0) / reviewCount;
        if (avgReviewLength < 20) {
          flaggedReasons.push('Reviews too short (potential spam)');
          credibilityScore -= 0.1;
        }
      }

      // Check if all ratings are extreme
      if (reviewCount > 3) {
        const ratings = userReviews.map((r: any) => r.rating || 3);
        const uniqueRatings = new Set(ratings);
        if (uniqueRatings.size === 1 && (ratings[0] === 1 || ratings[0] === 5)) {
          flaggedReasons.push('All reviews are extreme ratings');
          credibilityScore -= 0.15;
        }
      }

      if (isVerified) {
        credibilityScore += 0.2;
      }

      // Normalize score
      credibilityScore = Math.max(0, Math.min(1, credibilityScore));

      return {
        userId,
        credibilityScore,
        reviewCount,
        accountAge,
        isVerified,
        flaggedReasons,
      };
    } catch (error) {
      console.error('Error getting user credibility:', error);
      throw error;
    }
  }

  private analyzeReviewContent(text: string) {
    const flaggedReasons: string[] = [];
    let suspiciousScore = 0;

    if (!text || text.length < 10) {
      flaggedReasons.push('Review too short');
      suspiciousScore += 0.3;
      return { suspiciousScore: Math.min(1, suspiciousScore), flaggedReasons };
    }

    const lowerText = text.toLowerCase();

    // Check for repetitive phrases
    const words = lowerText.split(' ');
    const uniqueWords = new Set(words);
    if (uniqueWords.size < words.length * 0.3 && words.length > 10) {
      flaggedReasons.push('Repetitive content');
      suspiciousScore += 0.25;
    }

    // Check for generic language
    const genericPhrases = [
      'great product', 'good quality', 'excellent service',
      'best ever', 'amazing', 'highly recommend', 'love it',
      'very good', 'nice product', 'perfect', 'awesome'
    ];
    let genericCount = 0;
    genericPhrases.forEach(p => {
      if (lowerText.includes(p)) genericCount++;
    });
    
    if (genericCount > 3) {
      flaggedReasons.push('Generic review language');
      suspiciousScore += 0.2;
    }

    // Check for excessive punctuation
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      flaggedReasons.push('Excessive punctuation (potential fake)');
      suspiciousScore += 0.15;
    }

    // Check for ALL CAPS
    const upperCount = text.split('').filter(c => c === c.toUpperCase() && c !== ' ').length;
    if (upperCount > text.length * 0.3) {
      flaggedReasons.push('Excessive capitalization');
      suspiciousScore += 0.15;
    }

    return {
      suspiciousScore: Math.min(1, suspiciousScore),
      flaggedReasons,
    };
  }

  private async checkReviewPatterns(userId: string) {
    const flaggedReasons: string[] = [];
    let suspiciousScore = 0;

    try {
      if (!adminDb) throw new Error('Firebase Admin is unavailable.');

      // Get recent reviews
      const snapshot = await adminDb.collection('reviews').where('userId', '==', userId).get();
      const userReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Check for review bombing (many reviews in short time)
      if (userReviews.length > 0) {
        // Sort by timestamp
        const sorted = userReviews.sort((a: any, b: any) => 
          new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );

        // Check if reviews are clustered
        let clusterCount = 0;
        for (let i = 1; i < sorted.length; i++) {
          const diff = new Date((sorted[i] as any).timestamp || 0).getTime() - 
                      new Date((sorted[i-1] as any).timestamp || 0).getTime();
          if (diff < 3600000) { // Within 1 hour
            clusterCount++;
          }
        }

        if (clusterCount > 3) {
          flaggedReasons.push('Review bombing detected');
          suspiciousScore += 0.3;
        }

        // Check rating pattern
        const ratings = userReviews.map((r: any) => r.rating || 3);
        if (ratings.length > 5) {
          const uniqueRatings = new Set(ratings);
          if (uniqueRatings.size === 1) {
            flaggedReasons.push('Uniform rating pattern');
            suspiciousScore += 0.2;
          }
        }
      }
    } catch (error) {
      console.error('Error checking review patterns:', error);
      throw error;
    }

    return {
      suspiciousScore: Math.min(1, suspiciousScore),
      flaggedReasons,
    };
  }

  private calculateFakeProbability(
    credibility: ReviewCredibility,
    content: any,
    pattern: any
  ): number {
    const weights = {
      credibility: 0.4,
      content: 0.35,
      pattern: 0.25,
    };

    const credibilityScore = 1 - credibility.credibilityScore;
    const contentScore = content.suspiciousScore || 0;
    const patternScore = pattern.suspiciousScore || 0;

    return (
      credibilityScore * weights.credibility +
      contentScore * weights.content +
      patternScore * weights.pattern
    );
  }

  private calculateAccountAge(createdAt: string): number {
    if (!createdAt) return 0;
    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  }

  async getReviewCredibility(reviewId: string, userId: string): Promise<number> {
    const analysis = await this.detectFakeReviews({ id: reviewId }, userId);
    return analysis.credibilityScore;
  }
}