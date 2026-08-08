// scripts/seed-reviews.js
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, doc, updateDoc } = require('firebase/firestore');

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

// AI-like sentiment analysis function
function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'amazing', 'excellent', 'fantastic', 'awesome', 'love', 'best', 'wonderful', 'perfect', 'outstanding', 'superb', 'exceptional', 'impressive', 'brilliant', 'incredible'];
  const negativeWords = ['bad', 'terrible', 'poor', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 'disappointing', 'waste', 'useless', 'broken', 'frustrating', 'mediocre', 'inferior'];
  
  const lowerText = text.toLowerCase();
  const words = lowerText.split(' ');
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const total = positiveCount + negativeCount;
  let score = 0.5;
  
  if (total > 0) {
    score = positiveCount / total;
  }
  
  let label = 'neutral';
  if (score > 0.65) label = 'positive';
  else if (score < 0.35) label = 'negative';
  
  score = Math.max(0.1, Math.min(0.99, score));
  
  return { label, score };
}

// Product-specific review templates
const reviewTemplates = {
  "Apple iPhone 15 Pro Max": {
    positive: [
      "The iPhone 15 Pro Max is absolutely incredible! The camera is mind-blowing and the titanium finish feels premium. Best phone I've ever owned!",
      "I'm blown away by the battery life on this iPhone. Easily lasts me 2 days with heavy use. The 5x zoom is a game-changer for photography.",
      "Upgraded from iPhone 13 to 15 Pro Max and the difference is night and day! The display is gorgeous and the A17 Pro chip handles everything effortlessly.",
      "The USB-C port is finally here! Charging is so much faster now. The camera quality for videos is simply unmatched. Absolutely love it!",
      "Best iPhone yet! The Dynamic Island is actually useful and the camera zoom is incredible. Worth every single rupee."
    ],
    neutral: [
      "Good phone but not a huge leap from iPhone 14 Pro Max. It's still great but I expected more innovation.",
      "The iPhone 15 Pro Max is solid but the price is getting ridiculous. It's good but not sure if it's worth the upgrade.",
      "Decent phone overall. The camera is great but the battery life could be better. Average experience considering the price."
    ],
    negative: [
      "Very disappointed with the iPhone 15 Pro Max. The battery life is worse than my previous phone and the overheating issue is real.",
      "The phone arrived with a scratched screen. Apple's quality control seems to be slipping. Not worth the 1.6 lakh price tag.",
      "I regret buying this. The camera is good but the phone is too heavy and the edges are uncomfortably sharp."
    ]
  },
  "Samsung Galaxy S24 Ultra": {
    positive: [
      "The S24 Ultra is an absolute beast! The 200MP camera is out of this world and the S Pen is incredibly useful for editing photos.",
      "Samsung has outdone themselves with the S24 Ultra. The display is stunning and the battery easily lasts all day with heavy usage.",
      "The 100x zoom is not a gimmick! I can take photos of the moon with incredible detail. This phone is a powerhouse.",
      "Love the flat display on the S24 Ultra! No more accidental touches. The AI features are actually useful and the camera is phenomenal.",
      "Best Android phone available right now. The performance is smooth, the camera is exceptional, and the design is premium."
    ],
    neutral: [
      "The S24 Ultra is a good phone but it's very similar to the S23 Ultra. If you have last year's model, it's not worth upgrading.",
      "Solid phone but the battery life could be better. The camera is great but sometimes oversaturates colors too much.",
      "It's a good phone overall but I expected more from the AI features. They feel like gimmicks rather than useful tools."
    ],
    negative: [
      "Very disappointed with the S24 Ultra. The phone heats up quickly and the battery drains fast. Not worth the premium price.",
      "The camera is overrated. The 200MP photos look great but the processing takes forever. The phone also stutters occasionally.",
      "I regret buying this. The fingerprint sensor is unreliable and the phone is too big. Should have gone with something else."
    ]
  },
  "Sony WH-1000XM5 Headphones": {
    positive: [
      "The WH-1000XM5 are the best noise-cancelling headphones I've ever used! The sound quality is pristine and the ANC blocks everything.",
      "These headphones are incredible! The noise cancellation is on another level and the battery life is amazing. Perfect for travel.",
      "I've been using Sony headphones for years and the XM5 are the best yet. The comfort is unmatched and the audio is crystal clear.",
      "The sound quality is phenomenal! Great bass response, clear mids, and crisp highs. Best investment for music lovers.",
      "The noise cancellation on these headphones is black magic! The train noise just disappears and I can focus on my music."
    ],
    neutral: [
      "Good headphones but not a huge upgrade from XM4. They sound great but the price is quite high for a small improvement.",
      "The ANC is great but the sound quality is similar to cheaper options. Still good but not mind-blowing.",
      "Decent headphones but the fit could be better. They get uncomfortable after 2-3 hours of continuous use."
    ],
    negative: [
      "Very disappointed with the XM5. They are less portable than XM4 and the sound quality is almost identical. Not worth the upgrade price.",
      "The ANC is good but the build quality feels cheaper than the previous model. For this price, I expected better.",
      "The headphones stopped working after 3 months. The customer service was unhelpful. Very disappointing purchase."
    ]
  },
  "Apple MacBook Pro 14-inch M3 Pro": {
    positive: [
      "The M3 Pro MacBook Pro is an absolute powerhouse! The performance is incredible and the battery lasts me 2 days of heavy work.",
      "This is the best laptop I've ever used. The display is gorgeous, the speakers are amazing, and the M3 Pro chip handles everything effortlessly.",
      "The 14-inch MacBook Pro is perfect for professionals. The performance rivals desktop machines and it's so quiet I forget it's running.",
      "Finally upgraded from Intel MacBook and the difference is unbelievable! Everything is instant and the battery life is game-changing.",
      "The Liquid Retina XDR display is stunning. Video editing is a breeze and the build quality is exceptional. Worth every penny."
    ],
    neutral: [
      "Great laptop but the price is eye-watering. It's powerful but for most people, the M3 MacBook Air would be more than enough.",
      "The M3 Pro is fast but I expected a bigger leap from M2 Pro. It's still a great laptop but not a must-upgrade.",
      "Solid laptop overall but the notch on the display is annoying. Also, 18GB RAM is enough but not future-proof."
    ],
    negative: [
      "Very disappointed with the MacBook Pro M3. The machine heats up quickly and the fan noise is audible during heavy tasks.",
      "The laptop arrived with a defective keyboard. Apple's quality control seems to be slipping. Not worth the 2 lakh price tag.",
      "I regret buying this. The performance is good but the price is outrageous. I could get a better Windows laptop for half the price."
    ]
  },
  "Apple Watch Series 9": {
    positive: [
      "The Apple Watch Series 9 is the perfect smartwatch! The display is bright and the new S9 chip makes everything instant.",
      "The fitness tracking is spot-on and the blood oxygen sensor gives me peace of mind. Best health investment I've made!",
      "I love the double-tap feature on the Series 9! It's so convenient for answering calls and controlling music. Great upgrade!",
      "The ECG feature is life-saving. It detected an irregular rhythm and I was able to get medical help early. Thank you Apple!",
      "The Series 9 is beautiful and functional. The display is gorgeous and the battery easily lasts a full day with heavy use."
    ],
    neutral: [
      "Good watch but not a huge upgrade from Series 8. If you have an older model, it's worth it. Otherwise, skip it.",
      "The Apple Watch is solid but the battery life still needs improvement. It's fine but I expected more after 9 generations.",
      "Decent smartwatch but the fitness tracking is less accurate than Garmin. Still good for casual users though."
    ],
    negative: [
      "Very disappointed with the Series 9. The battery life is terrible and the watch is too expensive for what it offers.",
      "The watch stopped working after 2 weeks. Apple's quality control is slipping. Very frustrating experience.",
      "I regret buying this. The features are the same as Series 8 and the price is higher. Not worth the upgrade."
    ]
  },
  "Dyson V15 Detect Vacuum": {
    positive: [
      "The Dyson V15 Detect is an absolute game-changer! The laser dust detection is brilliant and the suction power is incredible.",
      "I can finally see all the dust I was missing! The laser detection is genius and the LCD screen showing particle count is very satisfying.",
      "This vacuum is worth every rupee! The battery lasts 60 minutes and the suction is powerful enough to clean everything. Amazing!",
      "The V15 is the best vacuum I've ever owned. The laser shows all the dust and the attachments make cleaning corners effortless.",
      "My house has never been cleaner! The Dyson V15 detects every particle and the suction power leaves floors spotless. Highly recommend!"
    ],
    neutral: [
      "Good vacuum but expensive. It cleans well but I'm not sure if the laser feature is worth the premium price.",
      "The V15 is powerful but heavy. The battery life is decent but the laser feature feels like a gimmick after a while.",
      "Decent vacuum but the price is too high. There are other options that clean just as well for half the price."
    ],
    negative: [
      "Very disappointed with the V15. The battery doesn't last the full 60 minutes and the laser detection is just a gimmick.",
      "The vacuum stopped working after 3 months. Dyson's customer service was unhelpful. Very disappointing purchase.",
      "I regret buying this. It's too expensive for what it does and the build quality is not as premium as expected."
    ]
  },
  "Samsung QN90C 65-inch Neo QLED TV": {
    positive: [
      "The QN90C is the best TV I've ever owned! The picture quality is stunning and the gaming features (4K 144Hz) are incredible.",
      "The brightness on this TV is insane! HDR content looks phenomenal and the anti-reflection screen is a game-changer for bright rooms.",
      "I upgraded from a 55-inch and the difference is amazing. The colors are vibrant and the Neo Quantum Processor upscales everything beautifully.",
      "The QN90C is a gaming dream! 4K 144Hz with FreeSync makes games look buttery smooth. Best investment for gamers.",
      "The picture quality is simply breathtaking. Samsung has outdone themselves with the Neo QLED technology. Highly recommended!"
    ],
    neutral: [
      "Great TV but overpriced. The picture quality is excellent but other brands offer similar quality for less money.",
      "The QN90C is good but I expected better black levels. Mini-LED technology is good but not as good as OLED for dark scenes.",
      "Decent TV overall but the software is slow and the remote is overcomplicated. Picture quality is good though."
    ],
    negative: [
      "Very disappointed with the QN90C. The screen has noticeable blooming and the viewing angles are terrible.",
      "The TV arrived with a dead pixel. Samsung's quality control is slipping. Not worth the 2 lakh price tag.",
      "I regret buying this. The picture is good but the software is buggy and the TV has connectivity issues."
    ]
  },
  "Nike Air Zoom Pegasus 40": {
    positive: [
      "The Pegasus 40 are the most comfortable running shoes I've ever worn! The Zoom Air units make every step feel like running on clouds.",
      "I've been a Pegasus user for years and the 40s are the best yet! The cushioning is perfect and the fit is true to size.",
      "These shoes are perfect for long runs! The foam is responsive and the upper breathes well. Highly recommend for runners.",
      "The Pegasus 40 is a fantastic shoe for daily training! The cushioning is supportive and the shoe is very lightweight.",
      "I love my Pegasus 40s! They're comfortable, stylish, and perfect for both running and everyday wear. Great value!"
    ],
    neutral: [
      "Good shoes but not as comfortable as previous versions. The cushioning is a bit harder than I expected.",
      "The Pegasus 40 are decent but overpriced. There are other running shoes that offer better comfort for less.",
      "Average running shoes. They get the job done but don't expect anything special. Good for casual runners."
    ],
    negative: [
      "Very disappointed with the Pegasus 40. The shoes started squeaking after 2 weeks and the glue on the sole is visible.",
      "The cushioning in the Pegasus 40 is terrible. My feet hurt after every run. Definitely not worth the price.",
      "I regret buying these. The shoes are narrow and uncomfortable. Should have gone with a different brand."
    ]
  },
  "Instant Pot Duo Plus 9-in-1": {
    positive: [
      "The Instant Pot Duo Plus has revolutionized my cooking! The 9-in-1 functions make meal prep so easy and fast.",
      "I can't imagine my kitchen without it! The pressure cooker function is perfect for quick meals and the slow cooker is great for stews.",
      "This Instant Pot is a life-saver! I can make rice, soup, yogurt, and more in one appliance. So versatile and easy to clean!",
      "Best kitchen gadget I've ever bought! The preset programs make cooking foolproof and the results are consistently great.",
      "The Duo Plus is amazing! It saves so much time and the one-pot meals are delicious. Highly recommend for busy families!"
    ],
    neutral: [
      "Good kitchen appliance but the learning curve is steep. It takes time to understand all the functions and settings.",
      "The Instant Pot is decent but I expected more recipes to be included. The app is useful but not comprehensive.",
      "Solid pressure cooker but the non-stick coating started peeling after 6 months. Good value for money though."
    ],
    negative: [
      "Very disappointed with the Instant Pot. The sealing ring absorbs odors and the pressure release valve is hard to clean.",
      "The pot stopped working after 4 months. The customer service was unhelpful. Very frustrating experience.",
      "I regret buying this. The product is too complicated and the recipes don't turn out as good as they claim."
    ]
  },
  "Sony Alpha 7 IV Camera": {
    positive: [
      "The Sony Alpha 7 IV is an absolute masterpiece! The 33MP sensor captures incredible detail and the autofocus is lightning fast.",
      "This is the best camera I've ever used! The 4K 60p video quality is stunning and the dynamic range is simply amazing.",
      "The A7 IV has completely transformed my photography! The colors are beautiful and the real-time tracking is magical.",
      "I'm blown away by the image quality! The low-light performance is incredible and the 15-stop dynamic range is game-changing.",
      "The Sony A7 IV is perfect for both photography and videography. The autofocus is unbeatable and the build quality is excellent."
    ],
    neutral: [
      "Great camera but the price is steep. It's excellent but for amateur photographers, the A7 III might be better value.",
      "The A7 IV is solid but the battery life could be better. The image quality is great but I expected more improvement.",
      "Good camera overall but the menu system is still confusing. The features are great but the learning curve is steep."
    ],
    negative: [
      "Very disappointed with the A7 IV. The overheating issue is real and the camera shuts down during long video shoots.",
      "The camera arrived with a faulty sensor. Sony's quality control is slipping. Not worth the 2.5 lakh price tag.",
      "I regret buying this. The camera is good but the price is outrageous. I could get a similar camera for much less."
    ]
  },
  "Bose QuietComfort Earbuds II": {
    positive: [
      "The Bose QuietComfort Earbuds II are the best noise-cancelling earbuds I've ever used! The sound quality is incredible.",
      "These earbuds are a game-changer! The ANC blocks everything and the audio quality is rich and detailed. Perfect for travel.",
      "I've tried many earbuds and these are the best by far! The fit is comfortable and the noise cancellation is unmatched.",
      "The sound quality on these is phenomenal! The bass is deep and the clarity is excellent. Best investment for music lovers.",
      "The QuietComfort Earbuds II are perfect for noisy environments! The ANC is magical and the transparency mode is very useful."
    ],
    neutral: [
      "Good earbuds but expensive. They sound great but I'm not sure if they're worth the premium price over other options.",
      "The ANC is excellent but the battery life could be better. Still, they're good earbuds for the money.",
      "Decent earbuds but the case is bulky and the earbuds are large. Good for home use but not very portable."
    ],
    negative: [
      "Very disappointed with the Bose earbuds. They fall out of my ears and the ANC doesn't work as well as advertised.",
      "The earbuds stopped connecting to my phone after 2 weeks. Bose's quality control is slipping.",
      "I regret buying these. The sound quality is average and the ANC is not as good as other brands."
    ]
  },
  "Philips Hue Smart Lighting Kit": {
    positive: [
      "The Philips Hue lights are magical! The 16 million colors transform my home and the voice control is seamless.",
      "I love my Hue lights! The scenes are beautiful and the automation with Google Home is perfect for my smart home setup.",
      "These lights are worth every rupee! The color accuracy is stunning and the app is very intuitive to use.",
      "The Hue system is amazing! I can set schedules, create scenes, and control everything from my phone. Highly recommend!",
      "My home has never looked better! The warm lighting in the evening is perfect and the bright colors are great for parties."
    ],
    neutral: [
      "Good smart lights but expensive. The quality is excellent but there are cheaper alternatives that offer similar features.",
      "The Hue system is solid but the bridge is an unnecessary extra cost. Still, the lights work well and the app is good.",
      "Decent smart lighting but the colors could be brighter. Good for ambiance but not for task lighting."
    ],
    negative: [
      "Very disappointed with the Hue lights. They frequently disconnect and the app is buggy. Not worth the price.",
      "The lights stopped responding after 3 months. Philips' customer service was unhelpful. Very frustrating experience.",
      "I regret buying these. The lights are overpriced and the features are available in cheaper alternatives."
    ]
  }
};

