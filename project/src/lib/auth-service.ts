import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type AuthUser = {
  uid: string;
  email: string | null;
  role: 'customer' | 'admin' | 'guest';
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
};

export async function registerUser(
  email: string, 
  password: string, 
  role: 'customer' | 'admin' = 'customer',
  displayName?: string
) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && credential.user) {
      await updateProfile(credential.user, { displayName });
    }

    await sendEmailVerification(credential.user);

    const profile = {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: displayName || credential.user.displayName || 'Anonymous',
      role: role,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', credential.user.uid), profile);
    return profile;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw error;
    }
    console.error('Registration error:', error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profileRef = doc(db, 'users', credential.user.uid);
    const profile = await getDoc(profileRef);
    
    if (!profile.exists()) {
      const newProfile = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || 'Anonymous',
        role: 'customer' as 'customer',
        emailVerified: credential.user.emailVerified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(profileRef, newProfile);
      return newProfile;
    }

    const data = profile.data();
    return {
      uid: credential.user.uid,
      email: credential.user.email,
      role: (data?.role as 'customer' | 'admin' | 'guest') ?? 'customer',
      displayName: data?.displayName || credential.user.displayName || 'Anonymous',
      photoURL: data?.photoURL || credential.user.photoURL || '',
      emailVerified: credential.user.emailVerified || false,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const profileRef = doc(db, 'users', user.uid);
    const profile = await getDoc(profileRef);
    
    if (!profile.exists()) {
      const newProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        role: 'customer' as 'customer',
        emailVerified: user.emailVerified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(profileRef, newProfile);
      return newProfile;
    }

    const data = profile.data();
    return {
      uid: user.uid,
      email: user.email,
      role: (data?.role as 'customer' | 'admin' | 'guest') ?? 'customer',
      displayName: data?.displayName || user.displayName || 'Anonymous',
      photoURL: data?.photoURL || user.photoURL || '',
      emailVerified: user.emailVerified || false,
    };
  } catch (error) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw error;
    }
    console.error('Google login error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      throw new Error('Email is required');
    }

    await sendPasswordResetEmail(auth, normalizedEmail);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw error;
    }
    console.error('Password reset error:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<Omit<AuthUser, 'uid' | 'email' | 'role'>>) {
  try {
    const profileRef = doc(db, 'users', uid);
    await updateDoc(profileRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}

export async function getUserProfile(uid: string) {
  try {
    const profileRef = doc(db, 'users', uid);
    const profile = await getDoc(profileRef);
    if (profile.exists()) {
      const data = profile.data();
      return {
        uid: data.uid,
        email: data.email,
        role: data.role as 'customer' | 'admin' | 'guest',
        displayName: data.displayName,
        photoURL: data.photoURL,
        emailVerified: data.emailVerified,
      } as AuthUser;
    }
    return null;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

export function observeAuthState(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      const profileRef = doc(db, 'users', firebaseUser.uid);
      const profile = await getDoc(profileRef);
      
      if (profile.exists()) {
        const data = profile.data();
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: (data?.role as 'customer' | 'admin' | 'guest') ?? 'customer',
          displayName: data?.displayName || firebaseUser.displayName || 'Anonymous',
          photoURL: data?.photoURL || firebaseUser.photoURL || '',
          emailVerified: firebaseUser.emailVerified || false,
        });
      } else {
        const newProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Anonymous',
          role: 'customer' as 'customer',
          emailVerified: firebaseUser.emailVerified || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
        callback(newProfile);
      }
    } catch (error) {
      console.error('Auth state observer error:', error);
      callback(null);
    }
  });
}

export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(uid);
    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

export async function verifyEmail() {
  const user = auth.currentUser;
  if (user) {
    await sendEmailVerification(user);
    return { success: true };
  }
  return { success: false, error: 'No user logged in' };
}