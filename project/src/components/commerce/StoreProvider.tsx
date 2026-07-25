'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, observeAuthState } from '@/lib/auth-service';
import { loadCartSnapshot, saveCartSnapshot } from '@/lib/cart-service';
import { StoreProduct, StoreContextValue } from '@/lib/store-data';

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const [cart, setCart] = useState<StoreProduct[]>([]);
  const [wishlist, setWishlist] = useState<StoreProduct[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<StoreProduct[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (authUser) => {
      console.log('Auth state changed:', authUser);
      
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
    setCart(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
    try {
      await saveCartSnapshot(user.uid, { cart: [...cart, product], wishlist });
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    try {
      await saveCartSnapshot(user.uid, { cart: newCart, wishlist });
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToWishlist = async (product: StoreProduct) => {
    if (!user) return;
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
    try {
      await saveCartSnapshot(user.uid, { cart, wishlist: [...wishlist, product] });
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    try {
      await saveCartSnapshot(user.uid, { cart, wishlist: newWishlist });
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

  const getRecommendations = async (uid: string) => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, num_recommendations: 5 })
      });
      
      if (!response.ok) {
        console.warn('AI recommendations API returned:', response.status);
        setAiRecommendations([]);
        return;
      }
      
      const data = await response.json();
      setAiRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setAiRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);
    setWishlist([]);
    setAiRecommendations([]);
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