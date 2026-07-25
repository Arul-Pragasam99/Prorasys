import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StoreProduct } from '@/lib/store-data';

export type CartSnapshot = {
  cart: StoreProduct[];
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
  return (ref.data() as CartSnapshot) ?? { cart: [], wishlist: [] };
}

export async function addToCartPersistence(uid: string, product: StoreProduct) {
  const ref = doc(db, 'carts', uid);
  const current = await loadCartSnapshot(uid);
  const newCart = [...current.cart.filter((item) => item.id !== product.id), product];
  await setDoc(ref, { cart: newCart, wishlist: current.wishlist }, { merge: true });
}

export async function removeFromCartPersistence(uid: string, productId: string) {
  const current = await loadCartSnapshot(uid);
  const newCart = current.cart.filter((item) => item.id !== productId);
  await setDoc(doc(db, 'carts', uid), { cart: newCart, wishlist: current.wishlist }, { merge: true });
}

export async function addToWishlistPersistence(uid: string, product: StoreProduct) {
  const ref = doc(db, 'carts', uid);
  const current = await loadCartSnapshot(uid);
  const newWishlist = [...current.wishlist.filter((item) => item.id !== product.id), product];
  await setDoc(ref, { cart: current.cart, wishlist: newWishlist }, { merge: true });
}

export async function removeFromWishlistPersistence(uid: string, productId: string) {
  const current = await loadCartSnapshot(uid);
  const newWishlist = current.wishlist.filter((item) => item.id !== productId);
  await setDoc(doc(db, 'carts', uid), { cart: current.cart, wishlist: newWishlist }, { merge: true });
}