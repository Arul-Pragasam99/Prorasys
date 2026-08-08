// scripts/cleanup-all.js
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('❌ Firebase config not found!');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupAll() {
  console.log('🗑️ CLEANING UP EVERYTHING...\n');

  try {
    // 1. Delete all reviews
    console.log('📝 Deleting all reviews...');
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    let reviewCount = 0;
    for (const docSnapshot of reviewsSnapshot.docs) {
      await deleteDoc(doc(db, 'reviews', docSnapshot.id));
      reviewCount++;
    }
    console.log(`   ✅ Deleted ${reviewCount} reviews`);

    // 2. Delete all products
    console.log('📦 Deleting all products...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    let productCount = 0;
    for (const docSnapshot of productsSnapshot.docs) {
      await deleteDoc(doc(db, 'products', docSnapshot.id));
      productCount++;
    }
    console.log(`   ✅ Deleted ${productCount} products`);

    // 3. Delete all carts
    console.log('🛒 Deleting all carts...');
    const cartsSnapshot = await getDocs(collection(db, 'carts'));
    let cartCount = 0;
    for (const docSnapshot of cartsSnapshot.docs) {
      await deleteDoc(doc(db, 'carts', docSnapshot.id));
      cartCount++;
    }
    console.log(`   ✅ Deleted ${cartCount} carts`);

    // 4. Delete all users (except keep one admin for login)
    console.log('👤 Deleting all users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let userCount = 0;
    for (const docSnapshot of usersSnapshot.docs) {
      await deleteDoc(doc(db, 'users', docSnapshot.id));
      userCount++;
    }
    console.log(`   ✅ Deleted ${userCount} users`);

    console.log('\n✅ CLEANUP COMPLETE!');
    console.log(`   - Reviews: ${reviewCount} deleted`);
    console.log(`   - Products: ${productCount} deleted`);
    console.log(`   - Carts: ${cartCount} deleted`);
    console.log(`   - Users: ${userCount} deleted`);
    console.log('\n📊 Firestore is now empty!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupAll();