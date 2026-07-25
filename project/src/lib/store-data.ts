// Store data with INR prices (converted from USD at ₹83 per USD)

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
  return Math.round(usd * 83); // 1 USD = ₹83
};

export const featuredProducts: StoreProduct[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and 40-hour battery life. Perfect for audiophiles and professionals.',
    price: usdToInr(199.99), // ₹16,599
    category: 'Electronics',
    rating: 4.8,
    badge: '⭐ Best Seller',
    color: 'from-primary to-secondary',
    image: '/headphones.jpg',
    combinedScore: 9.2,
    trustLevel: 'high',
    reviewCount: 156,
    featureScores: {
      sound: 4.9,
      comfort: 4.7,
      battery: 4.6,
      noise_cancellation: 4.8,
      build_quality: 4.5,
    },
    rank: 1,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch Pro',
    description: 'Advanced health and fitness tracker with heart rate monitoring, sleep tracking, GPS, and 14-day battery life. Waterproof and stylish.',
    price: usdToInr(299.99), // ₹24,899
    category: 'Wearables',
    rating: 4.6,
    badge: '🔥 Trending',
    color: 'from-secondary to-accent',
    image: '/watch.jpg',
    combinedScore: 8.5,
    trustLevel: 'high',
    reviewCount: 89,
    featureScores: {
      health_tracking: 4.8,
      battery: 4.2,
      display: 4.7,
      gps: 4.5,
      design: 4.4,
    },
    rank: 2,
  },
  {
    id: '3',
    name: 'Premium Wireless Earbuds',
    description: 'Compact wireless earbuds with premium sound quality, active noise cancellation, and 8-hour playtime. Includes compact charging case.',
    price: usdToInr(89.99), // ₹7,469
    category: 'Audio',
    rating: 4.4,
    badge: '🎯 Popular',
    color: 'from-success to-primary',
    image: '/earbuds.jpg',
    combinedScore: 7.8,
    trustLevel: 'medium',
    reviewCount: 234,
    featureScores: {
      sound: 4.5,
      comfort: 4.3,
      connectivity: 4.4,
      battery: 3.8,
      noise_cancellation: 4.2,
    },
    rank: 3,
  },
  {
    id: '4',
    name: '4K Gaming Monitor 32"',
    description: 'Ultra HD 4K gaming monitor with 144Hz refresh rate, 1ms response time, and HDR support. Perfect for gamers and creative professionals.',
    price: usdToInr(499.99), // ₹41,499
    category: 'Electronics',
    rating: 4.7,
    badge: '🏆 Top Rated',
    color: 'from-accent to-warning',
    image: '/monitor.jpg',
    combinedScore: 8.8,
    trustLevel: 'high',
    reviewCount: 67,
    featureScores: {
      display: 4.9,
      refresh_rate: 4.8,
      colors: 4.6,
      build: 4.4,
      value: 4.3,
    },
    rank: 4,
  },
  {
    id: '5',
    name: 'Smart AI Speaker',
    description: 'Voice-controlled smart speaker with premium sound quality and built-in AI assistant. Control your smart home and enjoy crystal-clear audio.',
    price: usdToInr(129.99), // ₹10,789
    category: 'Audio',
    rating: 4.3,
    badge: '📢 Popular',
    color: 'from-warning to-danger',
    image: '/speaker.jpg',
    combinedScore: 7.4,
    trustLevel: 'medium',
    reviewCount: 178,
    featureScores: {
      sound: 4.4,
      ai_features: 4.5,
      design: 4.2,
      connectivity: 4.3,
      value: 4.1,
    },
    rank: 5,
  },
  {
    id: '6',
    name: 'Ultra-Slim Laptop Pro',
    description: 'Powerful ultra-slim laptop with 16GB RAM, 512GB SSD, and 15-hour battery life. Perfect for productivity and creative work.',
    price: usdToInr(899.99), // ₹74,699
    category: 'Electronics',
    rating: 4.9,
    badge: '💻 Premium',
    color: 'from-primary to-secondary',
    image: '/laptop.jpg',
    combinedScore: 9.5,
    trustLevel: 'high',
    reviewCount: 45,
    featureScores: {
      performance: 4.9,
      battery: 4.8,
      display: 4.7,
      build: 4.9,
      value: 4.5,
    },
    rank: 6,
  },
  {
    id: '7',
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and overcharge protection.',
    price: usdToInr(39.99), // ₹3,319
    category: 'Accessories',
    rating: 4.2,
    badge: '⚡ Fast Charge',
    color: 'from-success to-secondary',
    image: '/charger.jpg',
    combinedScore: 6.8,
    trustLevel: 'medium',
    reviewCount: 312,
    featureScores: {
      charging_speed: 4.3,
      design: 4.4,
      compatibility: 4.5,
      safety: 4.2,
      value: 4.6,
    },
    rank: 7,
  },
  {
    id: '8',
    name: 'Premium Yoga Mat',
    description: 'Eco-friendly, non-slip yoga mat with 6mm thickness for optimal comfort and support. Perfect for yoga, pilates, and fitness.',
    price: usdToInr(49.99), // ₹4,149
    category: 'Fitness',
    rating: 4.5,
    badge: '🧘 Premium',
    color: 'from-secondary to-primary',
    image: '/yoga-mat.jpg',
    combinedScore: 7.9,
    trustLevel: 'high',
    reviewCount: 98,
    featureScores: {
      comfort: 4.6,
      durability: 4.5,
      grip: 4.7,
      eco_friendly: 4.8,
      value: 4.4,
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