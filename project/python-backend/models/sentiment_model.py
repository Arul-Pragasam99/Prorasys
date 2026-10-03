import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import json
import os
from typing import Dict, List
from nltk.corpus import stopwords
import re
import pickle

class SentimentAnalyzer:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.model_path = "models/saved/sentiment_model.pkl"
        self.vectorizer_path = "models/saved/vectorizer.pkl"
        self._model_validated = False
        
        # Load pre-trained model if exists
        if os.path.exists(self.model_path):
            self.load_model()

    @property
    def is_trained(self) -> bool:
        return self._model_validated and self._has_fitted_model()

    def _has_fitted_model(self) -> bool:
        return (
            self.model is not None
            and self.vectorizer is not None
            and len(getattr(self.model, 'classes_', [])) > 1
            and hasattr(self.vectorizer, 'vocabulary_')
        )

    def _passes_smoke_test(self) -> bool:
        model = self.model
        vectorizer = self.vectorizer
        if (
            model is None
            or vectorizer is None
            or len(getattr(model, 'classes_', [])) < 2
            or not hasattr(vectorizer, 'vocabulary_')
        ):
            return False

        samples = [
            'This product is excellent and amazing',
            'This product is terrible and poor',
        ]
        try:
            features = vectorizer.transform([self.preprocess_text(text) for text in samples])
            predictions = [int(label) for label in model.predict(features)]
            return predictions == [1, 0]
        except Exception:
            return False
    
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
        self.model = None
        self.vectorizer = None
        self._model_validated = False
        if not reviews_data:
            print("[WARN] No labeled review data available")
            return
        
        # Prepare data
        texts = []
        labels = []
        
        for r in reviews_data:
            text = r.get('text', '')
            if not text:
                continue
            sentiment_label = str(r.get('sentimentLabel', '')).lower()
            rating = r.get('rating')
            if sentiment_label == 'positive' or (sentiment_label not in ('positive', 'negative') and rating in (4, 5)):
                label = 1
            elif sentiment_label == 'negative' or (sentiment_label not in ('positive', 'negative') and rating in (1, 2)):
                label = 0
            else:
                continue
            texts.append(self.preprocess_text(text))
            labels.append(label)

        unique_labels = set(labels)
        if len(unique_labels) < 2:
            print("[WARN] Sentiment training requires both positive and negative labeled reviews")
            return

        if len(texts) < 10:
            print(f"[WARN] Only {len(texts)} labeled reviews; at least 10 are required")
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
            self._model_validated = self._passes_smoke_test()
            if not self._model_validated:
                print("[WARN] Sentiment model failed polarity checks and is unavailable")
                self.model = None
                self.vectorizer = None
                return
            print(f"[OK] Sentiment model trained with {len(texts)} reviews")
            print(f"   Positive: {sum(y)} reviews, Negative: {len(y) - sum(y)} reviews")
            self.save_model()
        except Exception as e:
            print(f"[ERROR] Training error: {e}")
            self.model = None
            self.vectorizer = None
            self._model_validated = False
    
    def analyze(self, text: str) -> Dict:
        """Analyze sentiment of a single text"""
        if not self.is_trained:
            raise RuntimeError('Validated sentiment model is not available.')
        model = self.model
        if model is None:
            raise RuntimeError('Validated sentiment model is not available.')
        
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            if not processed_text:
                raise ValueError('Review text contains no analyzable words.')
            
            if self.vectorizer is None:
                raise RuntimeError('Validated sentiment vectorizer is not available.')
            X = self.vectorizer.transform([processed_text])
            
            # Predict
            prediction = model.predict_proba(X)[0]
            
            if len(prediction) < 2:
                raise RuntimeError('Sentiment model was not trained for both classes.')
            
            score = float(prediction[1])  # Probability of positive
            
            return {
                'label': 'POSITIVE' if score > 0.5 else 'NEGATIVE',
                'score': score
            }
        except Exception as e:
            print(f"[WARN] Analysis error: {e}")
            raise RuntimeError('Sentiment model inference failed.') from e
    
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
            self._model_validated = self._passes_smoke_test()
            if not self._model_validated:
                raise ValueError('Saved sentiment model failed polarity checks.')
            print("[OK] Sentiment model loaded successfully")
        except:
            print("[WARN] Could not load a validated sentiment model.")
            self.model = None
            self.vectorizer = None
            self._model_validated = False