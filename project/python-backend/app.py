from fastapi import FastAPI, HTTPException, Path, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, StringConstraints, validator
from typing import Annotated, Dict, Optional
import firebase_admin
from firebase_admin import credentials, firestore
import os
import hmac
import ipaddress
import re
import time
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

MAX_REQUEST_BYTES = 64 * 1024
RATE_LIMIT = 60
RATE_WINDOW_SECONDS = 60
rate_limit_buckets = {}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        'ALLOWED_ORIGINS', 'http://localhost:3000'
    ).split(',') if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key", "X-Training-Token"],
)

@app.middleware("http")
async def secure_api_requests(request: Request, call_next):
    if request.url.path.startswith('/api/') and request.method != 'OPTIONS':
        content_length = request.headers.get('content-length')
        if content_length:
            try:
                if int(content_length) > MAX_REQUEST_BYTES:
                    return JSONResponse({'detail': 'Request body is too large.'}, status_code=413)
            except ValueError:
                return JSONResponse({'detail': 'Invalid Content-Length.'}, status_code=400)

        api_key = os.getenv('AI_SERVICE_API_KEY')
        client_host = request.client.host if request.client else ''
        if api_key:
            supplied_key = request.headers.get('x-api-key', '')
            if not hmac.compare_digest(supplied_key, api_key):
                return JSONResponse({'detail': 'Unauthorized.'}, status_code=401)
        else:
            try:
                is_loopback = ipaddress.ip_address(client_host).is_loopback
            except ValueError:
                is_loopback = False
            if not is_loopback:
                return JSONResponse(
                    {'detail': 'Configure AI_SERVICE_API_KEY for non-local access.'},
                    status_code=503,
                )

        now = time.monotonic()
        bucket_key = (client_host, request.url.path)
        count, reset_at = rate_limit_buckets.get(bucket_key, (0, now + RATE_WINDOW_SECONDS))
        if reset_at <= now:
            count, reset_at = 0, now + RATE_WINDOW_SECONDS
        if count >= RATE_LIMIT:
            return JSONResponse(
                {'detail': 'Too many requests. Please try again later.'},
                status_code=429,
                headers={'Retry-After': str(max(1, int(reset_at - now)))},
            )
        rate_limit_buckets[bucket_key] = (count + 1, reset_at)
        if len(rate_limit_buckets) > 5000:
            for key, value in list(rate_limit_buckets.items()):
                if value[1] <= now:
                    rate_limit_buckets.pop(key, None)
            for key in list(rate_limit_buckets):
                if len(rate_limit_buckets) <= 5000:
                    break
                rate_limit_buckets.pop(key, None)

    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# Initialize Firebase Admin - Using service-account.json file
def init_firebase():
    try:
        if os.path.exists('service-account.json'):
            cred = credentials.Certificate('service-account.json')
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase connected using service-account.json")
            return firestore.client()
        if os.getenv('FIREBASE_ADMIN_PRIVATE_KEY'):
            cred = credentials.Certificate({
                'type': 'service_account',
                'project_id': os.getenv('FIREBASE_ADMIN_PROJECT_ID'),
                'private_key': os.getenv('FIREBASE_ADMIN_PRIVATE_KEY', '').replace('\\n', '\n'),
                'client_email': os.getenv('FIREBASE_ADMIN_CLIENT_EMAIL'),
                'token_uri': 'https://oauth2.googleapis.com/token',
            })
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase connected using environment credentials")
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
RequestId = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=128)]
ReviewText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=5000)]
TimestampText = Annotated[str, StringConstraints(max_length=64)]
ReviewRating = Annotated[int, Field(strict=True, ge=1, le=5)]
RecommendationCount = Annotated[int, Field(strict=True, ge=1, le=50)]

class RequestModel(BaseModel):
    class Config:
        extra = 'forbid'

    @validator('product_id', 'user_id', check_fields=False)
    def validate_identifier(cls, value):
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', value):
            raise ValueError('Invalid identifier.')
        return value

class ReviewData(RequestModel):
    product_id: RequestId
    user_id: RequestId
    rating: ReviewRating
    text: ReviewText
    timestamp: Optional[TimestampText] = None

