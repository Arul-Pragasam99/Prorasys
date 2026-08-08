// scripts/cleanup-reviews.js
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
  console.error('❌ Firebase config not found! Make sure .env file exists.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllReviews() {
  console.log('🗑️ Deleting ALL reviews from Firestore...\n');
  
  try {
    const reviewsCollection = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsCollection);
    
    let deletedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      await deleteDoc(doc(db, 'reviews', docSnapshot.id));
      deletedCount++;
      console.log(`🗑️ Deleted review ${deletedCount}: ${data.text?.substring(0, 30) || 'No text'}...`);
    }
    
    console.log(`\n✅ Deleted ${deletedCount} reviews from Firestore!`);
    console.log(`📊 Remaining reviews: 0`);
    
  } catch (error) {
    console.error('❌ Error deleting reviews:', error);
  }
}

deleteAllReviews();