// scripts/seed-users.js
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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
const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  {
    email: 'admin@prorasys.com',
    password: 'Admin@123',
    displayName: 'Admin User',
    role: 'admin'
  },
  {
    email: 'arjun.mehta@example.com',
    password: 'Customer@123',
    displayName: 'Arjun Mehta',
    role: 'customer'
  },
  {
    email: 'priya.sharma@example.com',
    password: 'Customer@123',
    displayName: 'Priya Sharma',
    role: 'customer'
  },
  {
    email: 'vikram.singh@example.com',
    password: 'Customer@123',
    displayName: 'Vikram Singh',
    role: 'customer'
  },
  {
    email: 'ananya.reddy@example.com',
    password: 'Customer@123',
    displayName: 'Ananya Reddy',
    role: 'customer'
  },
  {
    email: 'rahul.verma@example.com',
    password: 'Customer@123',
    displayName: 'Rahul Verma',
    role: 'customer'
  },
  {
    email: 'neha.patel@example.com',
    password: 'Customer@123',
    displayName: 'Neha Patel',
    role: 'customer'
  },
  {
    email: 'suresh.kumar@example.com',
    password: 'Customer@123',
    displayName: 'Suresh Kumar',
    role: 'customer'
  }
];

async function seedUsers() {
  console.log('👤 Creating users...\n');
  
  let created = 0;
  
  for (const user of users) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        emailVerified: user.role === 'admin' ? true : false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      created++;
      console.log(`✅ Created: ${user.email} (${user.role})`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ ${user.email} already exists`);
      } else {
        console.log(`❌ Failed: ${user.email} - ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Created ${created} users successfully!`);
  console.log('\n📊 Users List:');
  users.forEach(u => {
    console.log(`   ${u.email} - ${u.role}`);
  });
  console.log('\n🔑 Passwords: Admin@123 (admin), Customer@123 (customers)');
}

seedUsers();