import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict
import json
import os
import pickle

class RecommendationEngine:
    def __init__(self):
        self.user_item_matrix = None
        self.svd_model = None
        self.product_features = None
        self.model = None
        self.model_path = "models/saved/recommendation_model.pkl"
        
        # Load pre-trained model if exists
        if os.path.exists(self.model_path):
            self.load_model()

    @property
    def is_trained(self) -> bool:
        return (
            self.model is not None
            and self.svd_model is not None
            and self.user_item_matrix is not None
            and hasattr(self.svd_model, 'components_')
        )
    
    def train(self, reviews_data: List[Dict]):
        """Train collaborative filtering model"""
        if not reviews_data:
            print("[WARN] No training data available")
            return
        
        try:
            # Create user-item matrix
            df = pd.DataFrame(reviews_data)
            
            # Extract user_id, product_id, rating
            if 'userId' not in df.columns:
                df['userId'] = [f"user_{i%10}" for i in range(len(df))]
            if 'productId' not in df.columns:
                df['productId'] = [f"product_{i%5}" for i in range(len(df))]
            
            df = df[['userId', 'productId', 'rating']].dropna()
            
            if len(df) < 10:
                print("[WARN] Not enough data for recommendation model")
                return
            
            # Create pivot table
            user_item_matrix = df.pivot_table(
                index='userId',
                columns='productId',
                values='rating',
                fill_value=0
            )
            
            # Apply SVD for dimensionality reduction
            n_components = min(20, len(user_item_matrix.columns) - 1)
            if n_components < 1:
                n_components = 1
                
            self.svd_model = TruncatedSVD(n_components=n_components, random_state=42)
            self.user_item_matrix = user_item_matrix
            self.model = self.svd_model
            self.user_features = self.svd_model.fit_transform(user_item_matrix)
            self.product_features = self.svd_model.components_.T
            
            print(f"[OK] Recommendation model trained with {len(df)} interactions")
            
            # Save model
            self.save_model()
        except Exception as e:
            print(f"[WARN] Could not train recommendation model: {e}")
    
    def get_recommendations(self, user_id: str, all_products: List[Dict], 
                           user_interactions: List, num_recommendations: int = 5) -> List[Dict]:
        """Get personalized recommendations"""
        try:
            # Get user's existing interactions
            interacted_product_ids = [p.get('id') for p in user_interactions if p.get('id')]
            
            # Get product IDs user hasn't interacted with
            candidate_products = [
                p for p in all_products 
                if p.get('id') not in interacted_product_ids
            ]
            
            if not candidate_products:
                # If no products to recommend, return top rated
                return sorted(
                    all_products,
                    key=lambda x: x.get('combinedScore', 0),
                    reverse=True
                )[:num_recommendations]
            
            # Simple content-based filtering
            for product in candidate_products:
                score = 0
                # Boost based on rating
                score += product.get('combinedScore', 0) * 0.5
                # Boost based on price (preference)
                price = product.get('price', 0)
                if price > 0:
                    score += 0.3 * (1 - min(price / 1000, 1))
                # Boost based on reviews
                score += min(product.get('reviewCount', 0) / 100, 1) * 0.2
                product['recommendation_score'] = score
            
            # Sort by score and return top N
            recommendations = sorted(
                candidate_products,
                key=lambda x: x.get('recommendation_score', 0),
                reverse=True
            )[:num_recommendations]
            
            return recommendations
            
        except Exception as e:
            print(f"[WARN] Recommendation error: {e}")
            # Fallback to top rated products
            return sorted(
                all_products,
                key=lambda x: x.get('combinedScore', 0),
                reverse=True
            )[:num_recommendations]
    
    def save_model(self):
        """Save the trained model"""
        os.makedirs('models/saved', exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'user_item_matrix': self.user_item_matrix,
                'svd_model': self.svd_model,
                'product_features': self.product_features,
                'model': self.model
            }, f)
        print("[OK] Recommendation model saved successfully")
    
    def load_model(self):
        """Load the trained model"""
        try:
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.user_item_matrix = data.get('user_item_matrix')
                self.svd_model = data.get('svd_model')
                self.product_features = data.get('product_features')
                self.model = data.get('model', self.svd_model)
            print("[OK] Recommendation model loaded successfully")
        except:
            print("[WARN] Could not load recommendation model")