export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  combinedScore: number;
  sentimentScore: number;
  avgRating: number;
  fakeReviewDiscount: number;
  featureScores: Record<string, number>;
  rank: number;
  image: string;
};

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
};

export const products: Product[] = [
  {
    id: '10000',
    name: 'Aurora Headphones',
    description: 'Immersive sound with noise-canceling for work and travel.',
    price: 189,
    category: 'Electronics',
    combinedScore: 8.6,
    sentimentScore: 0.91,
    avgRating: 4.8,
    fakeReviewDiscount: 1.05,
    featureScores: { sound: 4.9, comfort: 4.7, battery: 4.5 },
    rank: 1,
    image: '/images/headphones.jpg',
  },
  {
    id: '10001',
    name: 'Lumen Smart Lamp',
    description: 'Adaptive lighting that fits modern homes and study spaces.',
    price: 89,
    category: 'Home',
    combinedScore: 8.1,
    sentimentScore: 0.84,
    avgRating: 4.6,
    fakeReviewDiscount: 1.08,
    featureScores: { brightness: 4.6, style: 4.8, ease: 4.5 },
    rank: 2,
    image: '/images/lamp.jpg',
  },
  {
    id: '10002',
    name: 'Northside Backpack',
    description: 'Durable and weatherproof for daily commuting and weekend travel.',
    price: 74,
    category: 'Fashion',
    combinedScore: 7.9,
    sentimentScore: 0.78,
    avgRating: 4.7,
    fakeReviewDiscount: 1.1,
    featureScores: { durability: 4.7, comfort: 4.6, storage: 4.8 },
    rank: 3,
    image: '/images/backpack.jpg',
  },
];

export const reviews: Review[] = [
  {
    id: 'rv1',
    productId: '10000',
    userName: 'Mina',
    text: 'Excellent performance and super comfortable.',
    starRating: 5,
    sentimentLabel: 'positive',
    sentimentScore: 0.92,
    credibilityWeight: 8.1,
    isFlagged: false,
    flagReasons: [],
  },
  {
    id: 'rv2',
    productId: '10000',
    userName: 'Ravi',
    text: 'Battery lasts well, but packaging could be better.',
    starRating: 4,
    sentimentLabel: 'neutral',
    sentimentScore: 0.38,
    credibilityWeight: 7.2,
    isFlagged: false,
    flagReasons: [],
  },
  {
    id: 'rv3',
    productId: '10001',
    userName: 'Sara',
    text: 'The lighting is perfect for my desk and the app controls are easy.',
    starRating: 5,
    sentimentLabel: 'positive',
    sentimentScore: 0.89,
    credibilityWeight: 8.4,
    isFlagged: false,
    flagReasons: [],
  },
  {
    id: 'rv4',
    productId: '10002',
    userName: 'Ari',
    text: 'Great storage and sturdy material for daily use.',
    starRating: 4,
    sentimentLabel: 'positive',
    sentimentScore: 0.76,
    credibilityWeight: 7.8,
    isFlagged: false,
    flagReasons: [],
  },
];

export const recommendations = [
  { title: 'Ergonomic keyboard', reason: 'Matches your recent buying pattern' },
  { title: 'Travel charger', reason: 'Highly rated in the same category' },
  { title: 'Desk organizer', reason: 'Often paired with your current selection' },
];
