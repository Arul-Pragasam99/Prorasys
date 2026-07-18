'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { StoreProduct } from '@/lib/store-data';
import {
  addToCartPersistence,
  addToWishlistPersistence,
  loadCartSnapshot,
  removeFromCartPersistence,
  removeFromWishlistPersistence,
  saveCartSnapshot,
} from '@/lib/cart-service';
import { loginUser, logoutUser, observeAuthState, type AuthUser } from '@/lib/auth-service';

type UserRole = 'guest' | 'customer' | 'admin';

type StoreContextValue = {
  cart: StoreProduct[];
  wishlist: StoreProduct[];
  isAuthenticated: boolean;
  userRole: UserRole;
  addToCart: (product: StoreProduct) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  addToWishlist: (product: StoreProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<StoreProduct[]>([]);
  const [wishlist, setWishlist] = useState<StoreProduct[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      setAuthUser(user);
      if (!user) {
        setIsAuthenticated(false);
        setUserRole('guest');
        setCart([]);
        setWishlist([]);
        return;
      }

      setIsAuthenticated(true);
      setUserRole((user.role ?? 'customer') as UserRole);
      const snapshot = await loadCartSnapshot(user.uid);
      setCart(snapshot.cart);
      setWishlist(snapshot.wishlist);
    });

    return () => unsubscribe();
  }, []);

  const syncSnapshot = async (nextCart: StoreProduct[], nextWishlist: StoreProduct[]) => {
    if (!authUser?.uid) {
      return;
    }
    setCart(nextCart);
    setWishlist(nextWishlist);
    await saveCartSnapshot(authUser.uid, { cart: nextCart, wishlist: nextWishlist });
  };

  const addToCart = async (product: StoreProduct) => {
    if (!authUser?.uid) {
      setCart((current) => (current.some((item) => item.id === product.id) ? current : [...current, product]));
      return;
    }
    const nextCart = cart.some((item) => item.id === product.id) ? cart : [...cart, product];
    await addToCartPersistence(authUser.uid, product);
    setCart(nextCart);
  };

  const removeFromCart = async (productId: string) => {
    if (!authUser?.uid) {
      setCart((current) => current.filter((item) => item.id !== productId));
      return;
    }
    const nextCart = cart.filter((item) => item.id !== productId);
    await removeFromCartPersistence(authUser.uid, productId);
    setCart(nextCart);
  };

  const addToWishlist = async (product: StoreProduct) => {
    if (!authUser?.uid) {
      setWishlist((current) => (current.some((item) => item.id === product.id) ? current : [...current, product]));
      return;
    }
    const nextWishlist = wishlist.some((item) => item.id === product.id) ? wishlist : [...wishlist, product];
    await addToWishlistPersistence(authUser.uid, product);
    setWishlist(nextWishlist);
  };

  const removeFromWishlist = async (productId: string) => {
    if (!authUser?.uid) {
      setWishlist((current) => current.filter((item) => item.id !== productId));
      return;
    }
    const nextWishlist = wishlist.filter((item) => item.id !== productId);
    await removeFromWishlistPersistence(authUser.uid, productId);
    setWishlist(nextWishlist);
  };

  const login = async (email: string, password: string) => {
    const user = await loginUser(email, password);
    setAuthUser(user);
    setIsAuthenticated(true);
    setUserRole((user.role ?? 'customer') as UserRole);
    const snapshot = await loadCartSnapshot(user.uid);
    setCart(snapshot.cart);
    setWishlist(snapshot.wishlist);
  };

  const logout = async () => {
    await logoutUser();
    setAuthUser(null);
    setIsAuthenticated(false);
    setUserRole('guest');
    setCart([]);
    setWishlist([]);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        isAuthenticated,
        userRole,
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        login,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return context;
}
