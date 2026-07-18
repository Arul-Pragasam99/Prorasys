import { Product } from './product-service';

export type Review = {
  id: string;
  productId: string;
  userName: string;
  text: string;
  starRating: number;
  sentimentLabel: string;
  sentimentScore: number;
  credibilityWeight: number;
  isFlagged: boolean;
  flagReasons: string[];
  timestamp?: string;
};

// Sample products with all required properties
export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    category: 'Electronics',
    rating: 4.8,
    badge: 'Best Seller',
    color: 'from-sky-500 to-cyan-400',
    image: '/headphones.jpg',
    combinedScore: 0.92,
    sentimentScore: 0.85,
    trustLevel: 'high',
    reviewCount: 156,
    featureScores: { sound: 4.9, comfort: 4.7, battery: 4.6 },
    rank: 1,
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracker with health monitoring',
    price: 299.99,
    category: 'Wearables',
    rating: 4.6,
    badge: 'New Arrival',
    color: 'from-purple-500 to-pink-400',
    image: '/watch.jpg',
    combinedScore: 0.85,
    sentimentScore: 0.78,
    trustLevel: 'high',
    reviewCount: 89,
    featureScores: { features: 4.8, battery: 4.2, display: 4.7 },
    rank: 2,
  },
  {
    id: '3',
    name: 'Wireless Earbuds',
    description: 'Compact earbuds with premium sound quality',
    price: 89.99,
    category: 'Audio',
    rating: 4.4,
    badge: 'Trending',
    color: 'from-emerald-500 to-teal-400',
    image: '/earbuds.jpg',
    combinedScore: 0.78,
    sentimentScore: 0.72,
    trustLevel: 'medium',
    reviewCount: 234,
    featureScores: { sound: 4.5, comfort: 4.3, connectivity: 4.4 },
    rank: 3,
  },
  {
    id: '4',
    name: 'Gaming Monitor 4K',
    description: 'Ultra HD 4K gaming monitor with 144Hz refresh rate',
    price: 499.99,
    category: 'Electronics',
    rating: 4.7,
    badge: 'Top Rated',
    color: 'from-indigo-500 to-blue-400',
    image: '/monitor.jpg',
    combinedScore: 0.88,
    sentimentScore: 0.82,
    trustLevel: 'high',
    reviewCount: 67,
    featureScores: { display: 4.9, refresh: 4.8, colors: 4.6 },
    rank: 4,
  },
  {
    id: '5',
    name: 'Smart Speaker',
    description: 'Voice-controlled smart speaker with premium sound',
    price: 129.99,
    category: 'Audio',
    rating: 4.3,
    badge: 'Popular',
    color: 'from-rose-500 to-pink-400',
    image: '/speaker.jpg',
    combinedScore: 0.74,
    sentimentScore: 0.68,
    trustLevel: 'medium',
    reviewCount: 178,
    featureScores: { sound: 4.4, smart: 4.5, design: 4.2 },
    rank: 5,
  },
];

export const reviews: Review[] = [
  {
    id: 'r1',
    productId: '1',
    userName: 'John D.',
    text: 'Absolutely amazing headphones! The sound quality is incredible and noise cancellation works perfectly. Best purchase I\'ve made this year.',
    starRating: 5,
    sentimentLabel: 'positive',
    sentimentScore: 0.95,
    credibilityWeight: 0.9,
    isFlagged: false,
    flagReasons: [],
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: 'r2',
    productId: '1',
    userName: 'Sarah M.',
    text: 'Good product but battery life could be better. Lasts about 20 hours which is less than advertised.',
    starRating: 4,
    sentimentLabel: 'neutral',
    sentimentScore: 0.65,
    credibilityWeight: 0.8,
    isFlagged: false,
    flagReasons: [],
    timestamp: '2024-01-12T14:20:00Z',
  },
  {
    id: 'r3',
    productId: '2',
    userName: 'Mike R.',
    text: 'This watch is fantastic! Tracks everything I need and the battery lasts for days. Highly recommend!',
    starRating: 5,
    sentimentLabel: 'positive',
    sentimentScore: 0.92,
    credibilityWeight: 0.85,
    isFlagged: false,
    flagReasons: [],
    timestamp: '2024-01-10T09:15:00Z',
  },
  {
    id: 'r4',
    productId: '3',
    userName: 'Emily K.',
    text: 'Decent earbuds for the price. Sound is good but connectivity drops sometimes. Overall okay.',
    starRating: 3,
    sentimentLabel: 'neutral',
    sentimentScore: 0.55,
    credibilityWeight: 0.7,
    isFlagged: false,
    flagReasons: [],
    timestamp: '2024-01-08T16:45:00Z',
  },
  {
    id: 'r5',
    productId: '4',
    userName: 'David L.',
    text: 'This monitor is a game changer! 4K resolution and 144Hz refresh rate make gaming so smooth.',
    starRating: 5,
    sentimentLabel: 'positive',
    sentimentScore: 0.93,
    credibilityWeight: 0.88,
    isFlagged: false,
    flagReasons: [],
    timestamp: '2024-01-05T11:00:00Z',
  },
];

export const recommendations = [
  {
    title: 'Premium Wireless Headphones',
    reason: 'Based on your interest in audio quality',
  },
  {
    title: 'Smart Watch Pro',
    reason: 'Popular among fitness enthusiasts like you',
  },
  {
    title: 'Gaming Monitor 4K',
    reason: 'Matches your browsing history for tech products',
  },
  {
    title: 'Wireless Earbuds',
    reason: 'Highly rated by customers who bought similar items',
  },
];