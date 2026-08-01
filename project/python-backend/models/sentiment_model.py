import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import json
import os
from typing import Dict, List
import nltk
from nltk.corpus import stopwords
import re
import pickle

# Download NLTK data (first time)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

class SentimentAnalyzer:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.model_path = "models/saved/sentiment_model.pkl"
        self.vectorizer_path = "models/saved/vectorizer.pkl"
        
        # Load pre-trained model if exists
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.build_model()
    
    def preprocess_text(self, text):
        """Clean and preprocess text"""
        if not text:
            return ""
        # Lowercase
        text = text.lower()
        # Remove special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Remove stopwords
        try:
            stop_words = set(stopwords.words('english'))
            words = text.split()
            words = [w for w in words if w not in stop_words]
            return ' '.join(words)
        except:
            return text
    
    def build_model(self):
        """Build a simple logistic regression model for sentiment analysis"""
        self.vectorizer = TfidfVectorizer(max_features=1000)
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        print("[OK] Sentiment model built with scikit-learn")
    
    def train(self, reviews_data: List[Dict]):
        """Train the sentiment model with review data"""
        if not reviews_data:
            print("[WARN] No training data available - using mock data")
            reviews_data = self.get_mock_training_data()
        
        # Prepare data
        texts = []
        labels = []
        
        for r in reviews_data:
            text = r.get('text', '')
            if not text:
                continue
            rating = r.get('rating', 3)
            
            texts.append(self.preprocess_text(text))
            # Convert ratings to binary sentiment (1 = positive, 0 = negative)
            label = 1 if rating > 3 else 0
            labels.append(label)
        
        if len(texts) < 10:
            print(f"[WARN] Only {len(texts)} reviews. Adding more mock data...")
            mock_reviews = self.get_mock_training_data()
            for r in mock_reviews:
                text = r.get('text', '')
                if text:
                    texts.append(self.preprocess_text(text))
                    rating = r.get('rating', 3)
                    labels.append(1 if rating > 3 else 0)
        
        # Check if we have both classes
        unique_labels = set(labels)
        if len(unique_labels) < 2:
            print("[WARN] Need both positive and negative examples. Adding balanced data...")
            balanced_reviews = [
                {'text': 'This product is amazing! I love it!', 'rating': 5},
                {'text': 'Very poor quality. Disappointed.', 'rating': 1},
                {'text': 'Good value for money.', 'rating': 4},
                {'text': 'Not worth the price.', 'rating': 2},
                {'text': 'Excellent product! Highly recommend!', 'rating': 5},
                {'text': 'Terrible experience. Would not buy again.', 'rating': 1},
            ]
            for r in balanced_reviews:
                text = r.get('text', '')
                if text:
                    texts.append(self.preprocess_text(text))
                    rating = r.get('rating', 3)
                    labels.append(1 if rating > 3 else 0)
        
        if len(texts) < 10:
            print("[ERROR] Still not enough training data")
            return
        
        # Convert to numpy arrays
        if self.vectorizer is not None:
            X = self.vectorizer.fit_transform(texts)
        else:
            self.vectorizer = TfidfVectorizer(max_features=1000)
            X = self.vectorizer.fit_transform(texts)
            
        y = np.array(labels)
        
        # Train model
        try:
            if self.model is not None:
                self.model.fit(X, y)
            else:
                self.model = LogisticRegression(max_iter=1000, random_state=42)
                self.model.fit(X, y)
            print(f"[OK] Sentiment model trained with {len(texts)} reviews")
            print(f"   Positive: {sum(y)} reviews, Negative: {len(y) - sum(y)} reviews")
            self.save_model()
        except Exception as e:
            print(f"[ERROR] Training error: {e}")
    
    def get_mock_training_data(self):
        """Generate mock training data"""
        return [
            {'text': 'This product is amazing! Best purchase ever!', 'rating': 5},
            {'text': 'Very poor quality. Broke after one use.', 'rating': 1},
            {'text': 'Good value for money.', 'rating': 4},
            {'text': 'Not worth the price.', 'rating': 2},
            {'text': 'Excellent product! Highly recommend!', 'rating': 5},
            {'text': 'Terrible experience. Would not buy again.', 'rating': 1},
            {'text': 'Great product, works perfectly!', 'rating': 5},
            {'text': 'Disappointing quality.', 'rating': 2},
            {'text': 'Really good quality.', 'rating': 4},
            {'text': 'Worst purchase ever.', 'rating': 1},
            {'text': 'Works fine, nothing special.', 'rating': 3},
            {'text': 'Absolutely fantastic!', 'rating': 5},
            {'text': 'Not worth it.', 'rating': 2},
            {'text': 'Highly recommended!', 'rating': 5},
            {'text': 'Poor customer service.', 'rating': 2},
        ]
    
    def analyze(self, text: str) -> Dict:
        """Analyze sentiment of a single text"""
        if self.model is None:
            print("[WARN] Model not trained. Using rule-based fallback.")
            return self.rule_based_sentiment(text)
        
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            if not processed_text:
                return {'label': 'NEUTRAL', 'score': 0.5}
            
            # Transform text
            if self.vectorizer is not None:
                X = self.vectorizer.transform([processed_text])
            else:
                self.vectorizer = TfidfVectorizer(max_features=1000)
                X = self.vectorizer.transform([processed_text])
            
            # Predict
            prediction = self.model.predict_proba(X)[0]
            
            # Handle case where model might have only 1 class
            if len(prediction) < 2:
                return self.rule_based_sentiment(text)
            
            score = float(prediction[1])  # Probability of positive
            
            return {
                'label': 'POSITIVE' if score > 0.5 else 'NEGATIVE',
                'score': score
            }
        except Exception as e:
            print(f"[WARN] Analysis error: {e}")
            return self.rule_based_sentiment(text)
    
    def rule_based_sentiment(self, text: str) -> Dict:
        """Simple rule-based sentiment as fallback"""
        text = text.lower()
        positive_words = ['good', 'great', 'amazing', 'excellent', 'fantastic', 'awesome', 'love', 'best', 'wonderful']
        negative_words = ['bad', 'terrible', 'poor', 'awful', 'horrible', 'worst', 'hate', 'disappointing', 'not worth']
        
        score = 0.5
        for word in positive_words:
            if word in text:
                score += 0.1
        for word in negative_words:
            if word in text:
                score -= 0.1
        
        score = max(0, min(1, score))
        
        return {
            'label': 'POSITIVE' if score > 0.5 else 'NEGATIVE' if score < 0.5 else 'NEUTRAL',
            'score': score
        }
    
    def save_model(self):
        """Save the trained model"""
        os.makedirs('models/saved', exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.vectorizer_path, 'wb') as f:
            pickle.dump(self.vectorizer, f)
        print("[OK] Sentiment model saved successfully")
    
    def load_model(self):
        """Load the trained model"""
        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(self.vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            print("[OK] Sentiment model loaded successfully")
        except:
            print("[WARN] Could not load saved model. Building new one.")
            self.build_model()