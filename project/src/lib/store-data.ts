import type { CartItem as CartItemType } from '@/lib/cart-service';

// Re-export CartItem type for use in other files
export type { CartItemType };

// Define StoreProduct type
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
  recommendation_score?: number;
};

// CartItem is a StoreProduct with quantity
export type CartItem = StoreProduct & {
  quantity: number;
};

// Store context value type
export type StoreContextValue = {
  user: any;
  cart: CartItem[];
  wishlist: StoreProduct[];
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string;
  login: (email: string, password: string) => Promise<any>;
  addToCart: (product: StoreProduct) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: StoreProduct) => void;
  removeFromWishlist: (productId: string) => void;
  logout: () => void;
  refreshCart?: () => Promise<void>;
  aiRecommendations?: StoreProduct[];
  loadingRecommendations?: boolean;
  getRecommendations?: () => Promise<void>;
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
    price: usdToInr(199.99),
    category: 'Electronics',
    rating: 4.8,
    badge: '⭐ Best Seller',
    color: 'from-blue-500 to-cyan-400',
    combinedScore: 9.2,
    trustLevel: 'high',
    reviewCount: 156,
    featureScores: {
      sound_quality: 0.92,
      comfort: 0.88,
      battery: 0.85,
      noise_cancellation: 0.90,
      build_quality: 0.82,
    },
    rank: 1,
  },
  // ... rest of products
];

export const initialCart: CartItem[] = [];
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

// Utility function to get product by ID
export const getProductById = (id: string): StoreProduct | undefined => {
  return featuredProducts.find(product => product.id === id);
};

// Utility function to get products by category
export const getProductsByCategory = (category: string): StoreProduct[] => {
  if (category === 'all') return featuredProducts;
  return featuredProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

// Utility function to get top rated products
export const getTopRatedProducts = (limit: number = 4): StoreProduct[] => {
  return [...featuredProducts]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
};

// Utility function to get products by price range
export const getProductsByPriceRange = (min: number, max: number): StoreProduct[] => {
  return featuredProducts.filter(product => 
    (product.price || 0) >= min && (product.price || 0) <= max
  );
};