function generateReviewForProduct(productName, sentiment, user) {
  const templates = reviewTemplates[productName];
  if (!templates) {
    // Fallback for any product not found
    const fallbackTemplates = {
      positive: [
        `Absolutely love this product! The ${productName} exceeded all my expectations. Highly recommended!`,
        `The ${productName} is fantastic! Great quality and performance. Best purchase I've made this year.`
      ],
      neutral: [
        `The ${productName} is decent. It works as expected but nothing special. Good for casual use.`,
        `Solid product overall. The ${productName} does what it says on the box. Average experience.`
      ],
      negative: [
        `Very disappointed with the ${productName}. The quality is poor and it's not worth the money.`,
        `I regret buying the ${productName}. It broke within a week and the customer service was terrible.`
      ]
    };
    
    const options = fallbackTemplates[sentiment] || fallbackTemplates.neutral;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  const options = templates[sentiment] || templates.neutral;
  const text = options[Math.floor(Math.random() * options.length)];
  
  // Add slight variation
  const variations = ['', ' Definitely recommend!', ' Not sure about this one.', ' Would buy again!', ' Probably wouldn\'t buy again.'];
  return text + variations[Math.floor(Math.random() * variations.length)];
}

async function seedReviews() {
  console.log('🌱 Seeding realistic reviews with AI sentiment analysis...\n');
  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (users.length === 0) {
      console.error('❌ No users found! Run seed-users.js first.');
      return;
    }
    
    if (products.length === 0) {
      console.error('❌ No products found! Run seed-products.js first.');
      return;
    }
    
    console.log(`📊 Found ${users.length} users and ${products.length} products`);
    
    const reviews = [];
    const customers = users.filter(u => u.role === 'customer');
    
    // Create a map of product names to their IDs
    const productMap = {};
    products.forEach(p => {
      productMap[p.name] = p.id;
    });
    
    products.forEach((product) => {
      // Each product gets 2-4 reviews
      const numReviews = 2 + Math.floor(Math.random() * 3);
      
      const shuffledCustomers = [...customers].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numReviews && i < shuffledCustomers.length; i++) {
        const user = shuffledCustomers[i];
        
        // Random rating with realistic distribution
        const ratings = [5, 5, 4, 4, 3, 5, 4, 5, 3, 4, 5, 5];
        const rating = ratings[Math.floor(Math.random() * ratings.length)];
        
        let sentiment;
        if (rating >= 4) sentiment = 'positive';
        else if (rating === 3) sentiment = 'neutral';
        else sentiment = 'negative';
        
        const text = generateReviewForProduct(product.name, sentiment, user);
        
        const aiAnalysis = analyzeSentiment(text);
        
        const sentimentScore = (rating / 5 * 0.6) + (aiAnalysis.score * 0.4);
        
        reviews.push({
          productId: product.id,
          userId: user.id,
          rating: rating,
          text: text,
          sentimentLabel: aiAnalysis.label,
          sentimentScore: sentimentScore,
          combinedScore: (rating / 5 * 0.5) + (sentimentScore * 0.5),
          isFlagged: false,
          flagReasons: [],
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          productName: product.name,
          userName: user.displayName || 'Anonymous',
          userEmail: user.email || ''
        });
      }
    });
    
    const reviewsCollection = collection(db, 'reviews');
    let count = 0;
    
    for (const review of reviews) {
      await addDoc(reviewsCollection, review);
      count++;
      console.log(`✅ [${count}/${reviews.length}] Review added for: ${review.productName} by ${review.userName}`);
    }
    
    // Update product ratings based on reviews
    console.log('\n🔄 Updating product ratings with AI calculations...');
    
    for (const product of products) {
      const productReviews = reviews.filter(r => r.productId === product.id);
      
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        const avgSentiment = productReviews.reduce((sum, r) => sum + r.sentimentScore, 0) / productReviews.length;
        const combinedScore = (avgRating / 5 * 0.5) + (avgSentiment * 0.5);
        
        let trustLevel = 'medium';
        if (combinedScore > 0.75) trustLevel = 'high';
        else if (combinedScore < 0.35) trustLevel = 'low';
        
        const featureScores = {};
        const features = ['quality', 'performance', 'design', 'battery', 'sound', 'display', 'camera', 'comfort', 'value'];
        productReviews.forEach(r => {
          const text = r.text.toLowerCase();
          features.forEach(f => {
            if (text.includes(f)) {
              if (!featureScores[f]) featureScores[f] = [];
              featureScores[f].push(r.rating / 5);
            }
          });
        });
        
        const avgFeatureScores = {};
        Object.keys(featureScores).forEach(f => {
          avgFeatureScores[f] = featureScores[f].reduce((a, b) => a + b, 0) / featureScores[f].length;
        });
        
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, {
          avgRating: avgRating,
          combinedScore: combinedScore * 10,
          sentimentScore: avgSentiment,
          trustLevel: trustLevel,
          reviewCount: productReviews.length,
          featureScores: avgFeatureScores,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`📊 Updated: ${product.name} - Rating: ${avgRating.toFixed(1)}★, Trust: ${trustLevel}, Reviews: ${productReviews.length}`);
      }
    }
    
    console.log(`\n✅ Successfully added ${reviews.length} reviews!`);
    console.log('\n📊 Review Summary:');
    console.log(`   Total Reviews: ${reviews.length}`);
    console.log(`   Positive: ${reviews.filter(r => r.sentimentLabel === 'positive').length}`);
    console.log(`   Neutral: ${reviews.filter(r => r.sentimentLabel === 'neutral').length}`);
    console.log(`   Negative: ${reviews.filter(r => r.sentimentLabel === 'negative').length}`);
    console.log(`   Avg Rating: ${(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)}★`);
    
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
  }
}

seedReviews();