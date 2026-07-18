'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, observeAuthState } from '@/lib/auth-service';
import { loadCartSnapshot } from '@/lib/cart-service';
import { StoreProduct, StoreContextValue } from '@/lib/store-data';

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<StoreProduct[]>([]);
  const [wishlist, setWishlist] = useState<StoreProduct[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const [aiRecommendations, setAiRecommendations] = useState<StoreProduct[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);
        setUserRole(authUser.role || 'customer');
        await loadCart();
        await getRecommendations();
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

  const loadCart = async () => {
    if (!user) return;
    try {
      const snapshot = await loadCartSnapshot(user.uid);
      setCart(snapshot.cart || []);
      setWishlist(snapshot.wishlist || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const addToCart = (product: StoreProduct) => {
    if (!user) return;
    setCart(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const addToWishlist = (product: StoreProduct) => {
    if (!user) return;
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);
    setWishlist([]);
    setAiRecommendations([]);
  };

  const getRecommendations = async () => {
    if (!user) return;
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          num_recommendations: 5
        })
      });
      const data = await response.json();
      setAiRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const value: StoreContextValue = {
    user,
    cart,
    wishlist,
    isAuthenticated,
    userRole,
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    logout,
    aiRecommendations,
    loadingRecommendations,
    getRecommendations,
    refreshCart,
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