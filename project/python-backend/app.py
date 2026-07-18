from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='ignore')

# Import AI models
from models.sentiment_model import SentimentAnalyzer
from models.recommendation_model import RecommendationEngine
from models.trust_model import TrustScoreCalculator

load_dotenv()

app = FastAPI(title="Prorasys AI Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin - Using service-account.json file
def init_firebase():
    try:
        # Try using service-account.json file
        if os.path.exists('service-account.json'):
            cred = credentials.Certificate('service-account.json')
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase connected using service-account.json")
            return firestore.client()
        else:
            print("[WARN] service-account.json not found - using mock data")
            return None
    except Exception as e:
        print(f"[ERROR] Firebase connection failed: {e}")
        print("[WARN] Using mock data (AI features will work with sample data)")
        return None

db = init_firebase()

# Initialize AI Models
sentiment_analyzer = SentimentAnalyzer()
recommendation_engine = RecommendationEngine()
trust_calculator = TrustScoreCalculator()

# Pydantic Models
class ReviewData(BaseModel):
    product_id: str
    user_id: str
    rating: int
    text: str
    timestamp: Optional[str] = None

class RecommendationRequest(BaseModel):
    user_id: str
    num_recommendations: int = 5

# API Endpoints

@app.get("/")
def read_root():
    return {
        "status": "healthy", 
        "service": "Prorasys AI",
        "firebase": "connected" if db else "not connected (using mock data)"
    }

@app.get("/api/ai/status")
async def ai_status():
    """Check AI service status"""
    try:
        return {
            "status": "running",
            "models": {
                "sentiment": sentiment_analyzer.model is not None,
                "recommendation": recommendation_engine.model is not None,
                "trust": trust_calculator.model is not None
            },
            "firebase": db is not None,
            "message": "AI service is running"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@app.post("/api/ai/analyze-sentiment")
async def analyze_sentiment(review: ReviewData):
    """Analyze sentiment using local model"""
    try:
        # Get sentiment score using local model
        sentiment_result = sentiment_analyzer.analyze(review.text)
        
        # Calculate combined score
        rating_score = review.rating / 5.0
        sentiment_score = sentiment_result['score']
        combined_score = (sentiment_score + rating_score) / 2
        
        # Save to Firestore if connected
        if db:
            review_ref = db.collection('reviews').document()
            review_ref.set({
                'productId': review.product_id,
                'userId': review.user_id,
                'rating': review.rating,
                'text': review.text,
                'sentimentScore': sentiment_score,
                'combinedScore': combined_score,
                'sentimentLabel': sentiment_result['label'],
                'timestamp': review.timestamp or datetime.now().isoformat()
            })
            print(f"[OK] Review saved to Firestore: {review.product_id}")
        else:
            print(f"[INFO] Review saved locally (mock mode): {review.product_id}")
        
        return {
            'sentiment': sentiment_result['label'],
            'sentimentScore': sentiment_score,
            'ratingScore': rating_score,
            'combinedScore': combined_score,
            'savedToFirebase': db is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized recommendations"""
    try:
        # Get all products (from Firestore or mock)
        product_data = []
        if db:
            try:
                products = db.collection('products').stream()
                for product in products:
                    prod_data = product.to_dict()
                    prod_data['id'] = product.id
                    product_data.append(prod_data)
                print(f"[OK] Loaded {len(product_data)} products from Firestore")
            except Exception as e:
                print(f"[WARN] Error loading products from Firestore: {e}")
                product_data = get_mock_products()
        else:
            product_data = get_mock_products()
        
        # Get user interactions from cart
        user_interactions = []
        if db:
            try:
                cart_ref = db.collection('carts').document(request.user_id)
                cart_data = cart_ref.get()
                if cart_data.exists:
                    cart = cart_data.to_dict()
                    user_interactions = cart.get('cart', [])
            except Exception as e:
                print(f"[WARN] Error loading cart: {e}")
        
        # Get recommendations
        recommendations = recommendation_engine.get_recommendations(
            user_id=request.user_id,
            all_products=product_data,
            user_interactions=user_interactions,
            num_recommendations=request.num_recommendations
        )
        
        return {
            'recommendations': recommendations,
            'total_products': len(product_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/trust-score/{product_id}")
async def calculate_trust_score(product_id: str):
    """Calculate trust score"""
    try:
        # Get reviews for product
        review_data = []
        if db:
            try:
                reviews = db.collection('reviews').where('productId', '==', product_id).stream()
                for review in reviews:
                    data = review.to_dict()
                    review_data.append(data)
                print(f"[OK] Loaded {len(review_data)} reviews from Firestore")
            except Exception as e:
                print(f"[WARN] Error loading reviews: {e}")
                review_data = get_mock_reviews()
        else:
            review_data = get_mock_reviews()
        
        # Calculate trust score
        trust_result = trust_calculator.calculate(review_data)
        
        # Update product if connected
        if db and review_data:
            try:
                product_ref = db.collection('products').document(product_id)
                product_ref.update({
                    'combinedScore': trust_result['trustScore'],
                    'avgRating': trust_result['avgRating'],
                    'sentimentScore': trust_result['sentimentScore'],
                    'reviewCount': trust_result['reviewCount'],
                    'trustLevel': trust_result['trustLevel']
                })
                print(f"[OK] Product {product_id} updated in Firestore")
            except Exception as e:
                print(f"[WARN] Error updating product: {e}")
        
        return {
            **trust_result,
            'productId': product_id,
            'updatedInFirebase': db is not None and bool(review_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/train")
async def train_models():
    """Train all AI models with existing data"""
    try:
        # Get all reviews
        review_data = []
        if db:
            try:
                reviews = db.collection('reviews').stream()
                for review in reviews:
                    data = review.to_dict()
                    data['id'] = review.id
                    review_data.append(data)
                print(f"[INFO] Loaded {len(review_data)} reviews from Firestore")
            except Exception as e:
                print(f"[WARN] Error loading reviews: {e}")
                review_data = get_mock_reviews()
        else:
            review_data = get_mock_reviews()
            print(f"[INFO] Using {len(review_data)} mock reviews for training")
        
        if not review_data:
            return {"status": "warning", "message": "No training data available"}
        
        # Train models
        print(f"[INFO] Training models with {len(review_data)} reviews...")
        sentiment_analyzer.train(review_data)
        recommendation_engine.train(review_data)
        trust_calculator.train(review_data)
        
        return {
            "status": "success", 
            "message": "Models trained successfully",
            "reviews_used": len(review_data)
        }
    except Exception as e:
        print(f"[ERROR] Training error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions for mock data
def get_mock_products():
    return [
        {'id': '1', 'name': 'Product 1', 'combinedScore': 0.8, 'price': 100, 'category': 'Electronics'},
        {'id': '2', 'name': 'Product 2', 'combinedScore': 0.7, 'price': 50, 'category': 'Clothing'},
        {'id': '3', 'name': 'Product 3', 'combinedScore': 0.9, 'price': 200, 'category': 'Books'},
        {'id': '4', 'name': 'Product 4', 'combinedScore': 0.6, 'price': 75, 'category': 'Electronics'},
        {'id': '5', 'name': 'Product 5', 'combinedScore': 0.85, 'price': 150, 'category': 'Clothing'},
    ]

def get_mock_reviews():
    return [
        {'text': 'This product is amazing! I love it!', 'rating': 5, 'sentimentScore': 0.9},
        {'text': 'Very poor quality. Disappointed.', 'rating': 1, 'sentimentScore': 0.1},
        {'text': 'Good value for money.', 'rating': 4, 'sentimentScore': 0.7},
        {'text': 'Not worth the price.', 'rating': 2, 'sentimentScore': 0.3},
        {'text': 'Excellent product! Highly recommend!', 'rating': 5, 'sentimentScore': 0.8},
        {'text': 'Works fine but nothing special.', 'rating': 3, 'sentimentScore': 0.5},
        {'text': 'Best purchase ever!', 'rating': 5, 'sentimentScore': 0.95},
        {'text': 'Terrible customer service.', 'rating': 2, 'sentimentScore': 0.2},
        {'text': 'Really good quality.', 'rating': 4, 'sentimentScore': 0.75},
        {'text': 'Would buy again.', 'rating': 4, 'sentimentScore': 0.7},
    ]

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("Starting Prorasys AI Service...")
    print(f"Firebase: {'Connected' if db else 'Using mock data'}")
    print(f"Models: Ready")
    print(f"Server: http://localhost:8000")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)