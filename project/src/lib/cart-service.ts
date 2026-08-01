import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StoreProduct } from '@/lib/store-data';

export type CartItem = StoreProduct & {
  quantity: number;
};

export type CartSnapshot = {
  cart: CartItem[];
  wishlist: StoreProduct[];
};

export async function saveCartSnapshot(uid: string, snapshot: CartSnapshot) {
  await setDoc(doc(db, 'carts', uid), snapshot, { merge: true });
}

export async function loadCartSnapshot(uid: string): Promise<CartSnapshot> {
  const ref = await getDoc(doc(db, 'carts', uid));
  if (!ref.exists()) {
    return { cart: [], wishlist: [] };
  }
  const data = ref.data() as CartSnapshot;
  // Ensure cart items have quantity
  return {
    cart: (data.cart || []).map(item => ({
      ...item,
      quantity: item.quantity || 1
    })),
    wishlist: data.wishlist || []
  };
}

export async function addToCartPersistence(uid: string, product: StoreProduct) {
  const current = await loadCartSnapshot(uid);
  const existingItem = current.cart.find((item) => item.id === product.id);
  
  let newCart: CartItem[];
  if (existingItem) {
    // Increase quantity if already in cart
    newCart = current.cart.map((item) =>
      item.id === product.id
        ? { ...item, quantity: (item.quantity || 1) + 1 }
        : item
    );
  } else {
    // Add new item with quantity 1
    newCart = [...current.cart, { ...product, quantity: 1 }];
  }
  
  await saveCartSnapshot(uid, { cart: newCart, wishlist: current.wishlist });
}

export async function removeFromCartPersistence(uid: string, productId: string) {
  const current = await loadCartSnapshot(uid);
  const newCart = current.cart.filter((item) => item.id !== productId);
  await saveCartSnapshot(uid, { cart: newCart, wishlist: current.wishlist });
}

export async function updateCartQuantityPersistence(uid: string, productId: string, quantity: number) {
  const current = await loadCartSnapshot(uid);
  let newCart: CartItem[];
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    newCart = current.cart.filter((item) => item.id !== productId);
  } else {
    // Update quantity
    newCart = current.cart.map((item) =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
  }
  
  await saveCartSnapshot(uid, { cart: newCart, wishlist: current.wishlist });
}

export async function addToWishlistPersistence(uid: string, product: StoreProduct) {
  const current = await loadCartSnapshot(uid);
  const newWishlist = [...current.wishlist.filter((item) => item.id !== product.id), product];
  await saveCartSnapshot(uid, { cart: current.cart, wishlist: newWishlist });
}

export async function removeFromWishlistPersistence(uid: string, productId: string) {
  const current = await loadCartSnapshot(uid);
  const newWishlist = current.wishlist.filter((item) => item.id !== productId);
  await saveCartSnapshot(uid, { cart: current.cart, wishlist: newWishlist });
}