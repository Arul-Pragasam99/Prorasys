import requests
import json

# Base URL for AI service
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("=" * 50)
    print("🔍 Testing Health Check")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Status Code: {response.status_code}")
        print(f"📊 Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_status():
    """Test status endpoint"""
    print("\n" + "=" * 50)
    print("📊 Testing AI Service Status")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/api/ai/status")
        print(f"✅ Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Status: {result.get('status', 'N/A')}")
            print(f"   Firebase: {'✅' if result.get('firebase') else '❌'}")
            print(f"   Models:")
            for model, loaded in result.get('models', {}).items():
                print(f"      - {model}: {'✅' if loaded else '❌'}")
            return True
        else:
            print(f"⚠️ Status endpoint returned: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_train():
    """Test training endpoints"""
    print("\n" + "=" * 50)
    print("🧠 Testing Model Training")
    print("=" * 50)
    
    try:
        response = requests.post(f"{BASE_URL}/api/ai/train")
        print(f"✅ Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"📊 Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"⚠️ Training returned: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_sentiment():
    """Test sentiment analysis"""
    print("\n" + "=" * 50)
    print("💬 Testing Sentiment Analysis")
    print("=" * 50)
    
    test_reviews = [
        {
            "product_id": "prod_1",
            "user_id": "user_1",
            "rating": 5,
            "text": "This product is absolutely amazing! Best purchase ever!"
        },
        {
            "product_id": "prod_2",
            "user_id": "user_2",
            "rating": 1,
            "text": "Terrible quality. Broke after one use."
        },
        {
            "product_id": "prod_3",
            "user_id": "user_3",
            "rating": 3,
            "text": "It's okay, nothing special but works."
        }
    ]
    
    all_passed = True
    for review in test_reviews:
        print(f"\n📝 Review: {review['text']}")
        try:
            response = requests.post(
                f"{BASE_URL}/api/ai/analyze-sentiment",
                json=review
            )
            if response.status_code == 200:
                result = response.json()
                print(f"   😊 Sentiment: {result.get('sentiment', 'N/A')}")
                print(f"   📊 Score: {result.get('sentimentScore', 0):.2f}")
                print(f"   ⭐ Combined: {result.get('combinedScore', 0):.2f}")
            else:
                print(f"   ❌ Error: {response.status_code} - {response.text}")
                all_passed = False
        except Exception as e:
            print(f"   ❌ Error: {e}")
            all_passed = False
    
    return all_passed

def test_recommendations():
    """Test recommendations"""
    print("\n" + "=" * 50)
    print("🎯 Testing Recommendations")
    print("=" * 50)
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/recommendations",
            json={
                "user_id": "test_user",
                "num_recommendations": 5
            }
        )
        print(f"✅ Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"📊 Total Products: {result.get('total_products', 0)}")
            print(f"🎁 Recommendations: {len(result.get('recommendations', []))}")
            
            for i, rec in enumerate(result.get('recommendations', [])[:3], 1):
                score = rec.get('recommendation_score', 0)
                name = rec.get('name', 'Unknown')
                print(f"   {i}. {name} - Score: {score:.2f}")
            return True
        else:
            print(f"⚠️ Recommendations error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_trust_score():
    """Test trust score calculation"""
    print("\n" + "=" * 50)
    print("⭐ Testing Trust Score")
    print("=" * 50)
    
    try:
        response = requests.post(f"{BASE_URL}/api/ai/trust-score/test_product_1")
        print(f"✅ Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Trust Score: {result.get('trustScore', 0):.2f}")
            print(f"   Trust Level: {result.get('trustLevel', 'N/A')}")
            print(f"   Reviews: {result.get('reviewCount', 0)}")
            print(f"   Avg Rating: {result.get('avgRating', 0):.1f}")
            return True
        else:
            print(f"⚠️ Trust score error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting AI Service Tests")
    print("Make sure the AI service is running at http://localhost:8000")
    print()
    
    # Check if service is running first
    try:
        response = requests.get(f"{BASE_URL}/")
        print("✅ AI Service is running!\n")
    except:
        print("❌ AI Service is NOT running!")
        print("Please start it first with: python app.py")
        return
    
    # Run all tests
    results = {
        "Health Check": test_health(),
        "Status Check": test_status(),
        "Model Training": test_train(),
        "Sentiment Analysis": test_sentiment(),
        "Recommendations": test_recommendations(),
        "Trust Score": test_trust_score()
    }
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! AI service is working perfectly!")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()