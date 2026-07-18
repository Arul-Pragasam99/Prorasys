import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type AuthUser = {
  uid: string;
  email: string | null;
  role: 'customer' | 'admin' | 'guest';
};

export async function registerUser(email: string, password: string, role: 'customer' | 'admin' = 'customer') {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile = {
    uid: credential.user.uid,
    email: credential.user.email,
    role,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', credential.user.uid), profile);
  return profile;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profileRef = doc(db, 'users', credential.user.uid);
  const profile = await getDoc(profileRef);
  return {
    uid: credential.user.uid,
    email: credential.user.email,
    role: (profile.data()?.role as AuthUser['role']) ?? 'customer',
  } satisfies AuthUser;
}

export async function logoutUser() {
  await signOut(auth);
}

export function observeAuthState(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profile = await getDoc(profileRef);
    callback({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: (profile.data()?.role as AuthUser['role']) ?? 'customer',
    });
  });
}
