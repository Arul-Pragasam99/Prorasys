import numpy as np
from typing import List, Dict
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import json
import os
import pickle
from pathlib import Path

class TrustScoreCalculator:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_path = Path(__file__).resolve().parent / 'saved' / 'trust_model.pkl'
        
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.build_model()

    @property
    def is_trained(self) -> bool:
        return (
            self.model is not None
            and self.scaler is not None
            and hasattr(self.model, 'estimators_')
            and hasattr(self.scaler, 'mean_')
        )
    
    def build_model(self):
        """Build trust score model"""
        self.model = RandomForestRegressor(
            n_estimators=50,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        print("[OK] Trust model built with scikit-learn")
    
    def train(self, reviews_data: List[Dict]):
        """Train trust score model"""
        self.model = None
        self.scaler = None
        if not reviews_data:
            print("[WARN] No training data available")
            return
        
        try:
            # Prepare features for each product
            product_reviews = {}
            for review in reviews_data:
                product_id = review.get('productId', review.get('product_id', 'unknown'))
                if product_id not in product_reviews:
                    product_reviews[product_id] = []
                product_reviews[product_id].append(review)
            
            # Create training data
            X = []
            y = []
            
            for product_id, reviews in product_reviews.items():
                if len(reviews) < 2:
                    continue
                    
                # Extract features
                ratings = [r.get('rating', 3) for r in reviews]
                sentiment_scores = [r.get('sentimentScore', 0.5) for r in reviews]
                
                features = [
                    np.mean(ratings),  # Average rating
                    np.std(ratings) if len(ratings) > 1 else 0,  # Rating variance
                    np.mean(sentiment_scores),  # Average sentiment
                    np.std(sentiment_scores) if len(sentiment_scores) > 1 else 0,  # Sentiment variance
                    len(reviews),  # Number of reviews
                    min(1, len(reviews) / 50)  # Review volume (normalized)
                ]
                
                # Calculate target trust score (using weighted combination)
                trust_score = (
                    0.4 * np.mean(ratings) / 5 +
                    0.3 * np.mean(sentiment_scores) +
                    0.2 * min(1, len(reviews) / 50) +
                    0.1 * (1 - (np.std(ratings) / 5 if len(ratings) > 1 else 0))
                )
                
                X.append(features)
                y.append(trust_score)
            
            if X and len(X) > 5:
                # Convert X to numpy array
                X_array = np.array(X)
                y_array = np.array(y)
                
                # Check if scaler is initialized
                if self.scaler is not None:
                    X_scaled = self.scaler.fit_transform(X_array)
                else:
                    self.scaler = StandardScaler()
                    X_scaled = self.scaler.fit_transform(X_array)
                
                # Check if model is initialized
                if self.model is not None:
                    self.model.fit(X_scaled, y_array)
                else:
                    self.model = RandomForestRegressor(
                        n_estimators=50,
                        max_depth=10,
                        random_state=42,
                        n_jobs=-1
                    )
                    self.model.fit(X_scaled, y_array)
                    
                self.save_model()
                print(f"[OK] Trust model trained with {len(X)} products")
            else:
                print("[WARN] Not enough data for trust model training (need at least 6 products)")
                
        except Exception as e:
            print(f"[WARN] Could not train trust model: {e}")
    
    def calculate(self, reviews: List[Dict]) -> Dict:
        """Calculate trust score for a product"""
        if not reviews:
            return {
                'trustScore': 0.5,
                'avgRating': 0,
                'sentimentScore': 0.5,
                'reviewCount': 0,
                'trustLevel': 'no_reviews'
            }

        if not self.is_trained:
            raise RuntimeError('Trained trust model is not available.')
        model = self.model
        scaler = self.scaler
        if model is None or scaler is None:
            raise RuntimeError('Trained trust model is not available.')
        
        # Extract features
        ratings = [r.get('rating', 3) for r in reviews]
        sentiment_scores = [r.get('sentimentScore', 0.5) for r in reviews]
        
        # Calculate metrics
        avg_rating = np.mean(ratings)
        avg_sentiment = np.mean(sentiment_scores)
        review_count = len(reviews)
        
        features = np.array([[
            avg_rating,
            np.std(ratings) if len(ratings) > 1 else 0,
            avg_sentiment,
            np.std(sentiment_scores) if len(sentiment_scores) > 1 else 0,
            review_count,
            min(1, review_count / 50)
        ]])
        features_scaled = scaler.transform(features)
        trust_score = float(model.predict(features_scaled)[0])
        trust_score = max(0, min(1, trust_score))
        
        # Determine trust level
        if trust_score >= 0.8:
            trust_level = "high"
        elif trust_score >= 0.6:
            trust_level = "medium"
        elif trust_score >= 0.4:
            trust_level = "low"
        else:
            trust_level = "critical"
        
        return {
            'trustScore': trust_score,
            'avgRating': avg_rating,
            'sentimentScore': avg_sentiment,
            'reviewCount': review_count,
            'trustLevel': trust_level
        }
    
    def save_model(self):
        """Save the trained model"""
        Path(self.model_path).parent.mkdir(parents=True, exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler
            }, f)
        print("[OK] Trust model saved successfully")
    
    def load_model(self):
        """Load the trained model"""
        try:
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.model = data.get('model')
                self.scaler = data.get('scaler')
            print("[OK] Trust model loaded successfully")
        except:
            print("[WARN] Could not load trust model. Building new one.")
            self.build_model()