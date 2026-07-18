export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  badge: string;
  color: string;
  image?: string;
  combinedScore?: number;
  sentimentScore?: number;
  trustLevel?: string;
  reviewCount?: number;
  featureScores?: Record<string, number>;
  rank?: number;
};

export const featuredProducts: StoreProduct[] = [
  {
    id: '1',
    name: 'Premium Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    category: 'Electronics',
    rating: 4.8,
    badge: 'Best Seller',
    color: 'from-sky-500 to-cyan-400',
    image: '/headphones.jpg',
    combinedScore: 0.92,
    trustLevel: 'high',
    reviewCount: 156,
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
    trustLevel: 'high',
    reviewCount: 89,
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
    trustLevel: 'medium',
    reviewCount: 234,
  },
];

export type StoreContextValue = {
  user: any;
  cart: StoreProduct[];
  wishlist: StoreProduct[];
  isAuthenticated: boolean;
  userRole: string;
  addToCart: (product: StoreProduct) => void;
  removeFromCart: (productId: string) => void;
  addToWishlist: (product: StoreProduct) => void;
  removeFromWishlist: (productId: string) => void;
  logout: () => void;
  aiRecommendations?: StoreProduct[];
  loadingRecommendations?: boolean;
  getRecommendations?: () => Promise<void>;
  refreshCart?: () => Promise<void>;
};