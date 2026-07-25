// scripts/seed-products.js
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

const realProducts = [
  {
    name: "Apple AirPods Pro 2",
    description: "Active Noise Cancellation, Transparency mode, Personalized Spatial Audio",
    price: 24999,
    category: "Electronics",
    avgRating: 4.8,
    combinedScore: 9.2,
    sentimentScore: 0.88,
    trustLevel: "high",
    reviewCount: 2345,
    featureScores: {
      sound_quality: 0.92,
      noise_cancellation: 0.90,
      comfort: 0.85
    },
    rank: 1
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "6.8 inch Dynamic AMOLED 2X, 200MP Camera, Snapdragon 8 Gen 3",
    price: 129999,
    category: "Electronics",
    avgRating: 4.9,
    combinedScore: 9.5,
    sentimentScore: 0.92,
    trustLevel: "high",
    reviewCount: 1876,
    featureScores: {
      camera: 0.95,
      display: 0.93,
      performance: 0.94
    },
    rank: 2
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancellation, 30-hour battery life, LDAC support",
    price: 29990,
    category: "Electronics",
    avgRating: 4.7,
    combinedScore: 9.0,
    sentimentScore: 0.87,
    trustLevel: "high",
    reviewCount: 1567,
    featureScores: {
      sound_quality: 0.94,
      noise_cancellation: 0.96,
      comfort: 0.92
    },
    rank: 3
  },
  {
    name: "MacBook Pro 14 inch M3 Pro",
    description: "Apple M3 Pro chip, 18GB Unified Memory, 512GB SSD, 14 inch Liquid Retina XDR display",
    price: 199900,
    category: "Electronics",
    avgRating: 4.9,
    combinedScore: 9.7,
    sentimentScore: 0.93,
    trustLevel: "high",
    reviewCount: 987,
    featureScores: {
      performance: 0.96,
      display: 0.95,
      battery: 0.92
    },
    rank: 4
  },
  {
    name: "Dyson V15 Detect Vacuum",
    description: "Intelligent laser dust detection, 60-minute runtime, HEPA filtration",
    price: 59900,
    category: "Home & Kitchen",
    avgRating: 4.6,
    combinedScore: 8.8,
    sentimentScore: 0.85,
    trustLevel: "high",
    reviewCount: 876,
    featureScores: {
      suction: 0.92,
      battery: 0.85,
      filtration: 0.90
    },
    rank: 5
  },
  {
    name: "Instant Pot Duo Plus",
    description: "9-in-1 Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer",
    price: 9999,
    category: "Home & Kitchen",
    avgRating: 4.5,
    combinedScore: 8.5,
    sentimentScore: 0.82,
    trustLevel: "high",
    reviewCount: 2345,
    featureScores: {
      versatility: 0.90,
      ease_of_use: 0.88,
      durability: 0.85
    },
    rank: 6
  },
  {
    name: "Apple Watch Series 9",
    description: "Always-On Retina display, Blood Oxygen, ECG, Temperature sensing",
    price: 41900,
    category: "Wearables",
    avgRating: 4.8,
    combinedScore: 9.1,
    sentimentScore: 0.89,
    trustLevel: "high",
    reviewCount: 1234,
    featureScores: {
      health_tracking: 0.92,
      display: 0.90,
      battery: 0.85
    },
    rank: 7
  },
  {
    name: "Samsung QN90C 65 inch Neo QLED",
    description: "4K Quantum HDR, Direct Full Array, Neo Quantum Processor, Tizen OS",
    price: 189990,
    category: "Electronics",
    avgRating: 4.7,
    combinedScore: 8.9,
    sentimentScore: 0.86,
    trustLevel: "high",
    reviewCount: 654,
    featureScores: {
      picture_quality: 0.94,
      brightness: 0.92,
      smart_tv: 0.88
    },
    rank: 8
  },
  {
    name: "Nike Air Zoom Pegasus 40",
    description: "Responsive Zoom Air units, Engineered mesh upper, Breathable",
    price: 11999,
    category: "Fashion",
    avgRating: 4.4,
    combinedScore: 8.2,
    sentimentScore: 0.80,
    trustLevel: "medium",
    reviewCount: 987,
    featureScores: {
      comfort: 0.88,
      durability: 0.85,
      breathability: 0.82
    },
    rank: 9
  },
  {
    name: "Philips Hue Smart Bulbs - 3 Pack",
    description: "Smart LED bulbs, 16 million colors, Works with Alexa/Google/Apple",
    price: 7999,
    category: "Home & Kitchen",
    avgRating: 4.3,
    combinedScore: 7.8,
    sentimentScore: 0.78,
    trustLevel: "medium",
    reviewCount: 765,
    featureScores: {
      brightness: 0.85,
      color_accuracy: 0.88,
      connectivity: 0.82
    },
    rank: 10
  },
  {
    name: "Sony Alpha 7 IV Camera",
    description: "33MP Full-Frame, 4K 60p video, Real-time Eye AF, 5-axis stabilization",
    price: 249990,
    category: "Electronics",
    avgRating: 4.9,
    combinedScore: 9.6,
    sentimentScore: 0.94,
    trustLevel: "high",
    reviewCount: 543,
    featureScores: {
      image_quality: 0.96,
      autofocus: 0.95,
      video: 0.92
    },
    rank: 11
  },
  {
    name: "The North Face Jacket",
    description: "Waterproof, Windproof, Breathable DryVent fabric, Fully sealed seams",
    price: 14999,
    category: "Fashion",
    avgRating: 4.6,
    combinedScore: 8.7,
    sentimentScore: 0.84,
    trustLevel: "high",
    reviewCount: 432,
    featureScores: {
      waterproof: 0.90,
      breathability: 0.85,
      warmth: 0.88
    },
    rank: 12
  }
];

async function seedRealProducts() {
  console.log('🌱 Seeding real products to Firestore...\n');
  
  try {
    const productsCollection = collection(db, 'products');
    let count = 0;
    
    for (const product of realProducts) {
      await addDoc(productsCollection, product);
      count++;
      console.log(`✅ [${count}/${realProducts.length}] Added: ${product.name}`);
    }
    
    console.log(`\n✨ Successfully added ${realProducts.length} real products!`);
    console.log('\n📊 Products added:');
    realProducts.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.name} - ₹${p.price.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
}

seedRealProducts();