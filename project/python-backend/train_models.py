import json
import sys

from app import db, recommendation_engine, sentiment_analyzer, trust_calculator


def train_all_models() -> bool:
    if db is None:
        print("Training failed: Firebase is not connected.")
        return False

    try:
        reviews = [snapshot.to_dict() for snapshot in db.collection('reviews').stream()]
    except Exception as error:
        print(f"Training failed while loading Firestore reviews: {error}")
        return False

    if not reviews:
        print("Training failed: no Firestore reviews are available.")
        return False

    print(f"Training models from {len(reviews)} Firestore reviews...")
    sentiment_analyzer.train(reviews)
    recommendation_engine.train(reviews)
    trust_calculator.train(reviews)

    readiness = {
        "sentiment": sentiment_analyzer.is_trained,
        "recommendation": recommendation_engine.is_trained,
        "trust": trust_calculator.is_trained,
    }
    print(json.dumps({"models": readiness, "reviews_used": len(reviews)}, indent=2))
    return all(readiness.values())


if __name__ == "__main__" and not train_all_models():
    sys.exit(1)