class RecommendationRequest(RequestModel):
    user_id: RequestId
    num_recommendations: RecommendationCount = 5

# Helper to extract features from text (Python version)
def extract_features_from_text(text: str, category: str = 'general') -> Dict[str, float]:
    """Extract feature scores from review text"""
    feature_scores = {}
    
    # Define feature categories
    feature_categories = {
        'electronics': ['battery', 'display', 'performance', 'sound', 'camera', 'design', 'durability'],
        'wearables': ['health_tracking', 'battery', 'display', 'design', 'comfort'],
        'audio': ['sound', 'comfort', 'connectivity', 'battery', 'noise_cancellation'],
        'home_kitchen': ['versatility', 'ease_of_use', 'durability', 'design', 'value'],
        'fashion': ['comfort', 'durability', 'design', 'quality', 'fit'],
        'general': ['quality', 'design', 'durability', 'price', 'value']
    }
    
    # Get features for category
    features = feature_categories.get(category.lower(), feature_categories['general'])
    
    # Sentiment words
    positive_words = ['good', 'great', 'amazing', 'excellent', 'awesome', 'fantastic', 'perfect', 
                      'best', 'love', 'like', 'beautiful', 'wonderful', 'superb', 'outstanding',
                      'superior', 'exceptional', 'flawless', 'impressive', 'satisfied', 'happy']
    negative_words = ['bad', 'terrible', 'poor', 'awful', 'horrible', 'worst', 'hate', 'disappointed',
                      'disappointing', 'fail', 'failure', 'useless', 'waste', 'annoying', 'frustrating']
    
    text_lower = text.lower()
    words = text_lower.split()
    
    for feature in features:
        score = 0.5  # Neutral baseline
        feature_mentions = 0
        
        # Check if feature is mentioned
        if feature in text_lower or any(word in text_lower for word in feature.split('_')):
            feature_mentions += 1
            
            # Check surrounding words for sentiment
            for i, word in enumerate(words):
                if feature in word or word in feature:
                    # Look at surrounding context
                    start = max(0, i - 3)
                    end = min(len(words), i + 4)
                    context = words[start:end]
                    
                    positive_count = sum(1 for w in context if w in positive_words)
                    negative_count = sum(1 for w in context if w in negative_words)
                    
                    if positive_count > negative_count:
                        score += 0.1
                    elif negative_count > positive_count:
                        score -= 0.1
        
        # If feature mentioned multiple times, adjust score
        if feature_mentions > 0:
            # Boost if mentioned many times (positive sentiment)
            if feature_mentions > 2:
                score += 0.05
            score = max(0.1, min(0.95, score))
            feature_scores[feature] = score
    
    return feature_scores

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
    """Analyze sentiment using local model and update product"""
    try:
        # 1. READ REVIEW TEXT → ANALYZE SENTIMENT
        sentiment_result = sentiment_analyzer.analyze(review.text)
        
        # 2. CALCULATE SENTIMENT SCORE
        rating_score = review.rating / 5.0
        sentiment_score = sentiment_result['score']
        
        # 3. UPDATE COMBINED SCORE
        combined_score = (sentiment_score + rating_score) / 2
        
        # 4. EXTRACT FEATURES FROM REVIEW
        # Get product category from Firestore
        product_category = 'general'
        if db:
            try:
                product_doc = db.collection('products').document(review.product_id).get()
                if product_doc.exists:
                    product_category = product_doc.to_dict().get('category', 'general')
            except:
                pass
        
        feature_scores = extract_features_from_text(review.text, product_category)
        
        # 5. SAVE REVIEW TO FIRESTORE
        review_data = {
            'productId': review.product_id,
            'userId': review.user_id,
            'rating': review.rating,
            'text': review.text,
            'sentimentScore': sentiment_score,
            'combinedScore': combined_score,
            'sentimentLabel': sentiment_result['label'],
            'timestamp': review.timestamp or datetime.now().isoformat(),
            'featureScores': feature_scores,
        }
        
        if db:
            # Save review
            review_ref = db.collection('reviews').document()
            review_ref.set(review_data)
            print(f"[OK] Review saved to Firestore: {review.product_id}")
            
            # 6. UPDATE PRODUCT IN FIRESTORE
            try:
                # Get all reviews for this product
                reviews_query = db.collection('reviews').where('productId', '==', review.product_id).stream()
                all_reviews = []
                for doc in reviews_query:
                    all_reviews.append(doc.to_dict())
                
                if all_reviews:
                    # Calculate average rating
                    ratings = [r.get('rating', 3) for r in all_reviews]
                    avg_rating = sum(ratings) / len(ratings)
                    
                    # Calculate average sentiment
                    sentiments = [r.get('sentimentScore', 0.5) for r in all_reviews]
                    avg_sentiment = sum(sentiments) / len(sentiments)
                    
                    # Calculate combined score
                    avg_combined = sum([r.get('combinedScore', 0.5) for r in all_reviews]) / len(all_reviews)
                    
                    # Calculate trust level
                    trust_result = trust_calculator.calculate(all_reviews)
                    
                    # Aggregate feature scores from all reviews
                    aggregated_features = {}
                    for r in all_reviews:
                        if r.get('featureScores'):
                            for feature, score in r['featureScores'].items():
                                if feature not in aggregated_features:
                                    aggregated_features[feature] = []
                                aggregated_features[feature].append(score)
                    
                    # Average feature scores
                    final_feature_scores = {}
                    for feature, scores in aggregated_features.items():
                        final_feature_scores[feature] = sum(scores) / len(scores)
                    
                    # Update product
                    product_ref = db.collection('products').document(review.product_id)
                    product_ref.update({
                        'avgRating': avg_rating,
                        'combinedScore': avg_combined,
                        'sentimentScore': avg_sentiment,
                        'trustLevel': trust_result['trustLevel'],
                        'reviewCount': len(all_reviews),
                        'featureScores': final_feature_scores,
                        'updatedAt': datetime.now().isoformat()
                    })
                    print(f"[OK] Product {review.product_id} updated in Firestore")
                    print(f"   - Avg Rating: {avg_rating:.2f}")
                    print(f"   - Combined Score: {avg_combined:.2f}")
                    print(f"   - Trust Level: {trust_result['trustLevel']}")
                    print(f"   - Review Count: {len(all_reviews)}")
                    print(f"   - Features: {len(final_feature_scores)}")
            except Exception as e:
                print(f"[WARN] Error updating product: {e}")
        else:
            print(f"[INFO] Review saved locally (mock mode): {review.product_id}")
        
        return {
            'sentiment': sentiment_result['label'],
            'sentimentScore': sentiment_score,
            'ratingScore': rating_score,
            'combinedScore': combined_score,
            'featureScores': feature_scores,
            'savedToFirebase': db is not None
        }
    except Exception as e:
        print(f"[ERROR] Sentiment analysis failed: {e}")
        raise HTTPException(status_code=500, detail='Unable to analyze review.')

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
        print(f"[ERROR] Recommendations failed: {e}")
        raise HTTPException(status_code=500, detail='Unable to get recommendations.')

@app.post("/api/ai/trust-score/{product_id}")
async def calculate_trust_score(
    product_id: str = Path(..., min_length=1, max_length=128)
):
    """Calculate trust score"""
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', product_id):
        raise HTTPException(status_code=400, detail='Invalid product ID.')

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
        print(f"[ERROR] Trust score calculation failed: {e}")
        raise HTTPException(status_code=500, detail='Unable to calculate trust score.')

@app.post("/api/ai/train")
async def train_models(request: Request):
    """Train all AI models with existing data"""
    training_token = os.getenv('AI_TRAINING_TOKEN')
    if not training_token:
        raise HTTPException(status_code=503, detail='Model training is disabled.')
    supplied_token = request.headers.get('x-training-token', '')
    if not hmac.compare_digest(supplied_token, training_token):
        raise HTTPException(status_code=401, detail='Unauthorized.')

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
        raise HTTPException(status_code=500, detail='Unable to train models.')

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