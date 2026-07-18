import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type FirestoreProduct = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  combinedScore?: number;
  avgRating?: number;
  sentimentScore?: number;
  rank?: number;
  featureScores?: Record<string, number>;
  trustLevel?: string;
  reviewCount?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  badge: string;
  color: string;
  image: string;
  combinedScore: number;
  sentimentScore: number;
  trustLevel: string;
  reviewCount: number;
  featureScores: Record<string, number>;
  rank: number;
};

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), orderBy('combinedScore', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreProduct;
      return {
        id: doc.id,
        name: data.name || 'Unnamed Product',
        description: data.description || 'No description available',
        price: data.price || 0,
        category: data.category || 'General',
        rating: data.avgRating || 4.0, // Map avgRating to rating
        badge: data.combinedScore ? `${(data.combinedScore * 100).toFixed(0)}% Trust` : 'Featured',
        color: 'from-brand-500 to-blue-500',
        image: '/placeholder.jpg',
        combinedScore: data.combinedScore || 0,
        sentimentScore: data.sentimentScore || 0,
        trustLevel: data.trustLevel || 'medium',
        reviewCount: data.reviewCount || 0,
        featureScores: data.featureScores || {},
        rank: data.rank || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchReviewsFromFirestore(productId: string) {
  try {
    const q = query(collection(db, 'reviews'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }))
      .filter((review) => {
        const reviewRecord = review as Record<string, unknown>;
        return reviewRecord.productId === productId;
      });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}