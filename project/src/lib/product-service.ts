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
};

export async function fetchProductsFromFirestore() {
  const q = query(collection(db, 'products'), orderBy('combinedScore', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as FirestoreProduct) }));
}

export async function fetchReviewsFromFirestore(productId: string) {
  const q = query(collection(db, 'reviews'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }))
    .filter((review) => {
      const reviewRecord = review as Record<string, unknown>;
      return reviewRecord.productId === productId;
    });
}
