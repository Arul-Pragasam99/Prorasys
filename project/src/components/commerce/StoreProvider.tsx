'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, observeAuthState, loginUser, logoutUser } from '@/lib/auth-service';
import { 
  loadCartSnapshot, 
  saveCartSnapshot, 
  addToCartPersistence, 
  removeFromCartPersistence,
  updateCartQuantityPersistence,
  addToWishlistPersistence,
  removeFromWishlistPersistence,
  CartItem 
} from '@/lib/cart-service';
import { StoreProduct, StoreContextValue } from '@/lib/store-data';
import { featuredProducts } from '@/lib/store-data';
import { auth } from '@/lib/firebase';

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<StoreProduct[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<StoreProduct[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);
        setUserRole(authUser.role || 'customer');
        await loadCartData(authUser.uid);
        await getRecommendations(authUser.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole('customer');
        setCart([]);
        setWishlist([]);
        setAiRecommendations([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadCartData = async (uid: string) => {
    try {
      const snapshot = await loadCartSnapshot(uid);
      setCart(snapshot.cart || []);
      setWishlist(snapshot.wishlist || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const refreshCart = async () => {
    if (user) {
      await loadCartData(user.uid);
    }
  };

  const addToCart = async (product: StoreProduct) => {
    if (!user) return;
    await addToCartPersistence(user.uid, product);
    await loadCartData(user.uid);
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    await removeFromCartPersistence(user.uid, productId);
    await loadCartData(user.uid);
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    await updateCartQuantityPersistence(user.uid, productId, quantity);
    await loadCartData(user.uid);
  };

  const addToWishlist = async (product: StoreProduct) => {
    if (!user) return;
    await addToWishlistPersistence(user.uid, product);
    await loadCartData(user.uid);
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    await removeFromWishlistPersistence(user.uid, productId);
    await loadCartData(user.uid);
  };

  const getRecommendations = async (uid: string) => {
    setLoadingRecommendations(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ user_id: uid, num_recommendations: 8 })
      });
      
      if (!response.ok) {
        console.warn('AI service unavailable, using fallback recommendations');
        const fallback = featuredProducts.slice(0, 8).map(p => ({
          ...p,
          recommendation_score: 0.7 + (Math.random() * 0.25),
        }));
        setAiRecommendations(fallback);
        return;
      }
      
      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setAiRecommendations(data.recommendations);
      } else {
        const fallback = featuredProducts.slice(0, 8).map(p => ({
          ...p,
          recommendation_score: 0.7 + (Math.random() * 0.25),
        }));
        setAiRecommendations(fallback);
      }
    } catch (error) {
      console.warn('AI service error, using fallback recommendations');
      const fallback = featuredProducts.slice(0, 8).map(p => ({
        ...p,
        recommendation_score: 0.7 + (Math.random() * 0.25),
      }));
      setAiRecommendations(fallback);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      if (result) {
        setUser({
          uid: result.uid,
          email: result.email,
          role: result.role,
          displayName: result.displayName,
          photoURL: 'photoURL' in result ? result.photoURL : undefined,
          emailVerified: result.emailVerified,
        });
        setIsAuthenticated(true);
        setUserRole(result.role || 'customer');
      }
      return result;
    } catch (error) {
      console.error('Store login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
    setUserRole('customer');
    setCart([]);
    setWishlist([]);
    setAiRecommendations([]);
  };

  const value: StoreContextValue = {
    user,
    cart,
    wishlist,
    isAuthenticated,
    isLoading,
    userRole,
    login,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist,
    logout,
    refreshCart,
    aiRecommendations,
    loadingRecommendations,
    getRecommendations: () => user ? getRecommendations(user.uid) : Promise.resolve(),
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}