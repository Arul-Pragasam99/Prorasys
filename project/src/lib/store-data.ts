// Store data with INR prices

export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  price: number;        // Price in INR
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

// Helper to convert USD to INR
const usdToInr = (usd: number): number => {
  return Math.round(usd * 83);
};

export const featuredProducts: StoreProduct[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and 40-hour battery life.',
    price: usdToInr(199.99), // ₹16,599
    category: 'Electronics',
    rating: 4.8,
    badge: '⭐ Best Seller',
    color: 'from-blue-500 to-cyan-400',
    combinedScore: 9.2,
    trustLevel: 'high',
    reviewCount: 156,
    featureScores: {
      sound: 0.92,
      comfort: 0.88,
      battery: 0.85,
      noise_cancellation: 0.90,
      build_quality: 0.82,
    },
    rank: 1,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch Pro',
    description: 'Advanced health tracker with heart rate monitoring, sleep tracking, GPS, and 14-day battery life.',
    price: usdToInr(299.99), // ₹24,899
    category: 'Wearables',
    rating: 4.6,
    badge: '🔥 Trending',
    color: 'from-purple-500 to-pink-400',
    combinedScore: 8.5,
    trustLevel: 'high',
    reviewCount: 89,
    featureScores: {
      health_tracking: 0.90,
      battery: 0.78,
      display: 0.85,
      gps: 0.82,
      design: 0.80,
    },
    rank: 2,
  },
  {
    id: '3',
    name: 'Premium Wireless Earbuds',
    description: 'Compact wireless earbuds with premium sound quality and active noise cancellation.',
    price: usdToInr(89.99), // ₹7,469
    category: 'Audio',
    rating: 4.4,
    badge: '🎯 Popular',
    color: 'from-emerald-500 to-teal-400',
    combinedScore: 7.8,
    trustLevel: 'medium',
    reviewCount: 234,
    featureScores: {
      sound: 0.85,
      comfort: 0.80,
      connectivity: 0.82,
      battery: 0.70,
      noise_cancellation: 0.78,
    },
    rank: 3,
  },
  {
    id: '4',
    name: '4K Gaming Monitor 32"',
    description: 'Ultra HD 4K gaming monitor with 144Hz refresh rate and HDR support. Perfect for gaming.',
    price: usdToInr(499.99), // ₹41,499
    category: 'Electronics',
    rating: 4.7,
    badge: '🏆 Top Rated',
    color: 'from-orange-500 to-red-400',
    combinedScore: 8.8,
    trustLevel: 'high',
    reviewCount: 67,
    featureScores: {
      display: 0.92,
      refresh_rate: 0.88,
      colors: 0.85,
      build: 0.80,
      value: 0.78,
    },
    rank: 4,
  },
  {
    id: '5',
    name: 'Smart AI Speaker',
    description: 'Voice-controlled smart speaker with premium sound and built-in AI assistant.',
    price: usdToInr(129.99), // ₹10,789
    category: 'Audio',
    rating: 4.3,
    badge: '📢 Popular',
    color: 'from-amber-500 to-orange-400',
    combinedScore: 7.4,
    trustLevel: 'medium',
    reviewCount: 178,
    featureScores: {
      sound: 0.82,
      ai_features: 0.85,
      design: 0.78,
      connectivity: 0.80,
      value: 0.75,
    },
    rank: 5,
  },
  {
    id: '6',
    name: 'Ultra-Slim Laptop Pro',
    description: 'Powerful ultra-slim laptop with 16GB RAM, 512GB SSD, and 15-hour battery life.',
    price: usdToInr(899.99), // ₹74,699
    category: 'Electronics',
    rating: 4.9,
    badge: '💻 Premium',
    color: 'from-indigo-500 to-blue-400',
    combinedScore: 9.5,
    trustLevel: 'high',
    reviewCount: 45,
    featureScores: {
      performance: 0.92,
      battery: 0.88,
      display: 0.85,
      build: 0.90,
      value: 0.82,
    },
    rank: 6,
  },
  {
    id: '7',
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek and safe.',
    price: usdToInr(39.99), // ₹3,319
    category: 'Accessories',
    rating: 4.2,
    badge: '⚡ Fast Charge',
    color: 'from-green-500 to-emerald-400',
    combinedScore: 6.8,
    trustLevel: 'medium',
    reviewCount: 312,
    featureScores: {
      charging_speed: 0.80,
      design: 0.82,
      compatibility: 0.85,
      safety: 0.78,
      value: 0.85,
    },
    rank: 7,
  },
  {
    id: '8',
    name: 'Premium Yoga Mat',
    description: 'Eco-friendly, non-slip yoga mat with 6mm thickness for optimal comfort and support.',
    price: usdToInr(49.99), // ₹4,149
    category: 'Fitness',
    rating: 4.5,
    badge: '🧘 Premium',
    color: 'from-rose-500 to-pink-400',
    combinedScore: 7.9,
    trustLevel: 'high',
    reviewCount: 98,
    featureScores: {
      comfort: 0.85,
      durability: 0.82,
      grip: 0.88,
      eco_friendly: 0.90,
      value: 0.80,
    },
    rank: 8,
  },
];

export const initialCart: StoreProduct[] = [];
export const initialWishlist: StoreProduct[] = [];

// Price formatter for INR
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Alternative price formatter (simpler)
export const formatPriceSimple = (price: number): string => {
  return '₹' + price.toLocaleString('en-IN');
}; 