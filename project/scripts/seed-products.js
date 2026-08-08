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
  console.error('❌ Firebase config not found!');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  {
    name: "Apple iPhone 15 Pro Max",
    description: "6.7-inch Super Retina XDR display, A17 Pro chip, 48MP main camera with 5x optical zoom, Titanium design, USB-C port, and all-day battery life.",
    price: 159900,
    category: "Electronics",
    image: "📱",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3, 200MP camera with 100x zoom, S Pen included, 5000mAh battery with 45W fast charging.",
    price: 129999,
    category: "Electronics",
    image: "📱",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancellation, 30-hour battery life, LDAC support, Multipoint connection, and ultra-comfortable design with premium sound quality.",
    price: 29990,
    category: "Audio",
    image: "🎧",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Apple MacBook Pro 14-inch M3 Pro",
    description: "Apple M3 Pro chip with 12-core CPU, 18GB unified memory, 512GB SSD, 14-inch Liquid Retina XDR display, 18-hour battery life, and 1080p FaceTime HD camera.",
    price: 199900,
    category: "Electronics",
    image: "💻",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Apple Watch Series 9",
    description: "Always-On Retina display, S9 SiP chip, Blood Oxygen sensor, ECG app, Temperature sensing, 18-hour battery life, and Water resistant to 50 meters.",
    price: 41900,
    category: "Wearables",
    image: "⌚",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Dyson V15 Detect Vacuum",
    description: "Intelligent laser dust detection, 60-minute runtime, HEPA filtration, LCD screen showing particle count, and lightweight design for easy cleaning.",
    price: 59900,
    category: "Home & Kitchen",
    image: "🧹",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Samsung QN90C 65-inch Neo QLED TV",
    description: "4K Quantum HDR, Direct Full Array, Neo Quantum Processor, Tizen OS, Gaming features (4K 144Hz), and ultra-slim design with anti-reflection screen.",
    price: 189990,
    category: "Electronics",
    image: "📺",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Nike Air Zoom Pegasus 40",
    description: "Responsive Zoom Air units, Engineered mesh upper for breathability, Durable rubber outsole, Plush foam for comfort, and sleek modern design.",
    price: 11999,
    category: "Fashion",
    image: "👟",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Instant Pot Duo Plus 9-in-1",
    description: "9-in-1 Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer, and more. Perfect for quick and healthy meals.",
    price: 9999,
    category: "Home & Kitchen",
    image: "🍳",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Sony Alpha 7 IV Camera",
    description: "33MP Full-Frame CMOS sensor, 4K 60p video, Real-time Eye AF, 5-axis in-body image stabilization, 15-stop dynamic range, and weather-sealed body.",
    price: 249990,
    category: "Electronics",
    image: "📷",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Bose QuietComfort Earbuds II",
    description: "Premium noise-cancelling earbuds with CustomTune technology, 6-hour battery life, comfortable fit, and crystal-clear audio quality for immersive sound.",
    price: 27990,
    category: "Audio",
    image: "🎵",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Philips Hue Smart Lighting Kit",
    description: "Smart LED bulbs with 16 million colors, Works with Alexa/Google/Apple Home, Hub included, Voice control, and customizable lighting scenes.",
    price: 7999,
    category: "Home & Kitchen",
    image: "💡",
    featureScores: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedProducts() {
  console.log('📦 Seeding real products...\n');
  
  try {
    const productsCollection = collection(db, 'products');
    let count = 0;
    
    for (const product of products) {
      await addDoc(productsCollection, product);
      count++;
      console.log(`✅ [${count}/${products.length}] Added: ${product.name}`);
    }
    
    console.log(`\n✅ Successfully added ${products.length} real products!`);
    console.log('\n📊 Products Summary:');
    products.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.name} - ₹${p.price.toLocaleString()}`);
    });
    console.log('\n💡 Note: All ratings will be calculated from user reviews by AI!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
}

seedProducts();