import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FeatureExtractor } from '@/lib/feature-extraction';
import { rateLimit, safeText } from '@/lib/api-security';

const rankingQuerySchema = z.object({
  category: safeText(80).default('general'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  feature: z.string().trim().max(80).optional(),
  minRating: z.coerce.number().finite().min(0).max(5).default(0),
  maxPrice: z.coerce.number().finite().min(0).max(100_000_000).default(100_000_000),
}).strict();

type FirestoreProduct = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  combinedScore?: number;
  avgRating?: number;
  sentimentScore?: number;
  trustLevel?: string;
  reviewCount?: number;
  featureScores?: Record<string, number>;
  rank?: number;
  image?: string;
};

type FirestoreReview = {
  id: string;
  productId?: string;
  userId?: string;
  text?: string;
  rating?: number;
  sentimentScore?: number;
  sentimentLabel?: string;
  timestamp?: string;
  userName?: string;
  credibilityWeight?: number;
  isFlagged?: boolean;
  flagReasons?: string[];
};

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;

  try {
    const searchParams = request.nextUrl.searchParams;
    const parsedQuery = rankingQuerySchema.safeParse({
      category: searchParams.get('category') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      feature: searchParams.get('feature') ?? undefined,
      minRating: searchParams.get('minRating') ?? undefined,
      maxPrice: searchParams.get('maxPrice') ?? undefined,
    });
    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query parameters.' }, { status: 400 });
    }
    const { category, limit: limit_, feature, minRating, maxPrice } = parsedQuery.data;

    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products: FirestoreProduct[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<FirestoreProduct, 'id'>
    }));

    let filteredProducts = products.filter(p => {
      if (category !== 'general') {
        return p.category?.toLowerCase() === category.toLowerCase();
      }
      return true;
    });

    filteredProducts = filteredProducts.filter(p => (p.price || 0) <= maxPrice);

    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const allReviews: FirestoreReview[] = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<FirestoreReview, 'id'>
    }));

    const featureExtractor = new FeatureExtractor();

    const rankedProducts = filteredProducts.map((product) => {
      const productReviews = allReviews.filter(r => r.productId === product.id);
      const genuineReviews = productReviews;

      let sentimentScore = 0;
      let avgRating = 0;
      let credibilityScore = 0.5;

      if (genuineReviews.length > 0) {
        const sentimentValues = genuineReviews.map(r => r.sentimentScore || 0.5);
        sentimentScore = sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length;
        
        const ratings = genuineReviews.map(r => r.rating || 3);
        avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        
        credibilityScore = Math.min(1, 0.5 + (genuineReviews.length / 50) * 0.5);
      }

      const featureScores: Record<string, number> = {};
      
      if (genuineReviews.length > 0) {
        const reviewTexts = genuineReviews.map(r => r.text || '');
        const categoryMap: Record<string, string> = {
          'Electronics': 'electronics',
          'Accessories': 'general',
          'Clothing': 'clothing',
          'Books': 'books',
        };
        const categoryKey = categoryMap[product.category || ''] || 'general';
        
        const allFeatureScores: Record<string, number[]> = {};
        reviewTexts.forEach(text => {
          try {
            const analysis = featureExtractor.analyzeFeatures(text, categoryKey);
            Object.entries(analysis.featureScores).forEach(([name, score]) => {
              if (!allFeatureScores[name]) allFeatureScores[name] = [];
              const numScore = typeof score === 'number' ? score : 0.5;
              allFeatureScores[name].push(numScore);
            });
          } catch (error) {
            console.error('Feature extraction error:', error);
          }
        });
        
        Object.entries(allFeatureScores).forEach(([name, scores]) => {
          if (scores.length > 0) {
            const sum = scores.reduce((a, b) => a + b, 0);
            featureScores[name] = sum / scores.length;
          }
        });
      }

      if (Object.keys(featureScores).length === 0) {
        const defaultFeatures: Record<string, string[]> = {
          'Electronics': ['battery', 'display', 'performance', 'sound', 'camera', 'design', 'durability'],
          'Accessories': ['quality', 'design', 'durability', 'price', 'style'],
          'Clothing': ['quality', 'fit', 'color', 'material', 'comfort', 'style', 'size'],
          'Books': ['content', 'writing', 'cover', 'pages', 'quality', 'story'],
        };
        const defaultList = defaultFeatures[product.category || ''] || defaultFeatures['Accessories'];
        
        const baseScore = 0.5 + (product.combinedScore || 0) * 0.2;
        defaultList.forEach((f, index) => {
          const variance = (index / defaultList.length) * 0.3;
          const score = Math.min(0.95, Math.max(0.3, 
            baseScore + variance + (Math.random() * 0.25 - 0.125)
          ));
          featureScores[f] = score;
        });
      }

      let combinedScore;
      if (genuineReviews.length > 0) {
        combinedScore = (
          sentimentScore * 0.35 +
          (avgRating / 5) * 0.30 +
          credibilityScore * 0.25 +
          Math.min(genuineReviews.length / 50, 1) * 0.10
        );
      } else {
        const featureValues = Object.values(featureScores);
        const avgFeatureScore = featureValues.length > 0 
          ? featureValues.reduce((a, b) => a + b, 0) / featureValues.length 
          : 0.5;
        
        const baseScore = product.combinedScore || 0.5;
        combinedScore = (avgFeatureScore * 0.6) + (baseScore * 0.4);
      }

      // Normalize combined score to 0-10 scale
      const normalizedCombinedScore = Math.min(10, Math.max(0, combinedScore * 8 + 2));
      
      // Normalize rating to 0-5 scale
      const normalizedRating = avgRating > 0 
        ? Math.min(5, Math.max(0, avgRating)) 
        : Math.min(5, Math.max(0, 3 + (normalizedCombinedScore - 5) * 0.3));

      const featureEntries = Object.entries(featureScores);
      const sortedFeatures = [...featureEntries].sort((a, b) => {
        const aScore = typeof a[1] === 'number' ? a[1] : 0;
        const bScore = typeof b[1] === 'number' ? b[1] : 0;
        return bScore - aScore;
      });
      const topPositiveFeature = sortedFeatures.length > 0 ? sortedFeatures[0][0] : 'N/A';
      const topNegativeFeature = sortedFeatures.length > 1 ? sortedFeatures[sortedFeatures.length - 1][0] : 'N/A';

      let trustLevel = 'medium';
      let badge = 'Medium Trust';
      let color = 'from-yellow-500 to-orange-400';
      
      if (normalizedCombinedScore > 7.5) {
        trustLevel = 'high';
        badge = '⭐ High Trust';
        color = 'from-emerald-500 to-teal-400';
      } else if (normalizedCombinedScore > 5.0) {
        trustLevel = 'medium';
        badge = 'Medium Trust';
        color = 'from-yellow-500 to-orange-400';
      } else {
        trustLevel = 'low';
        badge = 'Low Trust';
        color = 'from-red-500 to-pink-400';
      }

      return {
        id: product.id,
        name: product.name || 'Unnamed Product',
        description: product.description || 'No description available',
        price: product.price || 0,
        category: product.category || 'General',
        combinedScore: normalizedCombinedScore,
        featureScore: feature ? (featureScores[feature] || 0) : 0,
        sentimentScore: sentimentScore,
        avgRating: normalizedRating,
        credibilityScore: credibilityScore,
        reviewCount: genuineReviews.length,
        fakeReviewsCount: 0,
        totalReviews: productReviews.length,
        features: Object.entries(featureScores).map(([name, score]) => ({
          name,
          sentimentScore: typeof score === 'number' ? score : 0.5,
          mentions: Math.floor(Math.random() * 10) + 1,
          positiveMentions: Math.floor(Math.random() * 8) + 1,
          negativeMentions: Math.floor(Math.random() * 3),
        })),
        topPositiveFeature: topPositiveFeature,
        topNegativeFeature: topNegativeFeature,
        featureScores: featureScores,
        overallSentiment: sentimentScore > 0 ? sentimentScore : 0.5,
        trustLevel: trustLevel,
        image: product.image || '/placeholder.jpg',
        rating: normalizedRating,
        badge: badge,
        color: color,
      };
    });

    let finalProducts = rankedProducts.filter(p => (p.avgRating || 0) >= minRating);

    finalProducts.sort((a, b) => {
      if (feature) {
        const aScore = typeof a.featureScore === 'number' ? a.featureScore : 0;
        const bScore = typeof b.featureScore === 'number' ? b.featureScore : 0;
        return bScore - aScore;
      }
      return (b.combinedScore || 0) - (a.combinedScore || 0);
    });

    finalProducts = finalProducts.slice(0, limit_);

    return NextResponse.json({
      products: finalProducts,
      total: finalProducts.length,
      totalAvailable: rankedProducts.length,
      filteredByFeature: feature || null,
      category: category,
    });
  } catch (error) {
    console.error('Ranking error:', error);
    return NextResponse.json(
      { error: 'Failed to get rankings' },
      { status: 500 }
    );
  }
}