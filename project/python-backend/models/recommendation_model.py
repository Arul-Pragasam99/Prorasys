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
        self.user_item_matrix = None
        self.svd_model = None
        self.product_features = None
        self.model = None
        if not reviews_data:
            print("[WARN] No training data available")
            return
        
        try:
            # Create user-item matrix
            df = pd.DataFrame(reviews_data)
            
            # Train only from actual user/product/rating records.
            if not {'userId', 'productId', 'rating'}.issubset(df.columns):
                print("[WARN] Reviews lack user, product, or rating fields")
                return
            df = df[['userId', 'productId', 'rating']].dropna()
            df = df[df['rating'].between(1, 5)]

            if len(df) < 10 or df['userId'].nunique() < 2 or df['productId'].nunique() < 2:
                print("[WARN] Not enough distinct user/product ratings for recommendation training")
                return
            
            # Create pivot table
            user_item_matrix = df.pivot_table(
                index='userId',
                columns='productId',
                values='rating',
                fill_value=0
            )
            
            # Apply SVD for dimensionality reduction
            n_components = min(20, len(user_item_matrix.columns) - 1, len(user_item_matrix.index))
            if n_components < 1:
                print("[WARN] Not enough user/product dimensions for recommendation training")
                return
                
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
        """Rank products with trained SVD ratings and a trained-data cold-start baseline."""
        if not self.is_trained:
            raise RuntimeError('Trained recommendation model is not available.')

        matrix = self.user_item_matrix
        if matrix is None or self.svd_model is None:
            raise RuntimeError('Trained recommendation model is not available.')

        if user_id in matrix.index:
            user_vector = matrix.loc[[user_id]]
            latent_vector = self.svd_model.transform(user_vector)
            predicted_ratings = latent_vector @ self.svd_model.components_
            product_scores = dict(zip(matrix.columns, predicted_ratings[0]))
        else:
            # Cold-start users use the mean of observed ratings from the training matrix.
            product_scores = matrix.replace(0, np.nan).mean(axis=0).dropna().to_dict()

        interacted_ids = {
            str(item.get('id')) for item in user_interactions
            if isinstance(item, dict) and item.get('id') is not None
        }
        product_by_id = {str(product.get('id')): product for product in all_products}
        ranked = []
        for product_id, rating in product_scores.items():
            product_key = str(product_id)
            product = product_by_id.get(product_key)
            if product is None or product_key in interacted_ids:
                continue
            ranked.append({
                **product,
                'recommendation_score': max(0.0, min(1.0, float(rating) / 5.0)),
            })

        return sorted(ranked, key=lambda product: product['recommendation_score'], reverse=True)[:num_recommendations]
    
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