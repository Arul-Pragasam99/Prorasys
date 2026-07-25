// scripts/cleanup-products.js
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteDummyProducts() {
  console.log('🗑️ Deleting dummy products...\n');
  
  try {
    const productsCollection = collection(db, 'products');
    const snapshot = await getDocs(productsCollection);
    
    let deletedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const name = data.name || '';
      
      // Check if it's a dummy product
      if (name.toLowerCase().includes('demo') || 
          name.toLowerCase().includes('dummy') || 
          name.toLowerCase().includes('test')) {
        
        await deleteDoc(doc(db, 'products', docSnapshot.id));
        deletedCount++;
        console.log(`🗑️ Deleted: ${name}`);
      }
    }
    
    console.log(`\n✅ Deleted ${deletedCount} dummy products!`);
    console.log(`📊 Remaining: ${snapshot.size - deletedCount} products`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteDummyProducts();