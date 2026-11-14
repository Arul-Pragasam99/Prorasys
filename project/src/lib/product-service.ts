import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
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

function mapFirestoreProduct(id: string, data: FirestoreProduct): Product {
  return {
    id,
    name: data.name || 'Unnamed Product',
    description: data.description || 'No description available',
    price: data.price || 0,
    category: data.category || 'General',
    rating: data.avgRating || 4.0,
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
}

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), orderBy('combinedScore', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((productDoc) =>
      mapFirestoreProduct(productDoc.id, productDoc.data() as FirestoreProduct)
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductFromFirestore(productId: string): Promise<Product | null> {
  try {
    const snapshot = await getDoc(doc(db, 'products', productId));
    return snapshot.exists()
      ? mapFirestoreProduct(snapshot.id, snapshot.data() as FirestoreProduct)
      : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchReviewsFromFirestore(productId: string) {
  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((reviewDoc) => ({
      id: reviewDoc.id,
      ...(reviewDoc.data() as Record<string, unknown>),
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

// New function to fetch all reviews for admin
export async function fetchAllReviews() {
  try {
    const snapshot = await getDocs(collection(db, 'reviews'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}

// New function to get total count of products
export async function getTotalProducts(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.size;
  } catch (error) {
    console.error('Error counting products:', error);
    return 0;
  }
}

// New function to get total count of users
export async function getTotalUsers(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.size;
  } catch (error) {
    console.error('Error counting users:', error);
    return 0;
  }
}