// scripts/seed-users.ts
/*
import 'dotenv/config'; // loads .env / .env.local when run standalone via ts-node/tsx
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config pulled from environment (see .env / .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fail fast if any required env var is missing, instead of silently
// initializing Firebase with `undefined` values.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(
    `❌ Missing required Firebase env vars: ${missingKeys.join(', ')}\n` +
    `   Make sure .env / .env.local is present and loaded (this script uses 'dotenv/config').`
  );
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  { email: 'admin@prorasys.com', password: 'Admin@123', displayName: 'Arjun Mehta', role: 'admin' },
  { email: 'customer1@example.com', password: 'Customer@123', displayName: 'Priya Sharma', role: 'customer' },
  { email: 'customer2@example.com', password: 'Customer@123', displayName: 'Rahul Iyer', role: 'customer' },
  { email: 'test@example.com', password: 'Test@123', displayName: 'Ananya Reddy', role: 'customer' },
];

async function seedUsers() {
  console.log('🌱 Seeding users...');

  for (const user of users) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Created: ${user.email} (${user.role})`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ ${user.email} already exists`);
      } else {
        console.log(`❌ Failed: ${user.email} - ${error.message}`);
      }
    }
  }
  console.log('✨ Done!');
}

seedUsers();
*/